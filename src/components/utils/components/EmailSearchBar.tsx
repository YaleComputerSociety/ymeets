import { useState, useMemo, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../../backend/firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { sendEventEmail } from '../../../emails/sendEmailHelpers';
import { send } from 'node:process';



class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;

    for (const ch of word) {
      let next = node.children.get(ch);
      if (!next) {
        next = new TrieNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    node.isWord = true;
  }

  prefixSearch(prefix: string): string[] {
    let arr: string[] = [];
    let node = this.root;

    // get to end of prefix
    for (const ch of prefix) {
      const next = node.children.get(ch);
      if (!next) {
        return arr;
      }
      node = next;
    }

    // search out from here (dfs)
    const stack: Array<[TrieNode, string]> = [[node, prefix]];

    while (stack.length > 0) {
      const n = stack.pop()!;
      if (n[0].isWord) {
        arr.push(n[1]);
      }
      for (const [ch, next] of n[0].children) {
        stack.push([next, n[1] + ch]);
      }
    }

    return arr;
    
  }
}

function invitationEmailHtml(
  customEventCode: string,
  eventTitle: string,
  yourName: string
): string {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:24px;">
            
            <h2 style="margin-top:0;">You’ve been invited to an event</h2>

            <p>
              <strong>${yourName}</strong> invited you to join:
            </p>

            <h3 style="margin-top:8px;">${eventTitle}</h3>

            <p>
              Click below to view details and respond:
            </p>

            <p>
              <a 
                href="https://ymeets.com/dashboard/${customEventCode}" 
                style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold;">
                View Invitation
              </a>
            </p>

            <p style="font-size:14px;color:#666;">
              Or paste this link into your browser:
              <br />
              https://ymeets.com/dashboard/${customEventCode}
            </p>

            <p style="font-size:12px;color:#999;">
              Event code: ${customEventCode}
            </p>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

type EmailProps = {
  Code?: string;
  Title?: string;
  Name?: string
};

export default function EmailSearchBar({
  Code,
  Title,
  Name
} : EmailProps
)  {
    const customEventCode = Code ?? '';
    const eventTitle = Title ?? 'Unnamed Event';
    const yourName = Name ?? '';

    const emailHtml = invitationEmailHtml(customEventCode, eventTitle, yourName);
    const subject = `You've been invited to ${eventTitle}`;

    const [search, setSearch] = useState('');
    const [invites, setInvites] = useState<string[]>([]);
    const [emails, setEmails] = useState<string[]>([]);




    // get emails from database. (organized in shards of 2000 emails)
    async function fetchEmails(): Promise<string[]> {
      const q = query(
        collection(db, "emails"),   
        orderBy("shardIndex")     
      );

      const snap = await getDocs(q);

      const allEmails: string[] = [];

      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (Array.isArray(data.emails)) {
          allEmails.push(...data.emails);
        }
      });

      return allEmails;
    }

    useEffect(() => {
        fetchEmails().then(setEmails);
    }, []);

    // useMemo to prevent reinserting everything every refresh
    const trie = useMemo(() => {
        const t = new Trie();
        for (const email of emails) t.insert(email);
        return t;
    }, [emails]);

    // get matches whenever search changes
    const matches = useMemo(() => {
        // clean input
        const q = search.trim().toLowerCase();

        if (q.length < 3) {
            return [];
        }
        return trie.prefixSearch(q).filter((e) => !invites.includes(e)) //.slice(0, 20); //filter out already invited and only return first 20
    }, [trie, search]);

    function add(email: string) {
        setInvites((prev) => (prev.includes(email) ? prev : [...prev, email]));
        setSearch("");
    }

    function remove(email: string) {
        setInvites((prev) => prev.filter((x) => x !== email));
    }

    async function sendEmails() {
      await Promise.all(
        invites.map((invites) => sendEventEmail(invites, subject, emailHtml, customEventCode))
      );
      // clear invites
        setInvites([]);
    }

    //TODO: spacing on invite box is fucked


    return (
        <div className="invite-picker flex-1 min-w-0 text-xs">
  <div className="invite-picker__search relative w-full">
    <input
      className="invite-picker__input w-full px-2 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      type="text"
      placeholder="Search emails"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const value = (e.currentTarget as HTMLInputElement).value.trim();
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

          if (value && isEmail && !invites.includes(value)) {
            add(value);
          }
        }
      }}
    />

    {matches.length > 0 && (
      <div className="invite-picker__dropdown absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md max-h-32 overflow-y-auto z-50">
        {matches.map((email) => (
          <button
            key={email}
            className="invite-picker__option block w-full text-left px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
            onClick={() => add(email)}
          >
            {email}
          </button>
        ))}
      </div>
    )}
  </div>

  <h4 className="invite-picker__title text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-2 mb-1 uppercase tracking-wider">
    Invites
  </h4>

  <div className="invite-picker__invites max-h-24 overflow-y-auto">
    <ul className="invite-picker__invite-list space-y-1">
      {invites.map((email) => (
        <li
          key={email}
          className="invite-picker__invite-item flex items-center justify-between px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
        >
          <span className="invite-picker__invite-email text-xs text-gray-700 dark:text-gray-200 truncate">
            {email}
          </span>

          <button
            className="invite-picker__remove text-[11px] text-red-500 hover:text-red-600"
            type="button"
            onClick={() => remove(email)}
          >
            remove
          </button>
        </li>
      ))}
    </ul>
  </div>

  <button
    id="submit"
    className="w-full mt-2 text-xs py-1.5 px-2 rounded-md bg-primary text-white hover:bg-primary/90 transition"
    onClick={() => sendEmails()}
  >
    Send
  </button>
</div>
        );




}
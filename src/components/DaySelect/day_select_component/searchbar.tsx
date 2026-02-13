import { useState, useMemo, useEffect } from 'react';
import "./searchbar.css";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../../backend/firebase';



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



export default function SearchBar() {
    const [search, setSearch] = useState('');
    const [invites, setInvites] = useState<string[]>([]);
    //const [emails, setEmails] = useState<string[]>([]);

    // Dunno if this works
    // async function fetchEmails(): Promise<string[]> {
    //     const ref = doc(db, "repositories", "studentData"); // whereever it is
    //     const snap = await getDoc(ref);

    //     if (!snap.exists()) return [];

    //     const data = snap.data();
    //     return Array.isArray(data.emails) ? (data.emails as string[]) : [];
    // }

    // useEffect(() => {
    //     fetchEmails().then(setEmails);
    // }, []);

    // get all emails from firebase database
    // TODO: figure out database stuff
    //const emails: string[] = [];

    const emails: string[] = [
        "alice@yale.edu",
        "bob@yale.edu",
        "carol@yale.edu",
        "david@yale.edu",
        "emma@yale.edu",
        "frank@gmail.com",
        "grace@gmail.com",
        "henry@gmail.com",
        "isabel@yahoo.com",
        "jack@yahoo.com",
        "karen@outlook.com",
        "leo@outlook.com",
        "mia@proton.me",
        "noah@proton.me",
        "olivia@icloud.com",
        "paul@icloud.com",
        "quinn@mit.edu",
        "rachel@stanford.edu",
        "sam@harvard.edu",
        "tina@berkeley.edu",
        "alex@yale.edu",
        "alex1@yale.edu",
        "alex2@yale.edu",
        "alex3@yale.edu",
        "alex4@yale.edu",
        "alex5@yale.edu",
        "alex6@yale.edu",
        "alex7@yale.edu",
        "alex8@yale.edu",
        "alex9@yale.edu",
        "alexander@yale.edu",
        "alexandra@yale.edu",
        "alexandria@yale.edu",
        "alexis@yale.edu",
        "alexis1@yale.edu",
        "alexis2@yale.edu"
        ];

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
        return trie.prefixSearch(q).filter((e) => !invites.includes(e)).slice(0, 20); //filter out already invited and only return first 20
    }, [trie, search]);

    function add(email: string) {
        setInvites((prev) => (prev.includes(email) ? prev : [...prev, email]));
        setSearch("");
    }

    function remove(email: string) {
        setInvites((prev) => prev.filter((x) => x !== email));
    }

    //TODO: spacing on invite box is fucked


    return (
        <div className="invite-picker">
            <div className="invite-picker__search">
            <input
                className="invite-picker__input"
                type="text"
                placeholder="Search emails"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") { // allow custom emails when enter is pressed
                        e.preventDefault();
                        const value = (e.currentTarget as HTMLInputElement).value.trim();
                        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); //regex to test if a valid email

                        
                        if (value && isEmail && !invites.includes(value)) {
                            add(value);
                        }
                    }
                }}
            />

            {/* dropdown suggestions */}
            {matches.length > 0 && (
                <div className="invite-picker__dropdown">
                {matches.map((email) => (
                    <button
                    key={email}
                    className="invite-picker__option"
                    type="button"
                    onClick={() => add(email)}
                    >
                    {email}
                    </button>
                ))}
                </div>
            )}
            </div>

            <h4 className="invite-picker__title">Invites</h4>

            <div className="invite-picker__invites">
            <ul className="invite-picker__invite-list">
                {invites.map((email) => (
                <li key={email} className="invite-picker__invite-item">
                    <span className="invite-picker__invite-email">{email}</span>
                    <button
                    className="invite-picker__remove"
                    type="button"
                    onClick={() => remove(email)}
                    >
                    remove
                    </button>
                </li>
                ))}
            </ul>
            </div>
        </div>
        );




}
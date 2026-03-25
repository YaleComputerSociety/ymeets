import { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { sendInvitationEmail } from '../../../emails/sendEmailHelpers';
import { IconX, IconUsers, IconSend, IconCheck } from '@tabler/icons-react';

// Trie data structure for efficient email prefix search
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
    const arr: string[] = [];
    let node = this.root;

    for (const ch of prefix) {
      const next = node.children.get(ch);
      if (!next) return arr;
      node = next;
    }

    const stack: Array<[TrieNode, string]> = [[node, prefix]];
    while (stack.length > 0) {
      const n = stack.pop()!;
      if (n[0].isWord) arr.push(n[1]);
      for (const [ch, next] of n[0].children) {
        stack.push([next, n[1] + ch]);
      }
    }
    return arr;
  }
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCode: string;
  eventTitle: string;
  senderName: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  eventCode,
  eventTitle,
  senderName,
}: InviteModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [search, setSearch] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Fetch emails from database
  async function fetchEmails(): Promise<string[]> {
    const q = query(collection(db, 'emails'), orderBy('shardIndex'));
    const snap = await getDocs(q);
    const allEmails: string[] = [];
    snap.forEach((docSnap) => {
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

  // Build trie for efficient search
  const trie = useMemo(() => {
    const t = new Trie();
    for (const email of emails) t.insert(email);
    return t;
  }, [emails]);

  // Get matches based on search
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 3) return [];
    return trie.prefixSearch(q).filter((e) => !invites.includes(e)).slice(0, 8);
  }, [trie, search, invites]);

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsAnimating(true), 10);
    } else if (isVisible) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSendSuccess(false);
    }
  }, [isOpen]);

  function addEmail(email: string) {
    setInvites((prev) => (prev.includes(email) ? prev : [...prev, email]));
    setSearch('');
  }

  function removeEmail(email: string) {
    setInvites((prev) => prev.filter((x) => x !== email));
  }

  async function handleSend() {
    if (invites.length === 0) return;

    setIsSending(true);

    try {
      await Promise.all(
        invites.map((email) =>
          sendInvitationEmail(email, {
            eventCode,
            eventTitle,
            senderName,
          })
        )
      );
      setSendSuccess(true);
      setInvites([]);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setIsSending(false);
    }
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl dark:shadow-[0_0_80px_20px_rgba(0,0,0,0.7)] border border-gray-200 dark:border-gray-600 transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full">
              <IconUsers size={18} className="text-primary" stroke={1.5} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Invite People
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <IconX size={18} stroke={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Success State */}
          {sendSuccess ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                <IconCheck size={24} className="text-green-600 dark:text-green-400" stroke={2} />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Invites sent successfully!
              </p>
            </div>
          ) : (
            <>
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by email or type to add..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                      if (value && isEmail && !invites.includes(value)) {
                        addEmail(value);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />

                {/* Autocomplete Dropdown */}
                {matches.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                    {matches.map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => addEmail(email)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {email}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Emails */}
              {invites.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Selected ({invites.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {invites.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <IconX size={12} stroke={2} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {invites.length === 0 && (
                <div className="mt-4 text-center py-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Search for emails or type a new email address and press Enter
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!sendSuccess && (
          <div className="px-4 pb-4">
            <button
              onClick={handleSend}
              disabled={invites.length === 0 || isSending}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                invites.length === 0
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-primary-dark dark:from-blue-900 dark:to-blue-600 text-white transform hover:scale-[0.98]'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <IconSend size={18} stroke={1.5} />
                  {invites.length === 0
                    ? 'Select emails to invite'
                    : `Send ${invites.length} Invite${invites.length > 1 ? 's' : ''}`}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

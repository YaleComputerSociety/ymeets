import * as React from 'react';
import { useAuth } from '../../../../backend/authContext';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const googleAny = window.google as any;
    if (googleAny?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('GSI failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GSI failed'));
    document.head.appendChild(script);
  });
}

export default function GoogleOneTapPrompt() {
  const { currentUser, loading, loginWithIdToken } = useAuth();

  React.useEffect(() => {
    if (loading) return;
    if (currentUser) return;

    const clientId = process.env.REACT_APP_CLIENT_ID_GAPI;
    if (!clientId) return;

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        const gsi = (window.google as any)?.accounts?.id;
        if (!gsi) return;

        gsi.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) return;
            try {
              await loginWithIdToken(response.credential);
            } catch {
              // If One Tap fails, the user can still use existing sign-in flows.
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        gsi.prompt();
      })
      .catch(() => {
        // Script load failed; ignore silently.
      });

    return () => {
      cancelled = true;
      (window.google as any)?.accounts?.id?.cancel?.();
    };
  }, [currentUser, loading, loginWithIdToken]);

  return null;
}


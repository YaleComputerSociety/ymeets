import { useEffect, useState } from 'react';

// Matches Tailwind's `lg` breakpoint, where the availability page switches from TimeSelectPage to SideBySideView
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Tracks whether the viewport is at least Tailwind's `lg` breakpoint, updating when it crosses it.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQueryList.addEventListener('change', onChange);
    return () => mediaQueryList.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

import { useEffect, useState } from "react";

export function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    function onChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    // Deprecated API needed to support iOS 13.
    mediaQueryList.addListener(onChange);

    return () => {
      mediaQueryList.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

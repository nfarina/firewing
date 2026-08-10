import { ReactNode, useEffect, useRef } from "react";

// I know, the React team wouldn't like this, but Suspense hasn't shipped
// yet, so…
export function useIsMounted({
  logPrefix,
}: {
  /** Optionally log when mounted/unmounted, using this prefix. Helpful for debugging. */
  logPrefix?: string;
} = {}): () => boolean {
  const isMountedRef = useRef<true | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    if (logPrefix) console.log(`${logPrefix} mounted`);
    return () => {
      isMountedRef.current = null;
      if (logPrefix) console.log(`${logPrefix} unmounted`);
    };
  }, []);

  return () => isMountedRef.current === true;
}

export function LogIsMounted({
  prefix = "Component",
  children,
}: {
  prefix?: string;
  children?: ReactNode;
}) {
  useIsMounted({ logPrefix: prefix });
  return children as any; // Weird TypeScript errors otherwise.
}

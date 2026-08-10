import { use, useLayoutEffect } from "react";
import { RouterContext } from "../context/RouterContext.js";
import { looksLikeHref } from "../Link.js";

export function Redirect({ to }: { to: string }) {
  const { location, history } = use(RouterContext);

  // Use layout effect so we can re-render before any DOM gets on screen.
  useLayoutEffect(() => {
    if (looksLikeHref(to)) {
      // You can redirect to anywhere on the web, too.
      window.location.href = to;
    } else {
      // We support relative paths by combining them with our current location.
      history.navigate(location.linkTo(to), { replace: true });
    }
  }, [to]);

  return <noscript />;
}

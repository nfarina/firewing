import { lazy } from "react";
import { NavRoute, Navs } from "../../../../router/navs/Navs.js";

const PageOne = lazy(() => import("../pages/PageOne"));

// Simulate a slow import.
const PageTwo = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(import("../pages/PageTwo") as any);
    }, 1000);
  });
});

export default function NavsTab() {
  return (
    <Navs>
      <NavRoute render={() => <PageOne />} />
      <NavRoute path="pages/two" render={() => <PageTwo />} />
    </Navs>
  );
}

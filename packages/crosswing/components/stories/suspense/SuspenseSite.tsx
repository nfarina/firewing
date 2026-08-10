import { lazy } from "react";
import { SiteArea, SiteLayout, SiteLink } from "../../sites/SiteLayout.js";
import { NormalTab } from "./tabs/NormalTab.js";

const SwitchTab = lazy(() => import("./tabs/SwitchTab"));
const DataTab = lazy(() => import("./tabs/DataTab"));

// A kitchen-sink demo app that tests our router's <Suspense> features and
// how some of our components interact with them.
export const SuspenseSite = () => (
  <SiteLayout title="Crosswing Admin">
    <SiteArea path="demos" title="Demos">
      <SiteLink path="normal" title="Normal" render={() => <NormalTab />} />
      <SiteLink path="switch" title="Switch" render={() => <SwitchTab />} />
      <SiteLink path="data" title="Data" render={() => <DataTab />} />
    </SiteArea>
  </SiteLayout>
);

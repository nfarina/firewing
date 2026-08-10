import { lazy } from "react";
import { Tab, Tabs } from "../../../router/tabs/Tabs.js";

const NavsTab = lazy(() => import("./tabs/NavsTab"));
const SwitchTab = lazy(() => import("./tabs/SwitchTab"));
const ImportTab = lazy(() => import("./tabs/ImportTab"));
const DataTab = lazy(() => import("./tabs/DataTab"));

// A kitchen-sink demo app that tests our router's <Suspense> features and
// how some of our components interact with them.
export const SuspenseApp = () => (
  <Tabs>
    <Tab title="Navs" path="navs" render={() => <NavsTab />} />
    <Tab title="Switch" path="switch" render={() => <SwitchTab />} />
    <Tab title="Import" path="import" render={() => <ImportTab />} />
    <Tab title="Data" path="data" render={() => <DataTab />} />
  </Tabs>
);

export const SuspenseNavs = () => <NavsTab />;

export const SuspenseSwitch = () => <SwitchTab />;

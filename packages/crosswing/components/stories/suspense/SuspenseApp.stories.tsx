import { Meta } from "@storybook/react";
import { MockHostProvider } from "../../../host/mocks/MockHostProvider.js";
import { ModalRootProvider } from "../../../modals/context/ModalRootProvider.js";
import { BrowserSimulator } from "../../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../../storybook.js";
import { PageTitleProvider } from "../../sites/SitePageTitle.js";
import { SuspenseApp, SuspenseNavs, SuspenseSwitch } from "./SuspenseApp.js";

export default {
  component: SuspenseApp,
  decorators: [
    CrosswingAppDecorator({ layout: "mobile" }),
    (Story: () => any) => (
      // Simulate an ios container for nice transitions that help visualize the
      // UX with suspense.
      <MockHostProvider container="ios">
        <BrowserSimulator>
          <ModalRootProvider>
            <PageTitleProvider>
              <Story />
            </PageTitleProvider>
          </ModalRootProvider>
        </BrowserSimulator>
      </MockHostProvider>
    ),
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SuspenseApp>;

export const App = () => <SuspenseApp />;

export const Navs = () => <SuspenseNavs />;

export const Switch = () => <SuspenseSwitch />;

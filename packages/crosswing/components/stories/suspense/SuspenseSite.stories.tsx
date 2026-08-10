import { Meta } from "@storybook/react";
import { MockHostProvider } from "../../../host/mocks/MockHostProvider.js";
import { ModalRootProvider } from "../../../modals/context/ModalRootProvider.js";
import { BrowserSimulator } from "../../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../../storybook.js";
import { SuspenseSite } from "./SuspenseSite.js";

export default {
  component: SuspenseSite,
  decorators: [
    CrosswingAppDecorator({ layout: "fullscreen" }),
    (Story: () => any) => (
      // Simulate an ios container for nice transitions that help visualize the
      // UX with suspense.
      <MockHostProvider container="ios">
        <BrowserSimulator>
          <ModalRootProvider>
            <Story />
          </ModalRootProvider>
        </BrowserSimulator>
      </MockHostProvider>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export const App = () => <SuspenseSite />;

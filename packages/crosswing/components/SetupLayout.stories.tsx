import { CrosswingAppDecorator } from "../storybook.js";
import { Button } from "./Button.js";
import { SetupLayout } from "./SetupLayout.js";

export default {
  component: SetupLayout,
  decorators: [CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "centered" },
};

export const Default = () => (
  <SetupLayout
    title="Bank Setup"
    message="You'll be connecting your bank to the app. This should only take a minute."
    actions={[<Button key="continue" primary size="largest" children="Continue" />]}
    legal="By continuing, you agree to our Terms of Service."
  />
);

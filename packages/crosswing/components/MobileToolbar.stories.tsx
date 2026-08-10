import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../storybook.js";
import {
  MobileToolbar,
  MobileToolbarButton,
  MobileToolbarLayout,
  MobileToolbarSpace,
} from "./MobileToolbar.js";
import { Compass, Trash } from "lucide-react";
import { NoContent } from "./NoContent.js";

export default {
  component: MobileToolbar,
  decorators: [CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "centered" },
};

export const Default = () => (
  <MobileToolbarLayout>
    <NoContent title="Content Area" />
    <MobileToolbar>
      <MobileToolbarButton children={<Compass />} onClick={action("onBrowserClick")} />
      <MobileToolbarSpace />
      <MobileToolbarButton children={<Trash />} onClick={action("onTrashClick")} />
    </MobileToolbar>
  </MobileToolbarLayout>
);

import { Meta } from "@storybook/react";
import { BrowserDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { NoContent } from "../NoContent.js";
import { SiteArea, SiteLayout, SiteLink } from "./SiteLayout.js";

export default {
  component: SiteLayout,
  decorators: [BrowserDecorator, CrosswingAppDecorator({ layout: "fullscreen" })],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteLayout>;

export const Default = () => (
  <SiteLayout title="Demo App" sidebarWidth={100}>
    <SiteArea title="Users">
      <SiteLink path="active" title="Active" render={() => <NoContent title="Active Users" />} />
      <SiteLink path="deleted" title="Deleted" render={() => <NoContent title="Deleted Users" />} />
    </SiteArea>
    <SiteArea path="teams" title="Teams" render={() => <NoContent title="Teams Area" />} />
  </SiteLayout>
);

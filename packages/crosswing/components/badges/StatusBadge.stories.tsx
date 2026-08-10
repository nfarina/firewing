import { Meta, StoryFn } from "@storybook/react";
import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../../storybook.js";
import { StatusBadge } from "./StatusBadge.js";

export default {
  component: StatusBadge,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof StatusBadge>;

type Story = StoryFn<typeof StatusBadge>;

export const Info: Story = (args) => (
  <StatusBadge children="Processed today" onClick={action("click")} {...args} type="info" />
);

export const Warning: Story = (args) => (
  <StatusBadge children="Amounts do not match" onClick={action("click")} {...args} type="warning" />
);

export const Error: Story = (args) => (
  <StatusBadge children="This field is required" onClick={action("click")} {...args} type="error" />
);

export const WithoutIcon: Story = (args) => (
  <StatusBadge
    children="Processed today"
    onClick={action("click")}
    hideIcon
    {...args}
    type="info"
  />
);

export const Smallest: Story = (args) => (
  <StatusBadge size="smallest" children="Today" onClick={action("click")} {...args} type="info" />
);

export const SmallestWithoutIcon: Story = (args) => (
  <StatusBadge
    size="smallest"
    hideIcon
    children="Required"
    onClick={action("click")}
    {...args}
    type="error"
  />
);

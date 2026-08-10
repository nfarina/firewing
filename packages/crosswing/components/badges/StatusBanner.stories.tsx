import { Meta, StoryFn } from "@storybook/react";
import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../../storybook.js";
import { StatusBanner } from "./StatusBanner.js";

export default {
  component: StatusBanner,
  decorators: [Decorator, CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof StatusBanner>;

function Decorator(Story: any) {
  return (
    <div style={{ width: "350px" }}>
      <Story />
    </div>
  );
}

type Story = StoryFn<typeof StatusBanner>;

export const Info: Story = (args) => (
  <StatusBanner children="Processed today" onClick={action("click")} {...args} type="info" />
);

export const Warning: Story = (args) => (
  <StatusBanner
    children="Amounts do not match"
    onClick={action("click")}
    {...args}
    type="warning"
  />
);

export const Error: Story = (args) => (
  <StatusBanner
    children="This field is required"
    onClick={action("click")}
    {...args}
    type="error"
  />
);

export const Floating: Story = (args) => (
  <StatusBanner
    children="Processed today"
    onClick={action("click")}
    floating
    {...args}
    type="info"
  />
);

export const WithoutIcon: Story = (args) => (
  <StatusBanner
    children="Processed today"
    onClick={action("click")}
    hideIcon
    {...args}
    type="info"
  />
);

export const WithAction: Story = (args) => (
  <StatusBanner
    children="Processed today"
    onClick={action("click")}
    action="Reprocess"
    onActionClick={action("action-click")}
    {...args}
    type="info"
  />
);

export const WithActionWorking: Story = (args) => (
  <StatusBanner
    children="Processed today"
    onClick={action("click")}
    action="Reprocess"
    onActionClick={action("action-click")}
    actionWorking
    {...args}
    type="info"
  />
);

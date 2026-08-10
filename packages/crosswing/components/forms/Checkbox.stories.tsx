import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Checkbox } from "./Checkbox.js";

export default {
  component: Checkbox,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
  argTypes: {
    checked: { control: "boolean" },
    onClick: { action: "onClick" },
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryFn<typeof Checkbox>;

export const Unchecked: Story = (args) => <Checkbox {...args} />;

export const Checked: Story = (args) => <Checkbox checked {...args} />;

export const WithHandler: Story = ({ onClick, ...args }) => {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      checked={checked}
      onClick={(e) => {
        setChecked(!checked);
        onClick?.(e);
      }}
      {...args}
    />
  );
};

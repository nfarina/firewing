import { Meta, StoryObj } from "@storybook/react";
import { CrosswingAppDecorator } from "../storybook.js";
import { ProgressBar } from "./ProgressBar.js";

export default {
  component: ProgressBar,
  decorators: [CrosswingAppDecorator({ layout: "component" })],
  parameters: { layout: "centered" },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
    },
  },
} satisfies Meta<typeof ProgressBar>;

type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = {
  args: { value: 0 },
};

export const EmptyRounded: Story = {
  args: { rounded: true, value: 0 },
};

export const Partial: Story = {
  args: { value: 0.4 },
};

export const PartialRounded: Story = {
  args: { rounded: true, value: 0.4 },
};

export const Full: Story = {
  args: { value: 1 },
};

import { Meta, StoryFn } from "@storybook/react";
import { CrosswingAppDecorator } from "../../storybook.js";
import { TextCellBadge } from "./TextCellBadge.js";

export default {
  component: TextCellBadge,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextCellBadge>;

type Story = StoryFn<typeof TextCellBadge>;

export const Normal: Story = (args) => <TextCellBadge>Recent</TextCellBadge>;

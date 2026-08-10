import { Meta, StoryFn } from "@storybook/react";
import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../storybook.js";
import { Button } from "./Button.js";
import { Heading } from "./Heading.js";

export default {
  component: Heading,
  decorators: [CrosswingAppDecorator({ layout: "component" })],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Heading>;

type Story = StoryFn<typeof Heading>;

export const Default: Story = () => <Heading>Section Title</Heading>;

export const WithRight: Story = () => (
  <Heading right={<Button children="Action" onClick={action("action click")} />}>
    Section Title
  </Heading>
);

import { Meta, StoryFn } from "@storybook/react";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { LinkButton } from "./LinkButton.js";

export default {
  component: LinkButton,
  decorators: [CrosswingAppDecorator(), RouterDecorator],
  parameters: { layout: "centered" },
} satisfies Meta<typeof LinkButton>;

type Story = StoryFn<typeof LinkButton>;

export const WithText: Story = () => <LinkButton children="Hello!" to="/somewhere" />;

export const Disabled: Story = () => <LinkButton disabled children="Hello!" to="/somewhere" />;

export const PrimarySmaller: Story = () => (
  <LinkButton size="smaller" primary children="Hello!" to="/somewhere" />
);

export const PrimaryNormal: Story = () => <LinkButton primary children="Hello!" to="/somewhere" />;

export const PrimaryLarger: Story = () => (
  <LinkButton size="larger" primary children="Hello!" to="/somewhere" />
);

export const PrimaryLargest: Story = () => (
  <LinkButton size="largest" primary children="Hello!" to="/somewhere" />
);

export const WithSubtitle: Story = () => (
  <LinkButton primary title="Buy Now" subtitle="Terms Apply" to="/somewhere" />
);

export const WithDisclosure: Story = () => (
  <LinkButton primary title="Visit Page" to="/somewhere" showDisclosure />
);

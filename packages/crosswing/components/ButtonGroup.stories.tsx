import { Meta } from "@storybook/react";
import { action } from "storybook/actions";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";
import { LinkButton } from "./LinkButton.js";

export default {
  component: ButtonGroup,
  decorators: [CrosswingAppDecorator(), RouterDecorator],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ButtonGroup>;

export const WithSingleButton = () => (
  <ButtonGroup>
    <Button children="Hello" onClick={action("onClick")} />
  </ButtonGroup>
);

export const WithLinkButton = () => (
  <ButtonGroup>
    <LinkButton to="/somewhere" children="Hello" />
  </ButtonGroup>
);

export const WithMultipleButtons = () => (
  <ButtonGroup>
    <Button children="One Fish" onClick={action("onClick [one fish]")} />
    <LinkButton to="/somewhere" children="Two Fish" />
  </ButtonGroup>
);

export const Disabled = () => (
  <ButtonGroup>
    <Button children="One Fish" onClick={action("onClick [one fish]")} />
    <Button children="Two Fish" disabled onClick={action("onClick [two fish]")} />
  </ButtonGroup>
);

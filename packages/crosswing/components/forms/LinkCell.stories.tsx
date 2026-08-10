import { action } from "storybook/actions";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LinkCell } from "./LinkCell.js";
import { Search } from "lucide-react";

export default {
  component: LinkCell,
  decorators: [SeparatorDecorator, CrosswingAppDecorator({ layout: "component" }), RouterDecorator],
  parameters: { layout: "centered" },
};

export const Normal = () => <LinkCell title="Select an account" onClick={action("click")} />;

export const WithSubtitle = () => (
  <LinkCell
    title="Select an account"
    subtitle="Money can be exchanged for goods and services"
    onClick={action("click")}
  />
);

export const WithIcon = () => (
  <LinkCell icon={<Search />} title="Attach a Receipt" onClick={action("click")} />
);

export const WithAction = () => <LinkCell action="Attach a Receipt" onClick={action("click")} />;

export const WithLabel = () => (
  <LinkCell label="User" title="Nick Farina" onClick={action("click")} />
);

export const Disabled = () => (
  <LinkCell disabled title="Select an account" onClick={action("click")} />
);

export const OverStuffed = () => (
  <LinkCell
    label="Check out this really long label, we're just labeling a lot of things over here."
    action="Here's a very long action, the text just keeps going on and on."
    title="This is a really long title, like incredibly long!"
    subtitle="And this is an equally long subtitle, see how it goes on and on forever."
    onClick={action("click")}
  />
);

export const Ellipsised = () => (
  <LinkCell
    ellipsize
    label="Check out this really long label, we're just labeling a lot of things over here."
    action="Here's a very long action, the text just keeps going on and on."
    title="This is a really long title, like incredibly long!"
    subtitle="And this is an equally long subtitle, see how it goes on and on forever."
    onClick={action("click")}
  />
);

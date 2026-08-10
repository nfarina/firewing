import { useState } from "react";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { TextCell } from "./TextCell.js";
import { Search } from "lucide-react";

export default {
  component: TextCell,
  decorators: [SeparatorDecorator, CrosswingAppDecorator({ layout: "component" }), RouterDecorator],
  parameters: { layout: "centered" },
};

export const Normal = () => <TextCell title="Select an account" onClick={() => {}} />;

export const AsLink = () => <TextCell title="Select an account" to="/somewhere" />;

export const Checked = () => {
  const [checked, setChecked] = useState(true);
  return (
    <TextCell title="Select an account" checked={checked} onClick={() => setChecked(!checked)} />
  );
};

export const WithDetail = () => (
  <TextCell title="Select an account" detail="Money can be exchanged for goods and services" />
);

export const WithSubtitle = () => (
  <TextCell title="Select an account" subtitle="Money can be exchanged for goods and services" />
);

export const Disabled = () => (
  <TextCell
    disabled
    title="Select an account"
    subtitle="Money can be exchanged for goods and services"
    onClick={() => {}} // Must define to be a clickable thing
  />
);

export const WithIcon = () => <TextCell icon={<Search />} action="Attach a Receipt" />;

export const WithLabel = () => <TextCell label="User" title="Nick Farina" />;

export const OverStuffed = () => (
  <TextCell
    label="Check out this really long label, we're just labeling a lot of things over here."
    title="This is a really long title, like incredibly long!"
    subtitle="And this is an equally long subtitle, see how it goes on and on forever."
  />
);

export const Ellipsised = () => (
  <TextCell
    ellipsize
    label="Check out this really long label, we're just labeling a lot of things over here."
    title="This is a really long title, like incredibly long!"
    subtitle="And this is an equally long subtitle, see how it goes on and on forever."
  />
);

import { useState } from "react";
import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LabeledCheckbox } from "./LabeledCheckbox.js";

export default {
  component: LabeledCheckbox,
  decorators: [SeparatorDecorator, CrosswingAppDecorator({ layout: "component" })],
  parameters: { layout: "centered" },
};

export const Clickable = () => {
  const [checked, setChecked] = useState(false);
  return (
    <LabeledCheckbox
      label="Ludicrous Mode"
      checked={checked}
      onClick={() => setChecked(!checked)}
    />
  );
};

export const WithDetail = () => (
  <LabeledCheckbox
    label="Ludicrous Mode"
    detail="Takes 3-5 minutes to warm up the batteries"
    onClick={action("click")}
  />
);

export const Checked = () => (
  <LabeledCheckbox
    checked
    label="Ludicrous Mode"
    detail="Takes 3-5 minutes to warm up the batteries"
    onClick={action("click")}
  />
);

export const Disabled = () => (
  <LabeledCheckbox
    disabled
    label="Ludicrous Mode"
    checked
    onClick={() => {
      throw new Error("Shouldn't happen");
    }}
  />
);

import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LabeledCheckmark } from "./LabeledCheckmark.js";

export default {
  component: LabeledCheckmark,
  decorators: [SeparatorDecorator, CrosswingAppDecorator({ layout: "component" })],
  parameters: { layout: "centered" },
};

export const Normal = () => <LabeledCheckmark label="Ludicrous Mode" onClick={action("click")} />;

export const WithDetail = () => (
  <LabeledCheckmark
    label="Ludicrous Mode"
    detail="Takes 3-5 minutes to warm up the batteries"
    onClick={action("click")}
  />
);

export const Checked = () => (
  <LabeledCheckmark
    checked
    label="Ludicrous Mode"
    detail="Takes 3-5 minutes to warm up the batteries"
    onClick={action("click")}
  />
);

export const Disabled = () => (
  <LabeledCheckmark
    disabled
    label="Ludicrous Mode"
    checked
    onClick={() => {
      throw new Error("Shouldn't happen");
    }}
  />
);

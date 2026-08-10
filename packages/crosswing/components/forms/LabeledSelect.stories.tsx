import { useState } from "react";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LabeledSelect } from "./LabeledSelect.js";
import { SelectOption } from "./Select.js";

export default {
  component: LabeledSelect,
  decorators: [SeparatorDecorator, CrosswingAppDecorator({ layout: "component" })],
  parameters: { layout: "centered" },
};

export const Normal = () => {
  const [ludicrous, setLudicrous] = useState(true);

  return (
    <LabeledSelect label="Ludicrous Mode" onClick={() => setLudicrous(!ludicrous)}>
      <SelectOption title="On" value="1" />
      <SelectOption title="Off" value="2" />
      <SelectOption title="N/A" value="3" />
    </LabeledSelect>
  );
};

export const Disabled = () => (
  <LabeledSelect
    disabled
    label="Ludicrous Mode"
    onClick={() => {
      throw new Error("Shouldn't happen");
    }}
  >
    <SelectOption title="On" value="1" />
    <SelectOption title="Off" value="2" />
    <SelectOption title="N/A" value="3" />
  </LabeledSelect>
);

export const Working = () => (
  <LabeledSelect
    working
    label="Ludicrous Mode"
    onClick={() => {
      throw new Error("Shouldn't happen");
    }}
  >
    <SelectOption title="On" value="1" />
    <SelectOption title="Off" value="2" />
    <SelectOption title="N/A" value="3" />
  </LabeledSelect>
);

export const WithLongOption = () => {
  const [ludicrous, setLudicrous] = useState(true);

  return (
    <LabeledSelect label="Ludicrous Mode" onClick={() => setLudicrous(!ludicrous)}>
      <SelectOption title="On, and I have agreed to the terms and conditions" value="1" />
      <SelectOption title="Off" value="2" />
      <SelectOption title="N/A" value="3" />
    </LabeledSelect>
  );
};

export const WithDetail = () => (
  <LabeledSelect label="Ludicrous Mode" detail="Turns your car into a spaceship.">
    <SelectOption title="On" value="1" />
    <SelectOption title="Off" value="2" />
    <SelectOption title="N/A" value="3" />
  </LabeledSelect>
);

export const WithLongDetail = () => (
  <LabeledSelect
    label="Ludicrous Mode"
    detail="Turns your car into a spaceship. This is highly dangerous and not advised."
  >
    <SelectOption title="On" value="1" />
    <SelectOption title="Off" value="2" />
    <SelectOption title="N/A" value="3" />
  </LabeledSelect>
);

import { useState } from "react";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LabeledTextInput } from "./LabeledTextInput.js";

export default {
  component: LabeledTextInput,
  decorators: [CrosswingAppDecorator({ layout: "component" }), ModalDecorator],
  parameters: { layout: "centered" },
};

export const Empty = () => {
  const [name, setName] = useState("");
  return <LabeledTextInput label="Name" value={name} onValueChange={setName} />;
};
Empty.decorators = [SeparatorDecorator];

export const WithPlaceholder = () => {
  const [name, setName] = useState("");

  return (
    <LabeledTextInput
      label="Name"
      placeholder={'Ex: "Kitchen Remodel"'}
      value={name}
      onValueChange={setName}
    />
  );
};
WithPlaceholder.decorators = [SeparatorDecorator];

export const WithValue = () => {
  const [name, setName] = useState("Nick Farina");

  return <LabeledTextInput label="Name" value={name} onValueChange={setName} />;
};
WithValue.decorators = [SeparatorDecorator];

export const Disabled = () => <LabeledTextInput label="Name" value="Nick Farina" disabled />;
Disabled.decorators = [SeparatorDecorator];

export const WithoutLabel = () => {
  const [name, setName] = useState("Nick Farina");

  return <LabeledTextInput value={name} onValueChange={setName} />;
};
WithoutLabel.decorators = [SeparatorDecorator];

export const NewStyle = () => {
  const [name, setName] = useState("Nick Farina");

  return <LabeledTextInput newStyle label="Name" value={name} onValueChange={setName} />;
};

export const NewStyleWithError = () => {
  const [name, setName] = useState("Bill");

  return (
    <LabeledTextInput
      newStyle
      label="Name"
      value={name}
      onValueChange={setName}
      error={name === "Bill" ? new Error("Bill is not valid.") : null}
    />
  );
};

export const NewStyleWithLabelAndLongPlaceholder = () => {
  const [name, setName] = useState("");

  return (
    <LabeledTextInput
      newStyle
      label="Project name"
      placeholder="Enter a descriptive name for your project that will help you identify it later"
      value={name}
      onValueChange={setName}
    />
  );
};

import { Meta } from "@storybook/react";
import { useState } from "react";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LabeledTextArea } from "./LabeledTextArea.js";

export default {
  component: LabeledTextArea,
  decorators: [CrosswingAppDecorator({ layout: "component" }), ModalDecorator],
  parameters: { layout: "centered" },
} satisfies Meta<typeof LabeledTextArea>;

export const Empty = () => {
  const [name, setName] = useState("");
  return <LabeledTextArea label="Name" value={name} onValueChange={setName} />;
};
Empty.decorators = [SeparatorDecorator];

export const WithPlaceholder = () => {
  const [name, setName] = useState("");
  return (
    <LabeledTextArea label="Note" placeholder="Add a Note" value={name} onValueChange={setName} />
  );
};
WithPlaceholder.decorators = [SeparatorDecorator];

export const WithLabelAndLongPlaceholder = () => {
  const [name, setName] = useState("");
  return (
    <LabeledTextArea
      label="Filler Text"
      placeholder="Filler text is text that shares some characteristics of a real written text, but is random or otherwise generated."
      value={name}
      onValueChange={setName}
    />
  );
};
WithLabelAndLongPlaceholder.decorators = [SeparatorDecorator];

export const WithValue = () => {
  const [name, setName] = useState("Nick Farina");

  return <LabeledTextArea label="Name" value={name} onValueChange={setName} />;
};
WithValue.decorators = [SeparatorDecorator];

export const WithError = () => {
  const [text, setText] = useState("Invalid content");

  return (
    <LabeledTextArea
      label="Description"
      value={text}
      onValueChange={setText}
      error={new Error("This description is not valid.")}
    />
  );
};
WithError.decorators = [SeparatorDecorator];

export const Disabled = () => <LabeledTextArea label="Name" value="Nick Farina" disabled />;
Disabled.decorators = [SeparatorDecorator];

export const NewStyle = () => {
  const [name, setName] = useState("Nick Farina");

  return <LabeledTextArea newStyle label="Name" value={name} onValueChange={setName} />;
};

export const NewStyleWithError = () => {
  const [text, setText] = useState("Invalid content");

  return (
    <LabeledTextArea
      newStyle
      label="Description"
      value={text}
      onValueChange={setText}
      error={new Error("This description is not valid.")}
    />
  );
};

export const NewStyleWithoutLabel = () => {
  const [text, setText] = useState("Some text content");

  return <LabeledTextArea newStyle value={text} onValueChange={setText} />;
};

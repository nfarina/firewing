import { Meta } from "@storybook/react";
import { useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { StyledTextInput, TextInput } from "./TextInput.js";
import { Search } from "lucide-react";

export default {
  component: TextInput,
  decorators: [
    (Story: () => any) => <Container children={<Story />} />,
    CrosswingAppDecorator({ layout: "component" }),
    ModalDecorator,
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextInput>;

export const AutoTrimDemo = () => {
  const [value, setValue] = useState("");

  return (
    <>
      <TextInput placeholder="Display Name" value={value} onValueChange={setValue} />
      <Button children="Reset Value to 'Blue '" onClick={() => setValue("Blue ")} />
      <pre>TextInput Value: "{value}"</pre>
    </>
  );
};

export const WithPlaceholder = () => {
  const [name, setName] = useState("");

  return <TextInput placeholder={'Ex: "Kitchen Remodel"'} value={name} onValueChange={setName} />;
};

export const WithValue = () => {
  const [name, setName] = useState("John Smith");

  return <TextInput value={name} onValueChange={setName} />;
};

export const WithErrorColorOnly = () => {
  const [text, setText] = useState("Forty");

  return (
    <TextInput
      value={text}
      onValueChange={setText}
      error={new Error("Invalid number")}
      errorStyle="color"
    />
  );
};

export const WithError = () => {
  const [text, setText] = useState("Forty");

  return <TextInput value={text} onValueChange={setText} error={new Error("Invalid Number")} />;
};

export const WithLongError = () => {
  const [name, setName] = useState("Bob");

  return (
    <TextInput
      value={name}
      onValueChange={setName}
      error={new Error("Name must be at least 10 characters long.")}
    />
  );
};

export const Disabled = () => <TextInput value="John Smith" disabled />;

const Container = styled.div`
  display: flex;
  flex-flow: column;

  > ${StyledTextInput}[data-new-style="false"] {
    /* Make it stand out in Storybook against the background. */
    border: 1px solid ${colors.separator()};
    border-radius: 6px;

    > input {
      padding: 10px;
    }
  }

  > pre {
    color: ${colors.textSecondary()};
    font: ${fonts.displayMono({ size: 14 })};
  }

  > * + * {
    margin-top: 20px;
  }
`;

export const NewStyleWithPlaceholder = () => {
  const [text, setText] = useState("");

  return <TextInput placeholder="Enter your name" value={text} onValueChange={setText} newStyle />;
};

export const NewStyleWithIcon = () => {
  const [text, setText] = useState("");

  return (
    <TextInput
      newStyle
      placeholder="Enter your name"
      value={text}
      onValueChange={setText}
      icon={<Search />}
    />
  );
};

export const NewStyleWithIconAndRequiredError = () => {
  const [text, setText] = useState("");

  return (
    <TextInput
      newStyle
      placeholder="Enter your name"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      error={!text ? new Error("Name is required.") : null}
    />
  );
};

export const NewStyleWithIconAndValidationError = () => {
  const [text, setText] = useState("");

  return (
    <TextInput
      newStyle
      placeholder="Enter a fruit"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      error={text.toLowerCase() !== "apple" ? new Error("Not an apple!") : null}
    />
  );
};

export const NewStyleWithIconAndInitialError = () => {
  const [text, setText] = useState("Bill");

  return (
    <TextInput
      newStyle
      placeholder="Enter your name"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      error={text === "Bill" ? new Error("Bill is not valid.") : null}
    />
  );
};

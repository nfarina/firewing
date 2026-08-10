import { Meta } from "@storybook/react";
import { useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { StyledTextArea, TextArea } from "./TextArea.js";
import { Search } from "lucide-react";

export default {
  component: TextArea,
  decorators: [
    (Story: () => any) => <Container children={<Story />} />,
    CrosswingAppDecorator({ layout: "component" }),
    ModalDecorator,
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextArea>;

export const AutoTrimDemo = () => {
  const [value, setValue] = useState("");

  return (
    <>
      <TextArea placeholder="Display Name" value={value} onValueChange={setValue} autoSizing />
      <Button children="Reset Value to 'Blue '" onClick={() => setValue("Blue ")} />
      <pre>TextArea Value: "{value}"</pre>
    </>
  );
};

export const AutoSizeDemo = () => {
  const [value, setValue] = useState(
    "This is a long value that should wrap and auto-grow the textarea depending on its actual width.",
  );

  return (
    <>
      <TextArea placeholder="Display Name" value={value} onValueChange={setValue} autoSizing />
      <Button
        children="Adjust width"
        onClick={(e) => {
          const buttonRef = e.target as HTMLButtonElement;
          const textAreaRef = buttonRef.previousElementSibling as HTMLTextAreaElement;

          // Set a random size between 200 and 500.
          const width = Math.floor(Math.random() * 300) + 200;
          textAreaRef.style.width = `${width}px`;
        }}
      />
    </>
  );
};

export const WithPlaceholder = () => {
  const [name, setName] = useState("");

  return (
    <TextArea
      placeholder={'Ex: "Kitchen Remodel"'}
      value={name}
      onValueChange={setName}
      autoSizing
    />
  );
};

export const WithValue = () => {
  const [name, setName] = useState("John Smith");

  return <TextArea value={name} onValueChange={setName} autoSizing />;
};

export const Disabled = () => <TextArea value="John Smith" disabled autoSizing />;

export const FixedSize = () => {
  const [name, setName] = useState("John Smith");

  return <TextArea value={name} onValueChange={setName} />;
};

export const AutosizingAndScrolling = () => {
  const [name, setName] = useState(
    "If you type in here, it should not fiddle with the scroll position. Here are some more words to make it scroll. And some more. And yet it continues! On it goes, inexorably. It's like a never-ending story. But it will end eventually. I promise.",
  );

  return (
    <ScrollingContainer>
      <TextArea value={name} onValueChange={setName} autoSizing />
    </ScrollingContainer>
  );
};

export const NewStyleWithPlaceholder = () => {
  const [text, setText] = useState("");

  return (
    <TextArea
      placeholder="Enter your message"
      value={text}
      onValueChange={setText}
      newStyle
      autoSizing
    />
  );
};

export const NewStyleWithIcon = () => {
  const [text, setText] = useState("");

  return (
    <TextArea
      newStyle
      placeholder="Enter your message"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      autoSizing
    />
  );
};

export const NewStyleWithIconAndRequiredError = () => {
  const [text, setText] = useState("");

  return (
    <TextArea
      newStyle
      placeholder="Enter your name"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      autoSizing
      error={!text ? new Error("Name is required.") : null}
    />
  );
};

export const NewStyleWithIconAndValidationError = () => {
  const [text, setText] = useState("");

  return (
    <TextArea
      newStyle
      placeholder="Enter a fruit"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      autoSizing
      error={text.toLowerCase() !== "apple" ? new Error("Not an apple!") : null}
    />
  );
};

export const NewStyleWithIconAndInitialError = () => {
  const [text, setText] = useState("Bill");

  return (
    <TextArea
      newStyle
      placeholder="Enter your name"
      value={text}
      onValueChange={setText}
      icon={<Search />}
      autoSizing
      error={text === "Bill" ? new Error("Bill is not valid.") : null}
    />
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: column;

  > ${StyledTextArea}[data-new-style="false"] {
    /* Make it stand out in Storybook against the background. */
    border: 1px solid ${colors.separator()};
    border-radius: 6px;
    padding: 10px;
  }

  > pre {
    color: ${colors.textSecondary()};
    font: ${fonts.displayMono({ size: 14 })};
  }

  > * + * {
    margin-top: 20px;
  }
`;

const ScrollingContainer = styled.div`
  height: 100px;
  box-sizing: border-box;
  overflow: auto;
  padding: 10px;
  border: 1px solid ${colors.red()};

  > ${StyledTextArea} {
    border: 1px solid ${colors.separator()};
    border-radius: 6px;
    padding: 10px;
  }
`;

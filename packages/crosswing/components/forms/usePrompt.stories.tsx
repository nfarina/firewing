import { action } from "storybook/actions";
import { styled } from "styled-components";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { urlTransformer } from "../transformers/urlTransformer.js";
import { usePrompt } from "./usePrompt.js";

export default {
  component: usePrompt,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator],
  parameters: { layout: "fullscreen" },
};

export function Normal() {
  const prompt = usePrompt(() => ({
    title: "Choose Color",
    message: "What is your favorite color?",
    placeholder: "Color",
    onSubmit: (value: string) => action("onSubmit")(value),
  }));

  return (
    <ButtonContainer>
      <Button bordered newStyle onClick={prompt.show} children="Choose color" />
    </ButtonContainer>
  );
}

export function WithInitialValue() {
  const prompt = usePrompt(() => ({
    title: "Choose Color",
    message: "What is your favorite color?",
    placeholder: "Color",
    initialValue: "Blue",
    onSubmit: (value: string) => action("onSubmit")(value),
  }));

  return (
    <ButtonContainer>
      <Button bordered newStyle onClick={prompt.show} children="Choose color" />
    </ButtonContainer>
  );
}

export function WithValidation() {
  const prompt = usePrompt(() => ({
    title: "Choose Color",
    message: "What is your favorite color?",
    placeholder: "Color",
    validate: (value: string) => {
      if (["red", "green", "blue"].includes(value)) return;

      throw new Error("Color must be red, green, or blue.");
    },
    onSubmit: (value: string) => action("onSubmit")(value),
  }));

  return (
    <ButtonContainer>
      <Button bordered newStyle onClick={prompt.show} children="Choose color" />
    </ButtonContainer>
  );
}

export function WithTransformer() {
  const prompt = usePrompt(() => ({
    title: "Enter URL",
    message: "What's your favorite website?",
    placeholder: "http://example.com",
    transformer: urlTransformer(),
    onSubmit: (value: string) => action("onSubmit")(value, typeof value),
  }));

  return (
    <ButtonContainer>
      <Button bordered newStyle onClick={prompt.show} children="Enter URL" />
    </ButtonContainer>
  );
}

export function WithTransformerAndValidation() {
  const prompt = usePrompt(() => ({
    title: "Enter URL",
    message: "What's your favorite website?",
    placeholder: "http://example.com",
    transformer: urlTransformer(),
    validate(value) {
      if (!value.startsWith("https://")) {
        throw new Error("URL must be HTTPS.");
      }
    },
    onSubmit: (value: string) => action("onSubmit")(value),
  }));

  return (
    <ButtonContainer>
      <Button bordered newStyle onClick={prompt.show} children="Enter secure URL" />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  > * + * {
    margin-top: 10px;
  }
`;

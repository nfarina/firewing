import { Meta, StoryFn } from "@storybook/react";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { Heading } from "../Heading.js";
import { TipView } from "../TipView.js";
import { LabeledTextInput } from "./LabeledTextInput.js";
import { LabeledToggle } from "./LabeledToggle.js";
import { useFormValues } from "./useFormValues.js";
import { useInputValue } from "./useInputValue.js";
import { useToggleValue } from "./useToggleValue.js";

export default {
  component: useFormValues as any, // Just for the story name.
  decorators: [CrosswingAppDecorator(), RouterDecorator, ModalDecorator],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof useFormValues>;

type Story = StoryFn<typeof useFormValues>;

export const BasicForm: Story = () => {
  const username = useInputValue({
    required: true,
    validate: (value) => {
      if (value.length < 3) {
        throw new Error("Username must be at least 3 characters");
      }
    },
  });

  const bio = useInputValue({
    required: false,
  });

  const isPublic = useToggleValue({
    initialValue: false,
  });

  const form = useFormValues({
    inputs: [username, bio, isPublic],
    onSubmit: action("submit"),
  });

  return (
    <StoryContainer>
      <Heading>Create Profile</Heading>
      <TipView>Demonstrates mixed input types.</TipView>

      <form {...form.props}>
        <LabeledTextInput
          newStyle
          label="Username"
          placeholder="Choose a username (type 'error' for a task error)"
          {...form.valueProps(username)}
        />
        <LabeledTextInput
          newStyle
          label="Bio (optional)"
          placeholder="Tell us about yourself"
          {...form.valueProps(bio)}
        />
        <LabeledToggle newStyle label="Make profile public" {...form.valueProps(isPublic)} />
        <Button newStyle type="submit" children={"Create Profile"} {...form.buttonProps} />
      </form>
    </StoryContainer>
  );
};

export const ValidationErrors: Story = () => {
  const password = useInputValue({
    required: true,
    validate: (value) => {
      if (value.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      if (!/[A-Z]/.test(value)) {
        throw new Error("Password must contain an uppercase letter");
      }
    },
  });

  const confirmPassword = useInputValue({
    required: true,
    validate: (value) => {
      if (value !== password.value) {
        throw new Error("Passwords do not match");
      }
    },
  });

  const form = useFormValues({
    inputs: [password, confirmPassword],
    onSubmit: action("submit"),
  });

  return (
    <StoryContainer>
      <Heading>Set Password</Heading>
      <TipView>
        Try various invalid passwords to see validation in action. Both fields are required.
      </TipView>

      <form {...form.props}>
        <LabeledTextInput
          newStyle
          type="password"
          label="Password"
          placeholder="Enter password (8+ chars, 1 uppercase)"
          {...form.valueProps(password)}
        />
        <LabeledTextInput
          newStyle
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          {...form.valueProps(confirmPassword)}
        />
        <Button newStyle type="submit" children={"Set Password"} {...form.buttonProps} />
      </form>
    </StoryContainer>
  );
};

const StoryContainer = styled.div`
  width: 400px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { TextInput } from "../../components/forms/TextInput.js";
import { useInputValue } from "../../components/forms/useInputValue.js";
import { useNewFormValues } from "../../components/forms/useNewFormValues.js";
import { TipView } from "../../components/TipView.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { DialogContainer, DialogView } from "./DialogView.js";
import { Info } from "lucide-react";

export default {
  component: DialogView,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), RouterDecorator, ModalDecorator],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DialogView>;

type Story = StoryFn<typeof DialogView>;

export const Basic: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView
      title="Basic dialog"
      onClose={action("onClose")}
      children="This is a basic dialog with some content."
      buttons={[
        { title: "Cancel", onClick: action("cancel") },
        { title: "Confirm", primary: true, onClick: action("confirm") },
      ]}
    />
  </DialogContainer>
);

export const WithSubtitle: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView
      title="Basic dialog"
      subtitle="Here's an explanatory subtitle."
      children="This is a basic dialog with some content."
      onClose={action("onClose")}
      buttons={[
        { title: "Cancel", onClick: action("cancel") },
        { title: "Confirm", primary: true, onClick: action("confirm") },
      ]}
    />
  </DialogContainer>
);

export const WithBackButton: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView
      title="Basic dialog"
      back="/"
      onClose={action("onClose")}
      children="This is a basic dialog with some content."
      buttons={[
        { title: "Cancel", onClick: action("cancel") },
        { title: "Confirm", primary: true, onClick: action("confirm") },
      ]}
    />
  </DialogContainer>
);

export const ProjectCreation: Story = () => {
  const projectName = useInputValue({
    required: true,
    validate: (value) => {
      if (value === "banana") {
        throw new Error("Bananas are not allowed!");
      }
    },
  });

  const form = useNewFormValues({
    inputs: [projectName],
    onSubmit: action("submit"),
  });

  return (
    <DialogContainer onClose={action("onClose")}>
      <DialogView
        {...form.props}
        title="Project name"
        onClose={action("onClose")}
        buttons={[
          { title: "Cancel", onClick: action("cancel") },
          {
            title: "Create project",
            primary: true,
            autoFocus: false,
            onClick: action("create"),
            type: "submit",
            ...form.submitProps,
          },
        ]}
      >
        <ProjectForm>
          <TextInput
            newStyle
            {...form.valueProps(projectName)}
            placeholder="Enter project name (use 'banana' for an error)"
            // errorStyle="none"
            autoFocus
          />
          <TipView icon={<Info />} title="What's a project?">
            Projects keep chats, files, and custom instructions in one place. Use them for ongoing
            work, or just to keep things tidy.
          </TipView>
        </ProjectForm>
      </DialogView>
    </DialogContainer>
  );
};

export const LongContent: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView
      title="Dialog with long content"
      onClose={action("onClose")}
      buttons={[
        { title: "Cancel", onClick: action("cancel") },
        { title: "Save", primary: true, onClick: action("save") },
      ]}
    >
      <p>This dialog has a lot of content to demonstrate scrolling.</p>
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris.
        </p>
      ))}
    </DialogView>
  </DialogContainer>
);

export const NoButtons: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView title="No buttons dialog" onClose={action("onClose")}>
      This dialog has no footer buttons, only the close X.
    </DialogView>
  </DialogContainer>
);

export const NoTitle: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView
      onClose={action("onClose")}
      hideCloseButton
      buttons={[
        { title: "Cancel", onClick: action("cancel") },
        { title: "OK", primary: true, onClick: action("ok") },
      ]}
    >
      This dialog has no header title, only content and buttons.
    </DialogView>
  </DialogContainer>
);

export const WorkingState: Story = () => {
  const [working, setWorking] = useState(false);

  function handleSubmit() {
    setWorking(true);
    action("submit")();
    setTimeout(() => setWorking(false), 2000);
  }

  return (
    <DialogContainer onClose={action("onClose")}>
      <DialogView
        title="Working state example"
        onClose={action("onClose")}
        disabled={working}
        buttons={[
          { title: "Cancel", onClick: action("cancel") },
          {
            title: "Submit",
            primary: true,
            working,
            onClick: handleSubmit,
          },
        ]}
      >
        <p>Click Submit to see the working state.</p>
      </DialogView>
    </DialogContainer>
  );
};

export const MultipleButtons: Story = () => (
  <DialogContainer onClose={action("onClose")}>
    <DialogView
      title="Multiple buttons"
      onClose={action("onClose")}
      buttons={[
        { title: "Cancel", onClick: action("cancel") },
        { title: "Save Draft", onClick: action("save-draft") },
        { title: "Publish", primary: true, onClick: action("publish") },
      ]}
    >
      <p>This dialog demonstrates multiple action buttons.</p>
    </DialogView>
  </DialogContainer>
);

const ProjectForm = styled.div`
  display: flex;
  flex-flow: column;
  gap: 20px;
`;

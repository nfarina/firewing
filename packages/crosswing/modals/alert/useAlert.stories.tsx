import { action } from "storybook/actions";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalStoryButton, ModalStoryButtons } from "../storybook/ModalStoryButtons.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { useAlert } from "./useAlert.js";

export default {
  component: useAlert,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator],
  parameters: { layout: "fullscreen" },
};

export function Normal() {
  const alert = useAlert((name: string) => ({
    message: `Hello ${name}!`,
    onClose: action("close"),
  }));

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => alert.show("Bob")}>Show Alert</ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function WithTitle() {
  const alert = useAlert((name: string) => ({
    title: `Hello!`,
    message: `It's lovely to meet you, ${name}! Here's some long text that should wrap around to the next line.`,
    onClose: action("close"),
    okText: "Cheers",
  }));

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => alert.show("Bob")}>Show Alert</ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function Sticky() {
  const alert = useAlert(
    () => ({
      title: "Working…",
      hideButtons: true,
    }),
    { sticky: true },
  );

  function showAlert() {
    alert.show();
    setTimeout(() => alert.hide(), 5000);
  }

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={showAlert}>Show Sticky Alert</ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function Stretched() {
  const alert = useAlert(() => ({ message: "Hi", onClose: action("close") }), {
    stretch: true,
  });

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={alert.show}>Show Alert</ModalStoryButton>
    </ModalStoryButtons>
  );
}

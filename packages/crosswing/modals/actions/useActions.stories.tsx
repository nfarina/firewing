import { action } from "storybook/actions";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalStoryButton, ModalStoryButtons } from "../storybook/ModalStoryButtons.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { useActions } from "./useActions.js";

export default {
  component: useActions,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator, RouterDecorator],
  parameters: { layout: "fullscreen" },
};

export function Normal() {
  const actions = useActions(() => [
    { title: "Copy", onClick: () => action("copy")() },
    { title: "Navigate", to: "/somewhere" },
    {
      title: "Delete",
      destructive: true,
      onClick: () => action("delete")(),
    },
  ]);

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={actions.show}>Show Actions</ModalStoryButton>
    </ModalStoryButtons>
  );
}

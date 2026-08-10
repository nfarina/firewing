import { use } from "react";
import { colors } from "../../colors/colors.js";
import { useInterval } from "../../hooks/useInterval.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { useAlert } from "../alert/useAlert.js";
import { ModalContext } from "../context/ModalContext.js";
import { ModalStoryButton, ModalStoryButtons } from "../storybook/ModalStoryButtons.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { useToast } from "./useToast.js";

export default {
  component: useToast,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator, RouterDecorator],
  parameters: { layout: "fullscreen" },
};

export function Normal() {
  const { showToast } = use(ModalContext);

  function showNormalToast() {
    showToast({
      title: "Auto-Dismissing Toast",
      message: "This will go away after a few seconds.",
      onClick: () => console.log("click"),
    });
  }

  const updatable = useToast((number: number) => ({
    title: "New Version Available",
    message: (
      <>Click to update to the latest version of Crosswing. Random updating number: {number}</>
    ),
    sticky: true,
    onClick: () => console.log("click"),
    onClose: () => console.log("close"),
  }));

  useInterval(() => updatable.show(Math.random()), updatable.isVisible ? 1000 : null, [
    updatable.isVisible,
  ]);

  const alert = useAlert(() => ({
    title: "Alert That Unmounts",
    message: "The toast should remain visible after clicking OK to dismiss the Alert.",
    children: <ShowStickyToastButton />,
  }));

  return (
    <ModalStoryButtons style={{ background: colors.textBackgroundAlt() }}>
      <ModalStoryButton onClick={showNormalToast}>Show One-Off</ModalStoryButton>
      <ModalStoryButton onClick={() => updatable.show(1)}>Show Updatable</ModalStoryButton>
      <ModalStoryButton onClick={alert.show}>Show Alert First</ModalStoryButton>
    </ModalStoryButtons>
  );
}

function ShowStickyToastButton() {
  const { showToast } = use(ModalContext);

  const onShowClick = () => {
    showToast({ message: "Stays open until user dismisses.", sticky: true });
  };

  return (
    <ModalStoryButton style={{ margin: "10px" }} onClick={onShowClick}>
      Show Sticky Toast
    </ModalStoryButton>
  );
}

import { StoryObj } from "@storybook/react";
import { colors } from "../../colors/colors.js";
import { MockHostProvider } from "../../host/mocks/MockHostProvider.js";
import { NavLayout } from "../../router/navs/NavLayout.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalContextProvider } from "../context/ModalContextProvider.js";
import { ModalStoryButton, ModalStoryButtons } from "../storybook/ModalStoryButtons.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { useSheet } from "./useSheet.js";

export default {
  component: useSheet,
};

export const Normal: StoryObj = {
  render: () => <SheetPresenter />,
  decorators: [CrosswingAppDecorator({ layout: "mobile" }), ModalDecorator, RouterDecorator],
  parameters: { layout: "centered" },
};

export const Sliding: StoryObj = {
  render: () => (
    // Simulate an iOS device which gets the slide-up animation.
    <MockHostProvider container="ios">
      {/* Redeclare this to pick up the simulated host. */}
      <ModalContextProvider>
        <SheetPresenter />
      </ModalContextProvider>
    </MockHostProvider>
  ),
  decorators: [CrosswingAppDecorator({ layout: "mobile" }), ModalDecorator, RouterDecorator],
  parameters: { layout: "centered" },
};

export const Desktop: StoryObj = {
  render: () => (
    <ModalContextProvider allowDesktopPresentation>
      <SheetPresenter />
    </ModalContextProvider>
  ),
  parameters: {
    layout: "fullscreen",
  },
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator, RouterDecorator],
};

export const DesktopWide: StoryObj = {
  render: () => (
    <ModalContextProvider allowDesktopPresentation>
      <SheetPresenter wide />
    </ModalContextProvider>
  ),
  parameters: {
    layout: "fullscreen",
  },
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator, RouterDecorator],
};

//
// Actual Sheet
//

function SheetPresenter({ wide }: { wide?: boolean }) {
  const sheet = useSheet(
    () => (
      <NavLayout
        isApplicationRoot
        title="Sheet Nav"
        right={{ title: "Done", onClick: sheet.hide }}
        style={{ background: colors.textBackground() }}
      />
    ),
    wide ? { stretch: { maxWidth: "700px", maxHeight: "300px" } } : {},
  );

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={sheet.show}>Show Sheet</ModalStoryButton>
    </ModalStoryButtons>
  );
}

import { StoryObj } from "@storybook/react";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { HostLayoutDebug } from "../host/debug/HostLayoutDebug.js";
import { MockDevice } from "../host/mocks/MockDevice.js";
import { duoClosedPortraitLayout, duoOpenLandscapeLayout } from "../host/mocks/layouts.js";
import { HostLayout } from "../host/util/types.js";
import { ModalRootProvider } from "../modals/context/ModalRootProvider.js";
import { DialogContainer } from "../modals/dialog/useDialog.js";
import { SheetContainer } from "../modals/sheet/useSheet.js";
import { NavLayout } from "../router/navs/NavLayout.js";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { safeArea } from "./safeArea.js";

/**
 * How the safe area passes through containers. Content inside a modal draws
 * the safe area it inherits as red bands. A floating sheet or dialog is
 * already clear of the screen edges, so any red inside one means its content
 * is padding for edges it isn't near.
 */
export default {
  parameters: { layout: "centered" },
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), RouterDecorator],
};

export const FloatingSheet: StoryObj = {
  render: () => (
    <Device layout={duoOpenLandscapeLayout}>
      <SheetContainer onClose={action("onClose")} children={<ModalContent />} />
    </Device>
  ),
};

/**
 * Forced full screen, since the sheet decides with a media query against the
 * browser window, not the mock device. Content here should keep its insets.
 */
export const FullScreenSheet: StoryObj = {
  render: () => (
    <Device layout={duoClosedPortraitLayout}>
      <SheetContainer onClose={action("onClose")} forceFullScreen children={<ModalContent />} />
    </Device>
  ),
};

export const Dialog: StoryObj = {
  render: () => (
    <Device layout={duoOpenLandscapeLayout}>
      <DialogContainer onClose={action("onClose")}>
        <StyledDialogContent>
          <SafeAreaBands />
          Dialog content
        </StyledDialogContent>
      </DialogContainer>
    </Device>
  ),
};

/** A device with a modal root that allows floating presentation, like our apps. */
function Device({ layout, children }: { layout: HostLayout; children: React.ReactNode }) {
  return (
    <MockDevice layout={layout}>
      <ModalRootProvider allowDesktopPresentation>
        <StyledPage>
          Page underneath
          <StyledModalLayer>{children}</StyledModalLayer>
        </StyledPage>
      </ModalRootProvider>
      <HostLayoutDebug overlay readout={false} />
    </MockDevice>
  );
}

/** Stands in for something like CreateRecipeFlow: a nav bar over bottom-padded content. */
function ModalContent() {
  return (
    <NavLayout isApplicationRoot title="Sheet" style={{ background: colors.textBackground() }}>
      <StyledSheetBody>
        <SafeAreaBands />
        Content padded by the bottom safe area
      </StyledSheetBody>
    </NavLayout>
  );
}

/** Draws the safe area this element inherits, as bands along each edge. */
function SafeAreaBands() {
  return (
    <StyledSafeAreaBands>
      <div className="top" />
      <div className="right" />
      <div className="bottom" />
      <div className="left" />
    </StyledSafeAreaBands>
  );
}

const StyledSafeAreaBands = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  > * {
    position: absolute;
    background: ${colors.red({ alpha: 0.35 })};
  }

  > .top {
    top: 0;
    left: 0;
    right: 0;
    height: ${safeArea.top()};
  }

  > .right {
    top: 0;
    right: 0;
    bottom: 0;
    width: ${safeArea.right()};
  }

  > .bottom {
    left: 0;
    right: 0;
    bottom: 0;
    height: ${safeArea.bottom()};
  }

  > .left {
    top: 0;
    left: 0;
    bottom: 0;
    width: ${safeArea.left()};
  }
`;

const StyledPage = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.textBackgroundAlt()};
  color: ${colors.textSecondary()};
`;

const StyledModalLayer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-flow: column;

  > * {
    flex-grow: 1;
  }
`;

const StyledSheetBody = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  padding-bottom: calc(20px + ${safeArea.bottom()});
  font: ${fonts.display({ size: 14 })};
  color: ${colors.textSecondary()};
`;

const StyledDialogContent = styled.div`
  position: relative;
  width: 320px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: ${colors.textBackground()};
  font: ${fonts.display({ size: 14 })};
  color: ${colors.textSecondary()};
`;

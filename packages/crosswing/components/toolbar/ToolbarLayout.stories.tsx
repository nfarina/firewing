import { Meta, StoryFn } from "@storybook/react";
import { use, useState } from "react";
import { createPortal } from "react-dom";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { useAsyncTask } from "../../hooks/useAsyncTask.js";
import { ModalContextProvider } from "../../modals/context/ModalContextProvider.js";
import { usePopup } from "../../modals/popup/usePopup.js";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { BrowserSimulator, RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { wait } from "../../shared/wait.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { NoContent } from "../NoContent.js";
import { PopupMenu, PopupMenuText } from "../PopupMenu.js";
import { SelectOption } from "../forms/Select.js";
import {
  Toolbar,
  ToolbarButton,
  ToolbarInsertionPoint,
  ToolbarMoreButton,
  ToolbarPanelButton,
  ToolbarPopupButton,
  ToolbarSelect,
  ToolbarSpace,
} from "../toolbar/Toolbar.js";
import { ToolbarContext } from "./ToolbarContext.js";
import { ToolbarIDView } from "./ToolbarIDView.js";
import { ToolbarLayout } from "./ToolbarLayout.js";
import { ToolbarOverflowTab } from "./ToolbarOverflowTab.js";
import { ToolbarTab } from "./ToolbarTab.js";

export default {
  component: ToolbarLayout,
  decorators: [
    (Story: () => any) => <Container children={<Story />} />,
    CrosswingAppDecorator(),
    ModalDecorator,
    RouterDecorator,
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ToolbarLayout>;

type Story = StoryFn<typeof ToolbarLayout>;

export const InsertionPoints: Story = (args) => (
  <ToolbarLayout {...args}>
    <Toolbar>
      <ToolbarInsertionPoint name="beforeRefresh" />
      <ToolbarButton children="Refresh" />
      <ToolbarSpace />
      <ToolbarInsertionPoint name="beforeMore" />
      {/* Test that unused insertion points don't take up visual space. */}
      <ToolbarInsertionPoint name="unused" />
      <ToolbarMoreButton />
      <ToolbarInsertionPoint name="afterMore" />
    </Toolbar>
    <InsertionPointsContent />
  </ToolbarLayout>
);

function InsertionPointsContent() {
  const { getInsertionRef } = use(ToolbarContext);

  const [showBack, setShowBack] = useState(true);

  const backButton = <ToolbarButton children="Back" onClick={action("backClick")} />;

  const runButton = <ToolbarButton children="Run" onClick={action("runClick")} />;
  const panelButton = <ToolbarPanelButton active onClick={action("panelClick")} />;

  const backInsertionEl = getInsertionRef("beforeRefresh").current;
  const beforeMoreInsertionEl = getInsertionRef("beforeMore").current;
  const afterMoreInsertionEl = getInsertionRef("afterMore").current;

  return (
    <>
      {showBack && backInsertionEl && createPortal(backButton, backInsertionEl)}
      {beforeMoreInsertionEl && createPortal(runButton, beforeMoreInsertionEl)}
      {afterMoreInsertionEl && createPortal(panelButton, afterMoreInsertionEl)}
      <NoContent
        title="Content"
        action={showBack ? "Hide Back Button" : "Show Back Button"}
        onActionClick={() => setShowBack((value) => !value)}
      />
    </>
  );
}

export const Buttons: Story = (args) => {
  const task = useAsyncTask({ func: () => wait(2000), onError: null });

  return (
    <ToolbarLayout {...args}>
      <Toolbar>
        <ToolbarButton children="Enabled" onClick={task.run} working={task.isRunning} />
        <ToolbarButton children="Disabled" disabled />
        <ToolbarButton children="Working" working />
        <ToolbarSpace />
        <ToolbarButton children="New…" primary />
        <ToolbarMoreButton />
      </Toolbar>
      <NoContent title="Content" />
    </ToolbarLayout>
  );
};

export const Select: Story = (args) => {
  const menu = usePopup(() => (
    <PopupMenu>
      <PopupMenuText children="This is a menu." />
    </PopupMenu>
  ));

  return (
    <ToolbarLayout {...args}>
      <Toolbar>
        <ToolbarButton children="Button" />
        <ToolbarSelect defaultValue="green">
          <SelectOption title="Red" value="red" />
          <SelectOption title="Green" value="green" />
          <SelectOption title="Blue" value="blue" />
        </ToolbarSelect>
        <ToolbarPopupButton children="Popup" popup={menu} />
      </Toolbar>
      <NoContent title="Content" />
    </ToolbarLayout>
  );
};

export const Tabs: Story = (args) => {
  return (
    <BrowserSimulator initialPath="one">
      <ModalContextProvider>
        <ToolbarLayout {...args}>
          <Toolbar>
            <ToolbarOverflowTab>
              <ToolbarTab children="Sub Item One" to="one" />
              <ToolbarTab children="Sub Item Two" to="two" />
            </ToolbarOverflowTab>
            <ToolbarTab children="Tab Button" onClick={action("tabButtonClick")} />
            <ToolbarTab children="Tab Link" to="somewhere" />
          </Toolbar>
          <NoContent title="Content" />
        </ToolbarLayout>
      </ModalContextProvider>
    </BrowserSimulator>
  );
};

export const ExpandedTabs: Story = (args) => {
  return (
    <ToolbarLayout {...args}>
      <Toolbar expandTabs>
        <ToolbarTab children="Tab Button" onClick={action("tabButtonClick")} />
        <ToolbarTab children="Tab Link" to="somewhere" />
      </Toolbar>
      <NoContent title="Content" />
    </ToolbarLayout>
  );
};

export const IDView: Story = (args) => {
  return (
    <ToolbarLayout {...args}>
      <Toolbar>
        <ToolbarButton children="Here" />
        <ToolbarButton children="To" />
        <ToolbarButton children="Take" />
        <ToolbarButton children="Up" />
        <ToolbarButton children="Space" />
        <ToolbarIDView name="Some Object" id="abc123shouldbetruncated" />
      </Toolbar>
      <NoContent title="Content" />
    </ToolbarLayout>
  );
};

const Container = styled.div`
  width: 500px;
  height: 400px;
  border: 1px solid ${colors.separator()};

  > * {
    height: 100%;
  }
`;

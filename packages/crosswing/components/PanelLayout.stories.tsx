import { useState } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { PanelLayout, PanelToggleInsertionPoint } from "./PanelLayout.js";
import { Toolbar, ToolbarInsertionPoint, ToolbarSpace } from "./toolbar/Toolbar.js";
import { ToolbarLayout } from "./toolbar/ToolbarLayout.js";

export default {
  component: PanelLayout,
  decorators: [ToolbarContainer, CrosswingAppDecorator({ layout: "fullscreen" })],
  parameters: { layout: "fullscreen" },
};

export const Default = () => {
  const [panelVisible, setPanelVisible] = useState(true);

  return (
    <PanelLayout
      panelDefaultSize={300}
      panelMinSize={200}
      contentMinSize={400}
      panelVisible={panelVisible}
      onPanelVisibleChange={setPanelVisible}
      restorationKey={Default}
    >
      <Content>Contents of the main area</Content>
      <Panel>Panel content here</Panel>
    </PanelLayout>
  );
};

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.textBackgroundPanel()};
  color: ${colors.text()};
  font: ${fonts.display({ size: 15 })};
`;

const Panel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.textBackground()};
  color: ${colors.text()};
  font: ${fonts.display({ size: 15 })};
  border-left: 1px solid ${colors.separator()};
`;

function ToolbarContainer(Story: () => any) {
  return (
    <ToolbarLayout>
      <Toolbar>
        <ToolbarSpace />
        <ToolbarInsertionPoint name={PanelToggleInsertionPoint} />
      </Toolbar>
      <Story />
    </ToolbarLayout>
  );
}

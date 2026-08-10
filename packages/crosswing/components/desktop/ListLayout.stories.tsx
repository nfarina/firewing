import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ListLayout } from "./ListLayout.js";

export default {
  component: ListLayout,
  decorators: [RouterDecorator, CrosswingAppDecorator({ layout: "fullscreen" })],
  parameters: { layout: "fullscreen" },
};

export const Default = () => (
  <ListLayout restorationKey={Default}>
    <List>List of Stuff</List>
    <Content>Contents of said stuff</Content>
  </ListLayout>
);

const List = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.textBackground()};
  color: ${colors.text()};
  font: ${fonts.display({ size: 15 })};
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.textBackgroundPanel()};
  color: ${colors.text()};
  font: ${fonts.display({ size: 15 })};
`;

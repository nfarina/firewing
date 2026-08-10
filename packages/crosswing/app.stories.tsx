import { Meta } from "@storybook/react";
import styled from "styled-components";
import { CrosswingApp } from "./app.js";
import { ColorView } from "./colors/ColorView.js";
import { colors, hexColor, shadows } from "./colors/colors.js";
import { fonts } from "./fonts/fonts.js";
import { MockHostProvider } from "./host/mocks/MockHostProvider.js";
import { safeArea } from "./safearea/safeArea.js";
import { CrosswingAppDecorator } from "./storybook.js";

export default {
  component: CrosswingApp,
  parameters: { layout: "centered" },
  decorators: [CrosswingAppDecorator({ layout: "centered" })],
} satisfies Meta<typeof CrosswingApp>;

export const DefaultTheme = () => <ColorView name="primary" color={colors.primaryGradient} />;

export const CustomTheme = () => (
  <CrosswingApp colors={[colors.primaryGradient.override(colors.orangeGradient)]}>
    <ColorView name="primary" color={colors.primaryGradient} />
  </CrosswingApp>
);

export const NestedThemes = () => (
  <CrosswingApp colors={[colors.primary.override(colors.darkGreen)]}>
    <ColorView name="primary" style={{ width: "80px", height: "80px" }} color={colors.primary}>
      <CrosswingApp transparent colors={[colors.primary.override(hexColor("#ff0000"))]}>
        <ColorView
          name="primary"
          style={{ width: "30px", height: "30px" }}
          color={colors.primary}
        />
      </CrosswingApp>
    </ColorView>
  </CrosswingApp>
);

export const DecoratorTheme = () => <ColorView name="primary" color={colors.primaryGradient} />;

DecoratorTheme.decorators = [
  CrosswingAppDecorator({
    colors: [colors.primaryGradient.override(colors.blueGradient)],
  }),
];

export const SafeArea = () => (
  <MockHostProvider
    // Simulate an iOS container with a custom safe area.
    container="ios"
    safeArea={{
      top: "20px",
      left: "0",
      right: "0",
      bottom: "40px",
    }}
  >
    <SafeAreaView>
      <div>Inside safe area</div>
    </SafeAreaView>
  </MockHostProvider>
);

const SafeAreaView = styled.div`
  padding-top: ${safeArea.top()};
  padding-bottom: ${safeArea.bottom()};
  padding-left: ${safeArea.left()};
  padding-right: ${safeArea.right()};

  width: 300px;
  height: 300px;
  background: ${colors.primaryGradient()};
  display: flex;
  flex-flow: column;
  box-shadow: ${shadows.card()}, ${shadows.cardBorder()};

  > div {
    flex-grow: 1;
    background: ${colors.textBackground()};
    flex-grow: 1;
    font: ${fonts.display({ size: 14 })};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

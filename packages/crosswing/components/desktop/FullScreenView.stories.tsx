import { use } from "react";
import styled from "styled-components";
import { colors } from "../../colors/colors";
import { fonts } from "../../fonts/fonts";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { FullScreenContext, FullScreenView } from "./FullScreenView.js";

export default {
  component: FullScreenView,
  decorators: [
    CrosswingAppDecorator({ layout: "fullscreen" }),
    ModalDecorator,
    RouterDecorator, // Has <Suspense> to test lazy().
  ],
  parameters: { layout: "fullscreen" },
};

export const Default = () => (
  <Container>
    <FullScreenView restorationKey={Default} title="Default" threshold={1}>
      <Content />
    </FullScreenView>
  </Container>
);

export const DefaultFullScreen = () => (
  <Container>
    <FullScreenView
      restorationKey={DefaultFullScreen}
      title="This is a long title. This is a long title. This is a long title. This is a long title. This is a long title. This is a long title."
      defaultFullScreen
      threshold={1}
    >
      <Content />
    </FullScreenView>
  </Container>
);

export const SmallerThanThreshold = () => (
  <ResponsiveContainer>
    <FullScreenView
      restorationKey={SmallerThanThreshold}
      title="Smaller than threshold"
      style={{ width: "79%", height: "79%" }} // I used to test at 80% here but pixel rounding caused it to be larger than the threshold.
    >
      <Content />
    </FullScreenView>
  </ResponsiveContainer>
);

export const LargerThanThreshold = () => (
  <ResponsiveContainer>
    <FullScreenView
      restorationKey={LargerThanThreshold}
      title="Larger than threshold"
      style={{ width: "81%", height: "81%" }}
    >
      <Content />
    </FullScreenView>
  </ResponsiveContainer>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    width: 400px;
    height: 400px;
  }
`;

const ResponsiveContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Content() {
  const { isFullScreen } = use(FullScreenContext);

  return <StyledContent>{isFullScreen ? "Full Screen" : "Not Full Screen"}</StyledContent>;
}

const StyledContent = styled.div`
  display: flex;
  background: ${colors.darkGray()};
  color: ${colors.white()};
  font: ${fonts.display({ size: 18 })};
  justify-content: center;
  align-items: center;
`;

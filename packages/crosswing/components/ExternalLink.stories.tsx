import { action } from "storybook/actions";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { MockHostProvider } from "../host/mocks/MockHostProvider.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { ExternalLink } from "./ExternalLink.js";

export default {
  component: ExternalLink,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
};

export const Desktop = () => (
  <Container>
    This is a link to <ExternalLink href="https://x.com">somewhere else</ExternalLink>.
  </Container>
);

export const Mobile = () => (
  // This is a mock host provider that provides the `openUrl` function.
  <MockHostProvider openUrl={action("openUrl")}>
    <Container>
      This is a link to <ExternalLink href="https://x.com">somewhere else</ExternalLink>.
    </Container>
  </MockHostProvider>
);

const Container = styled.div`
  font: ${fonts.display({ size: 15 })};
  color: ${colors.text()};
`;

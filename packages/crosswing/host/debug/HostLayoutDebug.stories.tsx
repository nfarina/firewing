import { styled } from "styled-components";
import { CrosswingAppDecorator } from "../../storybook.js";
import { DeviceSimulator } from "../mocks/DeviceSimulator.js";
import { MockHostProvider } from "../mocks/MockHostProvider.js";
import { HostLayoutDebug } from "./HostLayoutDebug.js";

export default {
  component: HostLayoutDebug,
  parameters: { layout: "fullscreen" },
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" })],
};

export const Simulator = () => (
  <DeviceSimulator>
    <HostLayoutDebug />
  </DeviceSimulator>
);

export const NoHostLayout = () => (
  <MockHostProvider>
    <StyledFrame>
      <HostLayoutDebug />
    </StyledFrame>
  </MockHostProvider>
);

const StyledFrame = styled.div`
  position: relative;
  width: 390px;
  height: 844px;
`;

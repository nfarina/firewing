import { Meta } from "@storybook/react";
import dayjs from "dayjs";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Timestamp, setTimestampUpdateInterval } from "./Timestamp.js";

setTimestampUpdateInterval(500);

export default {
  component: Timestamp,
  decorators: [ContainerDecorator, CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Timestamp>;

export const Default = () => <Timestamp date={1554744840915} />;

export const Today = () => <Timestamp static date={Date.now()} />;

export const Format = () => <Timestamp date={1554744840915} format="MMMM D, YYYY" />;

export const Custom = () => <Timestamp date={1554744840915} format={customFormatter} />;

export const Relative = () => (
  // Need to use static because we only hijack Date.now() on the initial render.
  <Timestamp static date={Date.now() - 42000} format={relativeFormatter} />
);

function ContainerDecorator(Story: () => any) {
  return <Container children={<Story />} />;
}

const Container = styled.div`
  font: ${fonts.display({ size: 16 })};
  color: ${colors.text()};
`;

function customFormatter(date: number): string {
  return dayjs(date).format("h:mm a [HOOT HOOT]");
}

function relativeFormatter(date: number): string {
  const secondsAgo = Math.round((Date.now() - date) / 1000);
  return `${secondsAgo} seconds ago`;
}

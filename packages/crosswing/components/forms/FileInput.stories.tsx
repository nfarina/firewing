import { Meta, StoryFn } from "@storybook/react";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { FileInput } from "./FileInput.js";
import { TextCell } from "./TextCell.js";

export default {
  component: FileInput,
  decorators: [SeparatorDecorator, CrosswingAppDecorator({ layout: "component" })],
  parameters: { layout: "centered" },
} satisfies Meta<typeof FileInput>;

type Story = StoryFn<typeof FileInput>;

export const Default: Story = () => (
  <StyledFileInput onFileSelect={(file) => action("onFileSelect")(file.name)}>
    <TextCell title="Click to Upload" subtitle="Drag & Drop Supported" />
  </StyledFileInput>
);

export const Multiple: Story = () => (
  <StyledFileInput
    multiple
    onFileListSelect={(list) => action("onFileListSelect")(Array.from(list).map((f) => f.name))}
  >
    <TextCell title="Click to Upload (Multiple)" subtitle="Drag & Drop Supported" />
  </StyledFileInput>
);

// Customize FileInput to change background color on hover.
const StyledFileInput = styled(FileInput)`
  &[data-dragging-over="true"] {
    background: ${colors.textBackgroundAlt()};
  }
`;

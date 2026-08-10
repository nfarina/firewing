import { Meta, StoryObj } from "@storybook/react";
import { action } from "storybook/actions";
import styled from "styled-components";
import { usePopup } from "../modals/popup/usePopup.js";
import { ModalDecorator } from "../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { PopupButton } from "./PopupButton.js";
import { PopupMenu, PopupMenuText } from "./PopupMenu.js";

export default {
  component: PopupButton,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof PopupButton>;

type Story = StoryObj<typeof PopupButton>;

export const Default: Story = {
  args: {
    children: "Menu",
    popup: {
      onClick: action("onClick"),
      visible: false,
    } as any,
  },
};

export const Opened: Story = {
  args: {
    children: "Menu",
    popup: {
      onClick: action("onClick"),
      visible: true,
    } as any,
  },
};

export const WithPopup: Story = {
  args: {
    children: "Options",
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [ModalDecorator, CrosswingAppDecorator({ layout: "fullscreen" })],
  render: (args) => {
    // oxlint-disable-next-line eslint-plugin-react-hooks/rules-of-hooks
    const menu = usePopup(() => (
      <PopupMenu>
        <PopupMenuText children="This is a menu." />
      </PopupMenu>
    ));

    return (
      <Centered>
        <PopupButton {...args} popup={menu} />
      </Centered>
    );
  },
};

export const NewStyle: Story = {
  args: {
    children: "Options",
    newStyle: true,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [ModalDecorator, CrosswingAppDecorator({ layout: "fullscreen" })],
  render: (args) => {
    // oxlint-disable-next-line eslint-plugin-react-hooks/rules-of-hooks
    const menu = usePopup(() => (
      <PopupMenu>
        <PopupMenuText children="This is a menu." />
      </PopupMenu>
    ));

    return (
      <Centered>
        <PopupButton {...args} popup={menu} />
      </Centered>
    );
  },
};

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

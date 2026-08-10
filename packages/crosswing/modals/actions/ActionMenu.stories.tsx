import { Meta } from "@storybook/react";
import { action } from "storybook/actions";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ActionMenu, ActionSeparator } from "./ActionMenu.js";
import { ActionContainer } from "./useActions.js";

export default {
  component: ActionMenu,
  decorators: [
    CrosswingAppDecorator({ layout: "mobile" }),
    ActionContainerDecorator,
    RouterDecorator,
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ActionMenu>;

function ActionContainerDecorator(Story: () => any) {
  return (
    <ActionContainer onClose={action("close")}>
      <Story />
    </ActionContainer>
  );
}

export const Menu = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      { title: "Edit Amount", onClick: action("edit amount") },
      { title: "Edit Retailer", onClick: action("edit retailer") },
    ]}
  />
);

export const Groups = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      { title: "Settings…", onClick: action("settings") },
      ActionSeparator,
      { title: "Edit Amount", disabled: true, onClick: action("edit amount") },
      { title: "Edit Retailer", onClick: action("edit retailer") },
    ]}
  />
);

export const Destructive = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      { title: "Copy", onClick: action("copy") },
      { title: "Delete", onClick: action("delete"), destructive: true },
    ]}
  />
);

export const DestructiveWithSubtitles = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      {
        title: "Personal Checking",
        subtitle: "••••1234",
        onClick: action("copy"),
      },
      {
        title: "Business Checking",
        subtitle: "••••4321",
        onClick: action("delete"),
        destructive: true,
      },
    ]}
  />
);

export const Selected = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      { title: "Red", onClick: action("red"), selected: true },
      { title: "Blue", onClick: action("blue") },
    ]}
  />
);

export const Subtitle = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      {
        title: "Standard",
        subtitle: "Normal user account",
        onClick: action("standard"),
        selected: true,
      },
      { title: "Virtual", subtitle: "Can't log in", onClick: action("blue") },
    ]}
  />
);

export const Overflow = () => (
  <ActionMenu
    onClose={action("close")}
    items={[
      { title: "Apple" },
      { title: "Blueberry" },
      { title: "Cherry" },
      { title: "Date" },
      { title: "Elderberry" },
      { title: "Fig" },
      { title: "Grape" },
      { title: "Honeydew" },
      { title: "Iris" },
      { title: "Jackfruit" },
      { title: "Kiwi" },
      { title: "Lemon" },
      { title: "Mango" },
      { title: "Nectarine" },
      { title: "Orange" },
      { title: "Papaya" },
      { title: "Quince" },
      { title: "Raspberry" },
      { title: "Strawberry" },
      { title: "Tangerine" },
      { title: "Ugli Fruit" },
      { title: "Vanilla Bean" },
      { title: "Watermelon" },
      { title: "Xanthum" },
      { title: "Yarrow" },
      { title: "Zucchini" },
    ]}
  />
);

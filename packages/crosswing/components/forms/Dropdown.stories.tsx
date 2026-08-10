import { Meta } from "@storybook/react";
import { useState } from "react";
import styled from "styled-components";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Dropdown } from "./Dropdown.js";
import { Compass, Check } from "lucide-react";

export default {
  component: Dropdown,
  decorators: [
    (Story) => <Container children={<Story />} />,
    CrosswingAppDecorator({ layout: "fullscreen" }),
    ModalDecorator,
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dropdown>;

export const Basic = () => {
  const [value, setValue] = useState("green");

  return (
    <Dropdown
      value={value}
      onValueChange={setValue}
      items={[
        { value: "red", children: "Red" },
        { value: "green", children: "Green" },
        { value: "blue", children: "Blue" },
      ]}
    />
  );
};

export const WithPlaceholder = () => {
  const [value, setValue] = useState("");

  return (
    <Dropdown
      value={value}
      onValueChange={setValue}
      placeholder="Choose a color..."
      items={[
        { value: "red", children: "Red" },
        { value: "green", children: "Green" },
        { value: "blue", children: "Blue" },
      ]}
    />
  );
};

export const WithIconsAndDetails = () => {
  const [value, setValue] = useState("admin");

  return (
    <Dropdown
      value={value}
      onValueChange={setValue}
      items={[
        {
          value: "admin",
          children: "Administrator",
          detail: "Full access to all features",
          icon: <Compass />,
        },
        {
          value: "editor",
          children: "Editor",
          detail: "Can create and edit content",
          icon: <Check />,
        },
        {
          value: "viewer",
          children: "Viewer",
          detail: "Read-only access",
          disabled: true,
        },
      ]}
    />
  );
};

export const Disabled = () => (
  <Dropdown
    disabled
    placeholder="This dropdown is disabled"
    items={[
      { value: "one", children: "Option One" },
      { value: "two", children: "Option Two" },
    ]}
  />
);

export const Empty = () => <Dropdown placeholder="No options available" items={[]} />;

export const LongText = () => {
  const [value, setValue] = useState("option1");

  return (
    <div style={{ width: 200 }}>
      <Dropdown
        value={value}
        onValueChange={setValue}
        items={[
          {
            value: "option1",
            children: "This is a very long option that should truncate nicely",
            detail: "With additional details that are also quite lengthy",
          },
          {
            value: "option2",
            children: "Short option",
          },
        ]}
      />
    </div>
  );
};

export const KeyboardNavigation = () => {
  const [value, setValue] = useState("item2");

  return (
    <div>
      <p style={{ marginBottom: "20px", maxWidth: "300px", textAlign: "center" }}>
        <strong>Keyboard Navigation Test:</strong>
        <br />
        Click dropdown, then use <kbd>Tab</kbd> or arrow keys to navigate
        <br />
        <kbd>Enter</kbd>/<kbd>Space</kbd> to select • <kbd>Escape</kbd> to close
      </p>
      <Dropdown
        value={value}
        onValueChange={setValue}
        placeholder="Test keyboard navigation..."
        items={[
          {
            value: "item1",
            children: "First Item",
            icon: <Check />,
          },
          {
            value: "item2",
            children: "Second Item (Selected)",
            detail: "This item is pre-selected",
            icon: <Compass />,
          },
          {
            value: "item3",
            children: "Disabled Item",
            detail: "This item cannot be selected",
            disabled: true,
          },
          {
            value: "item4",
            children: "Final Item",
            detail: "Last option in the list",
          },
        ]}
      />
    </div>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

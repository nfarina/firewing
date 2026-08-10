import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { action } from "storybook/actions";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { Button } from "./Button.js";
import { X, MoreHorizontal, AlertTriangle } from "lucide-react";

export default {
  component: Button,
  decorators: [CrosswingAppDecorator(), RouterDecorator],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;

type Story = StoryFn<typeof Button>;

export const WithChildren: Story = () => <Button children="Hello!" onClick={action("onClick")} />;

export const Disabled: Story = () => (
  <Button disabled children="Hello!" onClick={action("onClick")} />
);

export const Working: Story = () => (
  <Button working children="Hello!" onClick={action("onClick")} />
);

export const WorkingState: Story = () => {
  const [working, setWorking] = useState(false);

  function onClick() {
    setWorking(true);
    setTimeout(() => setWorking(false), 2000);
  }

  return <Button children="Hello!" onClick={onClick} working={working} />;
};

export const PrimarySmaller: Story = () => (
  <Button size="smaller" primary children="Hello!" onClick={action("onClick")} />
);

export const PrimaryNormal: Story = () => (
  <Button primary children="Hello!" onClick={action("onClick")} />
);

export const PrimaryNormalWithDescender: Story = () => (
  <Button primary children="Engage!" onClick={action("onClick")} />
);

export const PrimaryLarger: Story = () => (
  <Button size="larger" primary children="Hello!" onClick={action("onClick")} />
);

export const PrimaryLargest: Story = () => (
  <Button size="largest" primary children="Hello!" onClick={action("onClick")} />
);

// export const WithSubtitle: Story = () => (
//   <Button
//     primary
//     children="Buy Now"
//     subchildren="Terms Apply"
//     onClick={action("onClick")}
//   />
// );

// export const WithSubtitleSmaller: Story = () => (
//   <Button
//     primary
//     size="smaller"
//     children="Buy Now"
//     subchildren="Terms Apply"
//     onClick={action("onClick")}
//   />
// );

// export const WithSubtitleLarger: Story = () => (
//   <Button
//     primary
//     size="larger"
//     children="Buy Now"
//     subchildren="Terms Apply"
//     onClick={action("onClick")}
//   />
// );

export const IconOnly: Story = () => <Button icon={<X />} onClick={action("onClick")} />;

export const IconAndTitle: Story = () => (
  <Button icon={<AlertTriangle />} children="Error Details" onClick={action("onClick")} />
);

export const NewStyle: Story = () => (
  <Button newStyle children="New style" onClick={action("onClick")} />
);

export const NewStylePrimary: Story = () => (
  <Button newStyle primary children="New style primary" onClick={action("onClick")} />
);

export const NewStyleBordered: Story = () => (
  <Button
    newStyle
    bordered
    pill
    icon={<AlertTriangle />}
    children="Bordered"
    onClick={action("onClick")}
  />
);

export const NewStyleIcon: Story = () => (
  <Button newStyle icon={<X />} onClick={action("onClick")} />
);

export const NewStyleCircularIcon: Story = () => (
  <Button newStyle pill icon={<MoreHorizontal />} onClick={action("onClick")} />
);

export const NewStyleAsLink: Story = () => (
  <Button newStyle to="/some-page" children="Go to page" />
);

export const NewStyleAsLinkPrimary: Story = () => (
  <Button newStyle to="/some-page" primary children="Go to page" />
);

export const NewStyleAsLinkNewTab: Story = () => (
  <Button newStyle to="https://example.com" target="_blank" children="Open in new tab" />
);

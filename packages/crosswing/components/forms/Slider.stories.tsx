import { Meta, StoryFn, StoryObj } from "@storybook/react";
import { useResettableState } from "../../hooks/useResettableState.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Slider } from "./Slider.js";

export default {
  component: Slider,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
    },
    onValueChange: { action: "change" },
  },
  args: {
    style: { minWidth: "200px" },
  },
} satisfies Meta<typeof Slider>;

const Template: StoryFn<typeof Slider> = ({
  value: initialValue,
  onValueChange: storybookOnValueChange,
  ...rest
}) => {
  // Allow new values to come in through Storybook Controls.
  const [value, setValue] = useResettableState(initialValue, [initialValue]);

  function onValueChange(newValue: number) {
    setValue(newValue);
    storybookOnValueChange?.(newValue);
  }

  return <Slider value={value} onValueChange={onValueChange} {...rest} />;
};

type Story = StoryObj<typeof Slider>;

export const Min: Story = {
  render: Template,
  args: { value: 0 },
};

export const Partial: Story = {
  render: Template,
  args: { value: 0.4 },
};

export const Max: Story = {
  render: Template,
  args: { value: 1 },
};

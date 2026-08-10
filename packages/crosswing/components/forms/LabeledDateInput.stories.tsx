import { Meta } from "@storybook/react";
import { useState } from "react";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { LabeledDateInput } from "./LabeledDateInput.js";

export default {
  component: LabeledDateInput,
  decorators: [
    SeparatorDecorator,
    ModalDecorator,
    RouterDecorator,
    CrosswingAppDecorator({ layout: "mobile" }),
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof LabeledDateInput>;

export const Empty = () => {
  const [date, setDate] = useState<null | number>(null);

  return (
    <LabeledDateInput
      style={{ marginTop: "50px" }}
      label="Date"
      value={date}
      onValueChange={setDate}
    />
  );
};

export const DefaultValue = () => {
  const [date, setDate] = useState<null | number>(Date.now());

  return (
    <LabeledDateInput
      style={{ marginTop: "50px" }}
      label="Date"
      value={date}
      onValueChange={setDate}
    />
  );
};

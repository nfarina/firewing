import { useState } from "react";
import { styled } from "styled-components";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { DateRange } from "./DateRange.js";
import { DateRangeInput, StyledDateRangeInput } from "./DateRangeInput.js";

export default {
  component: DateRangeInput,
  decorators: [ModalDecorator, CrosswingAppDecorator({ layout: "fullscreen" }), RouterDecorator],
  // Need a stretched layout for our modal to show.
  parameters: { layout: "fullscreen" },
};

export const Default = () => {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <Container>
      <DateRangeInput
        newStyle
        bordered
        value={range}
        onValueChange={setRange}
        popupAlignment="center"
      />
    </Container>
  );
};

export const InToolbar = () => {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <Container>
      <DateRangeInput
        newStyle
        bordered
        value={range}
        onValueChange={setRange}
        popupAlignment="center"
        inToolbar
      />
    </Container>
  );
};

export const LeftAligned = () => {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <Container data-popup-alignment="left">
      <DateRangeInput newStyle bordered value={range} onValueChange={setRange} />
    </Container>
  );
};

// Special layout putting the button at the top so that the desktop-mode
// popup can appear below.
const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;

  > ${StyledDateRangeInput} {
    margin-top: 10px;
    flex-shrink: 0;
  }

  &[data-popup-alignment="left"] {
    > ${StyledDateRangeInput} {
      align-self: flex-start;
      margin-left: 100px;
    }
  }
`;

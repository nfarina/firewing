import dayjs from "dayjs";
import { HTMLAttributes, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout.js";
import { Button, StyledButton } from "../Button.js";
import { dateRangeTransformer } from "../transformers/dateRangeTransformer.js";
import { CalendarView, StyledCalendarView } from "./CalendarView.js";
import {
  AllDateRangePresets,
  DateRange,
  areDateRangesEqual,
  dateRange,
  isSameDay,
} from "./DateRange.js";
import { usePrompt } from "./usePrompt.js";

export type DateRangeValueType = "selected" | "preset" | "custom";

export default function DateRangeControl({
  value,
  onValueChange,
  hidePresets,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  value: DateRange | null;
  onValueChange: (newValue: DateRange | null, type?: DateRangeValueType) => void;
  hidePresets?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const customPrompt = usePrompt(() => ({
    title: "Enter date range",
    message: "Date ranges are inclusive.",
    placeholder: "Ex: 1/1/2020 - 1/31/2020",
    transformer: dateRangeTransformer(),
    initialValue: value ?? undefined,
    onSubmit: (range: DateRange) => {
      onValueChange(range, "custom");
    },
  }));

  function onCalendarDateClick(date: number) {
    const clickedRange = dateRange(date);

    // If you clicked the a single date that is already selected,
    // deselect the range.
    if (areDateRangesEqual(clickedRange, value)) {
      onValueChange(null);
    }
    // If you clicked a date after the one that's selected, and the existing
    // range is just one day, then extend the range.
    else if (value && isSameDay(value) && clickedRange.start > value.end) {
      const start = dayjs(value.start).startOf("day").valueOf(); // Important to also extend the start date, because it could be in the middle of the day, but visually we're telling you that whole days are selected.
      const end = dayjs(clickedRange.start).endOf("day").valueOf();
      onValueChange(dateRange(start, end), "selected");
    }
    // Just select the exact range you selected.
    else {
      onValueChange(clickedRange, "selected");
    }
  }

  function onCalendarMonthClick(date: number) {
    const start = dayjs(date).startOf("month").valueOf();
    const end = dayjs(date).endOf("month").valueOf();
    onValueChange(dateRange(start, end), "selected");
  }

  const layout = useResponsiveLayout(ref, {
    mobile: {},
    desktop: { minWidth: 475 },
  });

  // On mobile layouts, we don't have enough space for "Last Year".
  const filteredPresets = AllDateRangePresets.filter(
    (preset) => layout === "desktop" || preset.title !== "Last Year",
  );

  return (
    <StyledDateRangeControl
      ref={ref}
      data-layout={layout}
      data-hide-presets={!!hidePresets}
      {...rest}
    >
      <CalendarView
        selectedRange={value}
        onDateClick={onCalendarDateClick}
        onMonthClick={onCalendarMonthClick}
      />
      <div className="separator" />
      <div className="presets">
        <Button size="smaller" children="Clear" onClick={() => onValueChange(null, "preset")} />
        {!hidePresets &&
          filteredPresets.map((preset) => (
            <Button
              key={preset.title}
              size="smaller"
              children={preset.title}
              onClick={() => onValueChange(preset.range(), "preset")}
            />
          ))}
        <Button size="smaller" children="Custom" onClick={customPrompt.show} />
      </div>
    </StyledDateRangeControl>
  );
}

export const StyledDateRangeControl = styled.div`
  display: flex;
  flex-flow: row;

  > ${StyledCalendarView} {
    padding: 0 10px;
    flex-grow: 1;
  }

  > .separator {
    width: 1px;
    margin: 10px 0;
    background: ${colors.separator()};
  }

  > .presets {
    padding: 10px;
    display: flex;
    flex-flow: column;
    overflow-y: auto;

    > * {
      flex-shrink: 0;
      flex-grow: 1;
      max-height: 40px;
    }

    > * + * {
      margin-top: 10px;
    }

    > ${StyledButton} {
      font: ${fonts.displayMedium({ size: 14 })};
    }
  }

  /* Mobile layout. */
  &[data-layout="mobile"] {
    flex-direction: column-reverse;

    > .presets {
      overflow: unset;
      padding-bottom: 0;
      display: grid;
      grid-gap: 10px;
      grid-template-columns: 1fr 1fr 1fr;

      > * {
        min-height: 40px;
      }

      > * + * {
        margin-top: unset;
      }
    }

    > .separator {
      display: none;
    }
  }

  &[data-layout="mobile"][data-hide-presets="true"] {
    > .presets {
      grid-template-columns: 1fr;
    }
  }
`;

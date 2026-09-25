import dayjs from "dayjs";
import { lazy, Suspense } from "react";
import { styled } from "styled-components";
import { PopupView } from "../../modals/popup/PopupView.js";
import { usePopup } from "../../modals/popup/usePopup.js";
import { useSheet } from "../../modals/sheet/useSheet.js";
import { LoadingCurtain } from "../LoadingCurtain.js";
import { PopupButton } from "../PopupButton.js";
import { ToolbarPopupButton } from "../toolbar/Toolbar.js";
import { AllDateRangePresets, areDateRangesEqual, DateRange } from "./DateRange.js";
import DateRangePicker from "./DateRangePicker.js";
import { useViewportSize } from "../../viewport/viewport.js";

const DateRangeControl = lazy(() => import("./DateRangeControl.js"));

export function DateRangeInput({
  value,
  onValueChange,
  popupAlignment = "left",
  inToolbar,
  ...rest
}: Omit<Parameters<typeof PopupButton>[0], "popup" | "value"> & {
  value: DateRange | null;
  onValueChange: (newValue: DateRange | null) => void;
  /**
   * Where to align the popup relative to the button. Defaults to "left".
   * Since the button can change size as the user selects dates, this allows
   * you to keep the popup in a consistent location.
   */
  popupAlignment?: "left" | "center" | "right";
  /** If true, renders a ToolbarPopupButton instead of a PopupButton. */
  inToolbar?: boolean;
}) {
  // Use a Popup for desktop layouts with lots of space.
  const popup = usePopup(
    () => (
      <DateRangePopupView>
        <Suspense fallback={<LoadingCurtain lazy />}>
          <DateRangeControl
            value={value}
            onValueChange={(newValue, type) => {
              onValueChange(newValue);
              if (type === "preset" || type === "custom") {
                // Hide the popup if you entered a custom value or clicked a preset
                // date range button.
                popup.hide();
              }
            }}
          />
        </Suspense>
      </DateRangePopupView>
    ),
    // The popup area's default is 80% of the window, which stretches the
    // calendar grid across very wide screens. Cap it just past the 475px
    // threshold where DateRangeControl switches to its desktop layout.
    { maxWidth: `${POPUP_MAX_WIDTH}px` },
  );

  // Use a sheet for mobile layouts.
  const sheet = useSheet(() => (
    <DateRangePicker onClose={sheet.hide} defaultRange={value} onDateSelected={onValueChange} />
  ));

  const mobileLayout = useViewportSize().width <= 500;

  function renderTitle() {
    // Does the value match one of the presets?
    for (const preset of AllDateRangePresets) {
      if (areDateRangesEqual(preset.range(), value)) {
        return preset.title;
      }
    }

    if (!value) {
      return "All Dates";
    }

    // A whole year?
    if (
      value.start === dayjs(value.start).startOf("year").valueOf() &&
      value.end === dayjs(value.start).endOf("year").valueOf()
    ) {
      return dayjs(value.start).format("YYYY");
    }

    // A whole month?
    if (
      value.start === dayjs(value.start).startOf("month").valueOf() &&
      value.end === dayjs(value.start).endOf("month").valueOf()
    ) {
      return dayjs(value.start).format("MMMM YYYY");
    }

    const from = dayjs(value.start).format("MMM D, YYYY");
    const to = dayjs(value.end).format("MMM D, YYYY");

    if (from === to) {
      return from;
    } else {
      return `${from} – ${to}`;
    }
  }

  return (
    <StyledDateRangeInput
      as={inToolbar ? ToolbarPopupButton : PopupButton}
      popup={mobileLayout ? null : popup}
      children={
        <>
          {renderTitle()}
          {/* We use a special class to cause our popup to position itself at a
          consistent location, since our button changes in size as you interact
          with the popup. Otherwise the popup would shift around, constantly
          trying to be in the middle of the button. */}
          <span data-popup-target data-alignment={popupAlignment} />
        </>
      }
      onClick={mobileLayout ? sheet.show : undefined}
      {...rest}
    />
  );
}

export const StyledDateRangeInput = styled(PopupButton)`
  position: relative;

  *[data-popup-target] {
    position: absolute;
    bottom: 0;

    &[data-alignment="left"] {
      left: 25px;
    }

    &[data-alignment="center"] {
      left: 50%;
    }

    &[data-alignment="right"] {
      right: 25px;
    }
  }
`;

/** Also applied via usePopup's maxWidth, which is what actually constrains it. */
const POPUP_MAX_WIDTH = 540;

const DateRangePopupView = styled(PopupView)`
  width: 100%;

  > .container {
    height: calc(100% - 10px);
    max-height: 600px;
  }
`;

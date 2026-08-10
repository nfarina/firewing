import { HTMLAttributes, lazy, ReactNode, Suspense } from "react";
import { styled } from "styled-components";
import { useSheet } from "../../modals/sheet/useSheet.js";
import { DateRangeLabel } from "../labels/DateRangeLabel.js";
import { LoadingCurtain } from "../LoadingCurtain.js";
import { DateRange } from "./DateRange.js";
import { TextCell } from "./TextCell.js";

const DateRangePicker = lazy(() => import("./DateRangePicker"));

/**
 * Renders a date range that the user can change, with a label.
 */
export function LabeledDateRangeInput({
  label,
  value,
  onValueChange,
  hideDisclosure,
  disabled,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  label?: ReactNode;
  value?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
  hideDisclosure?: boolean;
  disabled?: boolean;
}) {
  const datePicker = useSheet(() => (
    <Suspense fallback={<LoadingCurtain lazy />}>
      <DateRangePicker
        defaultRange={value ?? null}
        onDateSelected={onValueChange}
        onClose={datePicker.hide}
      />
    </Suspense>
  ));

  return (
    <StyledLabeledDateRangeInput
      label={label}
      title={<DateRangeLabel range={value} emptyText="Not Set" />}
      data-no-date={!value}
      onClick={datePicker.show}
      {...rest}
    />
  );
}

export const StyledLabeledDateRangeInput = styled(TextCell)`
  &[data-no-date="true"] {
    > .content {
      > .title {
        opacity: 0.5;
      }
    }
  }
`;

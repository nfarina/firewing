import { ChangeEvent, ReactElement, ReactNode, SelectHTMLAttributes, isValidElement } from "react";
import { ChevronDown } from "lucide-react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { flattenChildren } from "../../hooks/flattenChildren.js";

export interface SelectOptionProps {
  title?: string;
  value?: string;
}

export function Select({
  className,
  style,
  onValueChange,
  onChange,
  children,
  value,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  value?: string;
  onValueChange?: (newValue: any) => void;
  children?: ReactNode;
}) {
  function onSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onValueChange?.(e.currentTarget.value);
    onChange?.(e);
  }

  // Coerce children to array, flattening fragments and falsy conditionals.
  const options = flattenChildren(children).filter(isSelectOption);

  return (
    <StyledSelect
      className={className}
      style={style}
      data-disabled={!!rest.disabled || options.length === 0}
    >
      <InnerSelect value={value} onChange={onSelectChange} {...rest}>
        {options.map((option) => (
          <option key={option.props.value} value={option.props.value}>
            {option.props.title}
          </option>
        ))}
      </InnerSelect>
      {<ChevronDown className="arrow-icon" />}
    </StyledSelect>
  );
}

export function SelectOption({ title, value }: SelectOptionProps) {
  return null;
}
// We use this instead of comparing item.type === SelectOption because that class
// pointer is not stable during development with hot reloading.
SelectOption.isSelectOption = true;

function isSelectOption(child: ReactNode): child is ReactElement<SelectOptionProps> {
  return isValidElement(child) && !!child.type?.["isSelectOption"];
}

export const StyledSelect = styled.div`
  display: flex;
  flex-flow: row;
  position: relative;

  > select {
    flex-shrink: 0;
    flex-grow: 1;
  }

  > .arrow-icon {
    width: 20px;
    height: 20px;
    position: absolute;
    pointer-events: none;
    top: calc(50%);
    right: 4px;
    transform: translateY(-50%);
    color: ${colors.text()};
  }

  &[data-disabled="true"] {
    > .arrow-icon {
      opacity: 0.5;
    }
  }
`;

const InnerSelect = styled.select`
  appearance: none;
  outline: none;
  box-sizing: border-box;
  border-radius: 6px;
  background: ${colors.lightGray()};
  border: none;
  padding: 7px 10px 6px;
  color: ${colors.text()};
  font: ${fonts.displayBold({ size: 14 })};
  cursor: pointer;

  /* Account for arrow icon. */
  padding-right: calc(5px + 24px);

  @media (prefers-color-scheme: dark) {
    background: ${colors.black()};
  }

  &:disabled {
    cursor: default;

    /* Override user-agent stylesheet */
    border: none;
    opacity: 0.5;
  }
`;

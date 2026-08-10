import { CSSProperties } from "react";
import { styled } from "styled-components";
import { useErrorAlert } from "../../modals/alert/useErrorAlert";
import { ErrorLike, getErrorMessage } from "../../shared/errors";
import { StatusBanner } from "./StatusBanner";

export function ErrorBanner({
  error,
  style,
  maxLines = 2,
  ...rest
}: Omit<Parameters<typeof StatusBanner>[0], "type"> & {
  error?: ErrorLike;
  maxLines?: number;
}) {
  const errorAlert = useErrorAlert();

  const cssProps = {
    "--max-lines": maxLines,
    ...style,
  } as CSSProperties;

  return (
    <StyledErrorBanner
      type="error"
      {...rest}
      onClick={() => error && errorAlert.show(error)}
      style={cssProps}
    >
      {!!error && getErrorMessage(error)}
    </StyledErrorBanner>
  );
}

export const StyledErrorBanner = styled(StatusBanner)`
  > .children {
    /* Clamp to two lines max with ellipsis at the end. */
    display: -webkit-box;
    -webkit-line-clamp: var(--max-lines);
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

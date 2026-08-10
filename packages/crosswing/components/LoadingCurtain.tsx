import { HTMLAttributes, ReactNode, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { useTimeout } from "../hooks/useTimeout.js";
import { Seconds } from "../shared/timespan.js";
import { ProgressView } from "./ProgressView.js";
import { Spinner } from "./Spinner.js";

export function LoadingCurtain({
  hidden,
  type = "spinner",
  progress,
  message,
  smaller = false,
  lazy = false,
  ...rest
}: {
  hidden?: boolean;
  type?: "spinner" | "progress";
  progress?: number | null;
  message?: ReactNode;
  smaller?: boolean;
  lazy?: boolean | number;
} & HTMLAttributes<HTMLDivElement>) {
  const [waiting, setWaiting] = useState(!!lazy);

  useTimeout(() => setWaiting(false), typeof lazy === "number" ? lazy : Seconds(1));

  if (hidden) {
    return null; // don't render anything!
  }

  return (
    <StyledLoadingCurtain data-waiting={waiting} {...rest}>
      {type === "progress" ? (
        <ProgressView size="75px" thickness={0.05} progress={progress} />
      ) : (
        <Spinner smaller={smaller} />
      )}
      {message && <div className="message">{message}</div>}
    </StyledLoadingCurtain>
  );
}

export const StyledLoadingCurtain = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;

  > * {
    transition: opacity 0.2s ease-in-out;
  }

  &[data-waiting="true"] {
    > * {
      opacity: 0;
    }
  }

  > .message {
    font: ${fonts.display({ size: 15, line: "1.3" })};
    color: ${colors.text()};
    margin: 15px;
    margin-top: 30px;
    text-align: center;
  }
`;

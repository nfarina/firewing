import { styled } from "styled-components";
import { colors } from "../colors/colors";
import { fonts } from "../fonts/fonts";
import { ErrorLike, getErrorObj } from "../shared/errors";

/**
 * An error that should is meant to be shown to the user via ErrorView.
 * Supports the optional explicit `details` field.
 */
export class ErrorWithDetails extends Error {
  public isErrorWithDetails: true;

  constructor(
    userMessage: string,
    public details?: string,
  ) {
    super(userMessage);
    this.isErrorWithDetails = true;
  }
}

/**
 * Renders an Error in a scrollable <pre> with syntax formatting.
 */
export function ErrorView({ error }: { error: ErrorLike }) {
  const { name, message, details, stack } = getErrorObj(error);

  const stackLines: string[] = stack?.split("\n") ?? [];
  stackLines.shift(); // First line is just name/message.

  function renderLine(line: string) {
    // line is something like "at filterColumns (http://localhost:8904/static/bundle.cb63e.js:63612:48)"
    const match = line.match(/^(\s+)at (.*) \((.*):(\d+):(\d+)\)$/);

    if (match) {
      const [, indent, func, file, line, col] = match;
      return (
        <>
          <span>{indent}</span>
          <span className="details">at </span>
          <span className="function">{func}</span>
          <span className="details"> ({file}</span>
          <span className="details">
            :{line}:{col})
          </span>
        </>
      );
    }

    return <span>{line}</span>;
  }

  return (
    <StyledErrorView>
      <pre>
        {details && (
          <span className="details">
            {details}
            <br />
            <br />
          </span>
        )}
        <span key="error-name" className="name">
          {name || "Error"}
        </span>
        :{" "}
        <span key="error-message" className="message">
          {message}
        </span>
        <br />
        {stackLines.map((line, index) => (
          <div key={index} className="line">
            {renderLine(line)}
          </div>
        ))}
      </pre>
    </StyledErrorView>
  );
}

export const StyledErrorView = styled.div`
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
  background: ${colors.black({ alpha: 0.02 })};

  /* https://stackoverflow.com/a/25045641/66673 */
  width: 0;
  min-width: 100%;

  /* Mimic the color scheme of the "Light+" theme in VSCode. */
  > pre {
    font: ${fonts.displayMonoMedium({ size: 14 })};
    color: ${colors.text({ alpha: 0.8 })};
    margin: 0;

    > .name {
      color: #ff0000;
    }

    > .message {
      color: #008000;
    }

    > .line {
      > .function {
        color: #795e26;
      }

      > .details {
        color: ${colors.textSecondary()};
      }
    }
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.black({ alpha: 0.3 })};

    /* Mimic the color scheme of the "One Dark Pro" theme in VSCode. */
    > pre {
      > .name {
        color: #e06c75;
      }

      > .message {
        color: #98c379;
      }

      > .line {
        > .function {
          color: #d19a66;
        }
      }
    }
  }
`;

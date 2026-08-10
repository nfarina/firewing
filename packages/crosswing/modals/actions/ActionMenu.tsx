import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { Link } from "../../router/Link.js";

export type ActionButton = {
  title: ReactNode;
  subtitle?: ReactNode;
  destructive?: boolean;
  /** Renders in a bolder "selected" style. */
  selected?: boolean;
  onClick?: () => void;
  to?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  disabled?: boolean;
  /** If true, the button will not call onClose() automatically. */
  leaveOpen?: boolean;
  /** Rendered on top of the title/subtitle, covering it completely. Suitable for <FileInput>. */
  overlay?: ReactNode;
};

/**
 * Allows you to render arbitrary content in a panel that lives alongside
 * any other ActionButtons.
 */
export type ActionPanel = {
  content: ReactNode;
  /** Hide the background of the panel so you can render arbitrary content. */
  hideBackground?: boolean;
};

export const ActionSeparator = "ActionSeparator";

export type ActionItem = ActionButton | ActionPanel | typeof ActionSeparator;

export function ActionMenu({
  items,
  children,
  onClose,
}: {
  items: ActionItem[];
  children?: ReactNode;
  onClose: () => void;
}) {
  function onButtonClick({ onClick, leaveOpen }: ActionButton) {
    onClick?.();
    if (!leaveOpen) onClose();
  }

  const groups: Array<Array<ActionButton | ActionPanel>> = [[]];

  for (const item of items ?? []) {
    if (item === ActionSeparator) {
      groups.push([]);
    } else {
      groups[groups.length - 1].push(item);
    }
  }

  function renderItem(item: ActionButton | ActionPanel, index: number) {
    if ("content" in item) {
      return (
        <ActionPanelView key={index} data-hide-background={!!item.hideBackground}>
          {item.content}
        </ActionPanelView>
      );
    } else {
      return (
        <ActionButtonView
          key={String(index)}
          as={item.to ? Link : "button"}
          data-destructive={!!item.destructive}
          data-selected={!!item.selected}
          data-disabled={item.disabled}
          onClick={() => onButtonClick(item)}
          to={item.to}
          target={item.target}
        >
          {item.title && <div className="title">{item.title}</div>}
          {item.subtitle && <div className="subtitle">{item.subtitle}</div>}
          {item.overlay && <div className="overlay">{item.overlay}</div>}
        </ActionButtonView>
      );
    }
  }

  return (
    <StyledActionMenu>
      <div className="actions">
        {children && <div className="group">{children}</div>}
        {groups.map((group, i) => (
          <div key={String(i)} className="group">
            {group.map(renderItem)}
          </div>
        ))}
      </div>
      <ActionButtonView className="cancel" data-cancel onClick={onClose}>
        <div className="title">Cancel</div>
      </ActionButtonView>
    </StyledActionMenu>
  );
}

export const StyledActionMenu = styled.div`
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-flow: column;

  > .actions {
    display: flex;
    flex-flow: column;
    overflow: auto;

    > .group {
      flex-shrink: 0;
      display: flex;
      flex-flow: column;

      > * {
        flex-shrink: 0;
      }

      > *:first-child {
        border-top-left-radius: 13px;
        border-top-right-radius: 13px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      > * + * {
        margin-top: 1px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      > *:last-child {
        border-bottom-left-radius: 13px;
        border-bottom-right-radius: 13px;
      }
    }

    > .group + .group {
      margin-top: 10px;
    }
  }

  > .cancel {
    flex-shrink: 0;
    margin-top: 10px;
    border-radius: 13px;
  }
`;

export const ActionButtonView = styled(Link)`
  appearance: none;
  background: none;
  padding: 8px 10px;
  border: none;
  min-height: 57px;
  box-sizing: border-box;
  background: ${colors.textBackground({ alpha: 0.92 })};
  cursor: pointer;
  display: flex;
  flex-flow: column;
  justify-content: center;
  text-decoration: none;
  position: relative;

  &:active {
    background: rgba(200, 200, 200, 0.92);

    @media (prefers-color-scheme: dark) {
      background: rgba(78, 80, 80, 0.92);
    }
  }

  > .title {
    font: ${fonts.display({ size: 20 })};
    color: ${colors.text()};
    width: 100%;
    min-width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > .subtitle {
    font: ${fonts.display({ size: 14 })};
    color: ${colors.textSecondary()};
    width: 0;
    min-width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    > * {
      width: 100%;
      height: 100%;
    }
  }

  &[data-cancel="true"] {
    > .title {
      font: ${fonts.displayBold({ size: 18 })};
    }
  }

  &[data-destructive="true"] {
    > .title {
      color: ${colors.red()};
    }

    > .subtitle {
      color: ${colors.red({})};
    }
  }

  &[data-selected="true"] {
    > .title {
      font: ${fonts.displayBold({ size: 20 })};
    }

    > .subtitle {
      font: ${fonts.displayMedium({ size: 14 })};
    }
  }

  &[data-disabled="true"] {
    cursor: default;
    pointer-events: none;

    > .title {
      color: ${colors.text({ alpha: 0.5 })};
    }

    > .subtitle {
      color: ${colors.textSecondary({ alpha: 0.5 })};
    }
  }
`;

export const ActionPanelView = styled.div`
  display: flex;
  flex-flow: column;
  box-sizing: border-box;

  &[data-hide-background="false"] {
    background: ${colors.textBackground({ alpha: 0.92 })};
  }

  > * {
    flex-grow: 1;
  }
`;

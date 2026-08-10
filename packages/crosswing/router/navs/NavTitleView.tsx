import { ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

export function NavTitleView({
  title,
  subtitle,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <StyledNavTitleView className={className}>
      {title && <div className="title">{title}</div>}
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </StyledNavTitleView>
  );
}

export const StyledNavTitleView = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;

  > .title,
  > .subtitle {
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 0;
    min-width: 100%;
    color: ${colors.text()};
  }

  > .title {
    font: ${fonts.displayBold({ size: 18, line: "1.2" })};
  }

  > .subtitle {
    font: ${fonts.display({ size: 12, line: "1.2" })};
  }
`;

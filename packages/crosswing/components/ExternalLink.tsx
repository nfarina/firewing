import { HTMLAttributes, MouseEvent, ReactNode, use } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { HostContext } from "../host/context/HostContext.js";

export interface Props {
  href: string;
  children?: ReactNode;
}

/**
 * A special kind of component that renders a link that could potentially open
 * outside the "app" (when rendered in a native host). Default to rendering as
 * a <a> for desktop, but can be rendered as a <span> if you want to embed it
 * inside a parent <a> tag like <Link>.
 */
export function ExternalLink({
  as = "a",
  href,
  children,
  ...rest
}: { as?: "a" | "span"; href?: string } & HTMLAttributes<HTMLSpanElement>) {
  const { openUrl } = use(HostContext);

  function onClick(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (href) openUrl(href);
  }

  return (
    <StyledExternalLink
      as={as}
      {...(as === "a" ? { href } : null)}
      data-is-link // For <StatusBadge>
      onClick={onClick}
      children={children ?? href}
      {...rest}
    />
  );
}

export const StyledExternalLink = styled.span`
  color: ${colors.blue()};
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
    }
  }
`;

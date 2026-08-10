import { CSSProperties, Fragment, ReactNode, createContext, use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { RouterContext } from "../../router/context/RouterContext.js";
import { Link } from "../../router/Link.js";
import { NavAccessoryView } from "../../router/navs/NavAccessoryView.js";
import { NavTitleView } from "../../router/navs/NavTitleView.js";
import { truncate } from "../../shared/strings.js";
import { SiteHeaderAccessory } from "./SiteHeaderAccessory.js";

// This is pretty fancy for a breadcrumbs system.

export type SitePageTitleDesktopStyle = "compact" | "breadcrumbs";

export function SitePageTitle({
  siteTitle,
  accessories,
}: {
  siteTitle: string;
  accessories?: SiteHeaderAccessory[] | null;
}) {
  const { crumbs, desktopStyle } = use(PageTitleContext);

  const sorted = Array.from(crumbs.values()).sort((a, b) => a.link.length - b.link.length);

  // Get the last crumb for the document title.
  const [lastCrumb] = sorted.slice(-1);

  useEffect(() => {
    if (lastCrumb) document.title = lastCrumb.title + " | " + siteTitle;
    else document.title = siteTitle;
  });

  // For mobile.
  const subtitleCrumb = [...sorted].reverse().find((crumb) => crumb !== lastCrumb);
  const backCrumb = [...sorted]
    .reverse()
    .find((crumb) => crumb !== lastCrumb && !crumb.intermediate);

  return (
    <StyledPageTitle>
      {desktopStyle === "compact" && (
        <CompactPageTitle data-has-subtitle={!!subtitleCrumb}>
          {subtitleCrumb ? (
            <Link className="previous" to={subtitleCrumb.link}>
              {subtitleCrumb.title}
            </Link>
          ) : null}
          {lastCrumb ? (
            <Link className="current" to={lastCrumb.link}>
              {lastCrumb.title}
            </Link>
          ) : (
            <>&nbsp;</>
          )}
        </CompactPageTitle>
      )}
      {desktopStyle === "breadcrumbs" && (
        <BreadcrumbPageTitle>
          {sorted.map((crumb) => (
            <Fragment key={crumb.link}>
              <Link to={crumb.link}>
                {crumb === sorted[sorted.length - 1]
                  ? crumb.title
                  : truncate(crumb.title, { length: 20 })}
              </Link>
              <div className="separator" children="/" />
            </Fragment>
          ))}
        </BreadcrumbPageTitle>
      )}
      <MobilePageTitle style={{ "--num-accessories": accessories?.length ?? 0 } as CSSProperties}>
        {backCrumb ? (
          <NavAccessoryView accessory={{ icon: <ArrowLeft />, to: backCrumb.link }} align="left" />
        ) : (
          <div />
        )}
        {lastCrumb ? (
          <NavTitleView
            title={lastCrumb.title || <>&nbsp;</>}
            subtitle={subtitleCrumb ? subtitleCrumb.title || <>&nbsp;</> : null}
          />
        ) : (
          <div />
        )}
      </MobilePageTitle>
    </StyledPageTitle>
  );
}

export type PageTitleContextValue = {
  crumbs: Map<number, Breadcrumb>;
  setCrumb(id: number, crumb: Breadcrumb): void;
  removeCrumb(id: number): void;
  desktopStyle: SitePageTitleDesktopStyle;
};

export const PageTitleContext = createContext<PageTitleContextValue>({
  crumbs: new Map(),
  setCrumb: () => {
    // throw new Error("Expected a <PageTitleProvider> as an ancestor!");
  },
  removeCrumb: () => {
    // throw new Error("Expected a <PageTitleProvider> as an ancestor!");
  },
  desktopStyle: "compact",
});
PageTitleContext.displayName = "PageTitleContext";

interface Breadcrumb {
  title: string;
  link: string;
  intermediate?: boolean;
}

let nextId = 0;
function getNextId() {
  return nextId++;
}

export function usePageTitle(
  title: string,
  { intermediate = false }: { intermediate?: boolean } = {},
) {
  const [id] = useState(getNextId);
  const { setCrumb, removeCrumb } = use(PageTitleContext);
  const { location } = use(RouterContext);
  const link = location.claimedHref();

  useEffect(() => {
    if (title) setCrumb(id, { title, link, intermediate });
    return () => removeCrumb(id);
  }, [title]);
}

export function PageTitleProvider({
  children,
  desktopStyle = "compact",
}: {
  children: ReactNode;
  desktopStyle?: SitePageTitleDesktopStyle;
}) {
  const [crumbs, setCrumbs] = useState(new Map() as Map<number, Breadcrumb>);

  function setCrumb(id: number, crumb: Breadcrumb) {
    setCrumbs((oldCrumbs) => {
      const newCrumbs = new Map(oldCrumbs);
      newCrumbs.set(id, crumb);
      return newCrumbs;
    });
  }

  function removeCrumb(id: number) {
    setCrumbs((oldCrumbs) => {
      const newCrumbs = new Map(oldCrumbs);
      newCrumbs.delete(id);
      return newCrumbs;
    });
  }

  return (
    <PageTitleContext value={{ crumbs, setCrumb, removeCrumb, desktopStyle }} children={children} />
  );
}

/** For Storybook. */
export function PageTitleDecorator(Story: () => any) {
  return <PageTitleProvider children={<Story />} />;
}

export const BreadcrumbPageTitle = styled.div`
  display: flex;
  flex-flow: row;
  font: ${fonts.display({ size: 15 })};
  padding: 5px;
  overflow-x: auto;

  > * {
    flex-shrink: 0;
  }

  > a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: ${colors.text()};
    padding: 5px;
  }

  > .separator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.mediumGray()};
  }

  > .separator:last-of-type {
    display: none;
  }

  > a:last-of-type {
    font: ${fonts.displayBold({ size: 15 })};
  }
`;

export const CompactPageTitle = styled.div`
  display: flex;
  flex-flow: column;
  padding: 10px;
  justify-content: center;
  align-items: flex-start;

  > * {
    flex-shrink: 0;
    max-width: 100%;
  }

  > .previous {
    font: ${fonts.display({ size: 13 })};
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-decoration: none;
    color: ${colors.text()};
  }

  > .current {
    font: ${fonts.displayBlack({ size: 22 })};
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-decoration: none;
    color: ${colors.text()};
  }

  &[data-has-subtitle="false"] {
    > .previous {
      display: none;
    }

    > .current {
      font: ${fonts.displayBlack({ size: 28 })};
    }
  }
`;

/** Mimics <Nav>'s Header. */
const MobilePageTitle = styled.div`
  display: flex;
  flex-flow: row;

  > *:nth-child(1) {
    flex-shrink: 0;
    width: 80px;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
    flex-grow: 1;
    width: 0;
  }
`;

export const StyledPageTitle = styled.div`
  display: flex;
  flex-flow: row;

  > * {
    flex-shrink: 0;
    flex-grow: 1;
    width: 0;
  }

  > ${MobilePageTitle} {
    display: none;
  }

  /* If <ListLayout> has collapsed, we want to use a mobile breadcrumb
     system that mimics <Navs>. */
  @media (max-width: 950px) {
    > ${BreadcrumbPageTitle} {
      display: none;
    }

    > ${CompactPageTitle} {
      display: none;
    }

    > ${MobilePageTitle} {
      display: flex;
    }
  }
`;

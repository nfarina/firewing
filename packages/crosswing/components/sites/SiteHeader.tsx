import { styled } from "styled-components";
import { FullScreenToolbarSpace } from "../desktop/FullScreenView.js";
import {
  SiteHeaderAccessory,
  SiteHeaderAccessoryView,
  StyledSiteHeaderAccessoryView,
} from "./SiteHeaderAccessory.js";
import { SitePageTitle, StyledPageTitle } from "./SitePageTitle.js";

export function SiteHeader({
  siteTitle,
  accessories: allAccessories,
}: {
  /**
   * Used for the DOM document title, prepending with the current page if using
   * usePageTitle(). Example: "Crosswing Admin" or "Users | Crosswing Admin"
   */
  siteTitle: string;
  accessories?: SiteHeaderAccessory[] | null;
}) {
  // Filer out hidden accessories.
  const accessories = allAccessories?.filter((a) => !a.hidden) ?? null;

  return (
    <StyledSiteHeader data-num-accessories={accessories?.length ?? 0}>
      <SitePageTitle siteTitle={siteTitle} accessories={accessories} />
      {accessories?.map((accessory, i) => (
        <SiteHeaderAccessoryView
          key={String(`accessory-${i}`)}
          data-last-accessory={i === accessories.length - 1}
          accessory={accessory}
        />
      ))}
      <FullScreenToolbarSpace />
    </StyledSiteHeader>
  );
}

export const StyledSiteHeader = styled.div`
  display: flex;
  flex-flow: row;

  > * {
    flex-shrink: 0;
  }

  > ${StyledPageTitle} {
    width: 0;
    flex-grow: 1;
  }

  > ${StyledSiteHeaderAccessoryView} {
    padding: 5px;

    &[data-last-accessory="true"] {
      padding-right: 10px;
    }
  }

  /* Only one accessory? We can properly center the title on mobile layouts by balancing out the 80px left spacer. */
  &[data-num-accessories="1"] {
    > ${StyledSiteHeaderAccessoryView} {
      width: 80px;
      justify-content: flex-end;
    }
  }
`;

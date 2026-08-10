import { lazy } from "react";
import { NoContent } from "../../../NoContent.js";
import { usePageTitle } from "../../../sites/SitePageTitle.js";

const PopupButton = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(import("./PopupButton") as any);
    }, 1000);
  });
});

export default function ImportTab() {
  usePageTitle("Import"); // For <SuspenseSite> story.

  return <NoContent title="Suspense Import" subtitle={<PopupButton />} />;
}

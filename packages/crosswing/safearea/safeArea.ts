export interface SafeArea {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export const safeArea = {
  top: () => "var(--safe-area-top, 0px)",
  right: () => "var(--safe-area-right, 0px)",
  bottom: () => "var(--safe-area-bottom, 0px)",
  left: () => "var(--safe-area-left, 0px)",
};

export function getSafeAreaCSS(safeArea: SafeArea) {
  return `
    --safe-area-top: ${safeArea.top};
    --safe-area-bottom: ${safeArea.bottom};
    --safe-area-left: ${safeArea.left};
    --safe-area-right: ${safeArea.right};
  `;
}

export const BROWSER_SAFE_AREA: SafeArea = {
  top: "env(safe-area-inset-top, 0px)",
  right: "env(safe-area-inset-right, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
  left: "env(safe-area-inset-left, 0px)",
};

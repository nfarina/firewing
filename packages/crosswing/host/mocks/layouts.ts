import { HostLayout, HostRect } from "../util/types.js";

// Real layouts captured through LayoutObserver in Xcode 27.1's simulators. The
// iPhone Duo runs iOS 27.1; the iPhone and iPad run iOS 27.0, which predates
// the bar edge, bar regions, and reserved regions (27.1 is Duo-only for now), so
// those fields are absent just as they are on those devices today.

/** iPhone 18 Pro, portrait. */
export const iPhonePortraitLayout: HostLayout = {
  width: 402,
  height: 874,
  sizeClass: { horizontal: "compact", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 0, top: 62 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 18, right: 18, top: 62 },
    vertical: { bottom: 34, left: 0, right: 0, top: 62 },
  },
  window: { height: 874, width: 402, x: 0, y: 0 },
  screen: { height: 874, width: 402 },
  orientation: "portrait",
};

/** iPhone 18 Pro, landscape. */
export const iPhoneLandscapeLayout: HostLayout = {
  width: 874,
  height: 402,
  sizeClass: { horizontal: "compact", vertical: "compact" },
  safeArea: { bottom: 20, left: 62, right: 62, top: 0 },
  safeAreaCorners: {
    horizontal: { bottom: 20, left: 62, right: 62, top: 0 },
    vertical: { bottom: 20, left: 62, right: 62, top: 18 },
  },
  window: { height: 402, width: 874, x: 0, y: 0 },
  screen: { height: 402, width: 874 },
  orientation: "landscapeRight",
};

/** iPad Pro 11-inch (M5), portrait. */
export const iPadPortraitLayout: HostLayout = {
  width: 834,
  height: 1210,
  sizeClass: { horizontal: "regular", vertical: "regular" },
  safeArea: { bottom: 20, left: 0, right: 0, top: 32 },
  safeAreaCorners: {
    horizontal: { bottom: 20, left: 9.5, right: 9.5, top: 32 },
    vertical: { bottom: 20, left: 0, right: 0, top: 32 },
  },
  window: { height: 1210, width: 834, x: 0, y: 0 },
  screen: { height: 1210, width: 834 },
  orientation: "portrait",
};

/** iPad Pro 11-inch (M5), landscape. */
export const iPadLandscapeLayout: HostLayout = {
  width: 1210,
  height: 834,
  sizeClass: { horizontal: "regular", vertical: "regular" },
  safeArea: { bottom: 20, left: 0, right: 0, top: 32 },
  safeAreaCorners: {
    horizontal: { bottom: 20, left: 9, right: 9, top: 32 },
    vertical: { bottom: 20, left: 0, right: 0, top: 32 },
  },
  window: { height: 834, width: 1210, x: 0, y: 0 },
  screen: { height: 834, width: 1210 },
  orientation: "landscapeRight",
};

/** Closed, portrait on the outer display. */
export const duoClosedPortraitLayout: HostLayout = {
  width: 466,
  height: 678,
  sizeClass: { horizontal: "compact", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 84, top: 0 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 2.3, right: 84, top: 0 },
    vertical: { bottom: 34, left: 0, right: 84, top: 17.3 },
  },
  barEdge: "right",
  bars: {
    bottom: { height: 44, width: 379.7, x: 2.3, y: 608 },
    left: { height: 626.7, width: 44, x: 26, y: 17.3 },
    right: { height: 474, width: 44, x: 396, y: 170 },
    top: { height: 44, width: 379.7, x: 2.3, y: 26 },
  },
  occlusions: [
    {
      active: true,
      height: 37,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 37,
      x: 399.7,
      y: 29.3,
    },
    {
      active: true,
      height: 170,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 84,
      x: 382,
      y: 0,
    },
  ],
  divisions: [],
  window: { height: 678, width: 466, x: 0, y: 0 },
  screen: { height: 678, width: 466 },
  orientation: "portrait",
  hinge: { angle: 0, status: "closed" },
};

/** Closed, landscape on the outer display. */
export const duoClosedLandscapeLayout: HostLayout = {
  width: 678,
  height: 466,
  sizeClass: { horizontal: "compact", vertical: "compact" },
  safeArea: { bottom: 34, left: 0, right: 84, top: 0 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 17.3, right: 84, top: 0 },
    vertical: { bottom: 34, left: 0, right: 84, top: 2.3 },
  },
  barEdge: "right",
  bars: {
    bottom: { height: 44, width: 576.7, x: 17.3, y: 396 },
    left: { height: 429.7, width: 44, x: 26, y: 2.3 },
    right: { height: 381.7, width: 44, x: 608, y: 2.3 },
    top: { height: 44, width: 576.7, x: 17.3, y: 26 },
  },
  occlusions: [
    {
      active: true,
      height: 37,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 37,
      x: 611.7,
      y: 399.7,
    },
    {
      active: true,
      height: 82,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 84,
      x: 594,
      y: 384,
    },
  ],
  divisions: [],
  window: { height: 466, width: 678, x: 0, y: 0 },
  screen: { height: 466, width: 678 },
  orientation: "landscapeLeft",
  hinge: { angle: 0, status: "closed" },
};

/** Partially open (130°) like a book, with a vertical fold. */
export const duoBookLayout: HostLayout = {
  width: 951,
  height: 669,
  sizeClass: { horizontal: "regular", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 84, top: 0 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 16, right: 84, top: 0 },
    vertical: { bottom: 34, left: 0, right: 84, top: 16 },
  },
  barEdge: "right",
  bars: {
    bottom: { height: 44, width: 851, x: 16, y: 599 },
    left: { height: 619, width: 44, x: 26, y: 16 },
    right: { height: 515, width: 44, x: 881, y: 120 },
    top: { height: 44, width: 851, x: 16, y: 26 },
  },
  occlusions: [
    {
      active: false,
      height: 37,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 58,
      x: 677.3,
      y: 21,
    },
    {
      active: true,
      height: 120,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 84,
      x: 867,
      y: 0,
    },
  ],
  divisions: [
    {
      active: true,
      height: 669,
      margins: { bottom: 0, left: 20, right: 20, top: 0 },
      width: 40,
      x: 455.5,
      y: 0,
    },
  ],
  window: { height: 669, width: 951, x: 0, y: 0 },
  screen: { height: 669, width: 951 },
  orientation: "landscapeLeft",
  hinge: { angle: 130, status: "partiallyOpen" },
};

/**
 * The book pose in Split View, with us in the left half. The system's status
 * strip goes with the other app, so the safe area doesn't cover our bar strip,
 * and the fold only clips our right edge.
 */
export const duoBookSplitLeftLayout: HostLayout = {
  width: 469,
  height: 669,
  sizeClass: { horizontal: "compact", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 0, top: 0 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 16, right: 8.7, top: 0 },
    vertical: { bottom: 34, left: 0, right: 0, top: 16 },
  },
  barEdge: "left",
  bars: {
    bottom: { height: 44, width: 444.3, x: 16, y: 599 },
    left: { height: 619, width: 44, x: 26, y: 16 },
    right: { height: 619, width: 44, x: 399, y: 16 },
    top: { height: 44, width: 444.3, x: 16, y: 26 },
  },
  occlusions: [],
  divisions: [
    {
      active: true,
      height: 669,
      margins: { bottom: 0, left: 20, right: 20, top: 0 },
      width: 13.5,
      x: 455.5,
      y: 0,
    },
  ],
  window: { height: 669, width: 469, x: 0, y: 0 },
  screen: { height: 669, width: 951 },
  orientation: "landscapeLeft",
  hinge: { angle: 130, status: "partiallyOpen" },
};

/** Fully open (180°) in Split View, us on the left: the fold goes inactive. */
export const duoOpenSplitLeftLayout: HostLayout = {
  ...duoBookSplitLeftLayout,
  divisions: [{ ...duoBookSplitLeftLayout.divisions![0], active: false }],
  hinge: { angle: 180, status: "fullyOpen" },
};

/** Partially open (130°) like a laptop, with a horizontal fold. */
export const duoLaptopLayout: HostLayout = {
  width: 669,
  height: 951,
  sizeClass: { horizontal: "regular", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 0, top: 82 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 16, right: 16, top: 82 },
    vertical: { bottom: 34, left: 0, right: 0, top: 82 },
  },
  bars: {
    bottom: { height: 44, width: 637, x: 16, y: 881 },
    left: { height: 835, width: 44, x: 26, y: 82 },
    right: { height: 835, width: 44, x: 599, y: 82 },
    top: { height: 44, width: 519, x: 16, y: 26 },
  },
  occlusions: [
    {
      active: false,
      height: 58,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 37,
      x: 611,
      y: 677.3,
    },
    {
      active: true,
      height: 82,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 134,
      x: 535,
      y: 0,
    },
  ],
  divisions: [
    {
      active: true,
      height: 40,
      margins: { bottom: 20, left: 0, right: 0, top: 20 },
      width: 669,
      x: 0,
      y: 455.5,
    },
  ],
  window: { height: 951, width: 669, x: 0, y: 0 },
  screen: { height: 951, width: 669 },
  orientation: "portraitUpsideDown",
  hinge: { angle: 130, status: "partiallyOpen" },
};

/** Fully open (180°), landscape. The fold exists but is inactive. */
export const duoOpenLandscapeLayout: HostLayout = {
  width: 951,
  height: 669,
  sizeClass: { horizontal: "regular", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 84, top: 0 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 16, right: 84, top: 0 },
    vertical: { bottom: 34, left: 0, right: 84, top: 16 },
  },
  barEdge: "right",
  bars: {
    bottom: { height: 44, width: 851, x: 16, y: 599 },
    left: { height: 619, width: 44, x: 26, y: 16 },
    right: { height: 515, width: 44, x: 881, y: 120 },
    top: { height: 44, width: 851, x: 16, y: 26 },
  },
  occlusions: [
    {
      active: false,
      height: 37,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 58,
      x: 677.3,
      y: 21,
    },
    {
      active: true,
      height: 120,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 84,
      x: 867,
      y: 0,
    },
  ],
  divisions: [
    {
      active: false,
      height: 669,
      margins: { bottom: 0, left: 20, right: 20, top: 0 },
      width: 40,
      x: 455.5,
      y: 0,
    },
  ],
  window: { height: 669, width: 951, x: 0, y: 0 },
  screen: { height: 669, width: 951 },
  orientation: "landscapeLeft",
  hinge: { angle: 180, status: "fullyOpen" },
};

/** Fully open (180°), portrait, where bars go back to horizontal. */
export const duoOpenPortraitLayout: HostLayout = {
  width: 669,
  height: 951,
  sizeClass: { horizontal: "regular", vertical: "regular" },
  safeArea: { bottom: 34, left: 0, right: 0, top: 82 },
  safeAreaCorners: {
    horizontal: { bottom: 34, left: 16, right: 16, top: 82 },
    vertical: { bottom: 34, left: 0, right: 0, top: 82 },
  },
  bars: {
    bottom: { height: 44, width: 637, x: 16, y: 881 },
    left: { height: 835, width: 44, x: 26, y: 82 },
    right: { height: 835, width: 44, x: 599, y: 82 },
    top: { height: 44, width: 519, x: 16, y: 26 },
  },
  occlusions: [
    {
      active: false,
      height: 58,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 37,
      x: 611,
      y: 677.3,
    },
    {
      active: true,
      height: 82,
      margins: { bottom: 0, left: 0, right: 0, top: 0 },
      width: 134,
      x: 535,
      y: 0,
    },
  ],
  divisions: [
    {
      active: false,
      height: 40,
      margins: { bottom: 20, left: 0, right: 0, top: 20 },
      width: 669,
      x: 0,
      y: 455.5,
    },
  ],
  window: { height: 951, width: 669, x: 0, y: 0 },
  screen: { height: 951, width: 669 },
  orientation: "portraitUpsideDown",
  hinge: { angle: 180, status: "fullyOpen" },
};

/**
 * Where the iPhone 18 Pro's Dynamic Island sits. iOS 27.0 doesn't report it as
 * a reserved region (the Duo's cameras are, on 27.1), so it's measured from the
 * simulator instead, for drawing on mock devices.
 */
const iPhoneIslandPortrait: HostRect = { x: 138, y: 11, width: 126, height: 37 };
const iPhoneIslandLandscape: HostRect = { x: 11, y: 138, width: 37, height: 126 };

/** Every captured layout, grouped by device, for pickers like DeviceSimulator. */
export const hostLayoutPresets: {
  device: string;
  name: string;
  layout: HostLayout;
  /** Camera cutouts to draw, where the layout doesn't report them. */
  cutouts?: HostRect[];
}[] = [
  {
    device: "iPhone",
    name: "Portrait",
    layout: iPhonePortraitLayout,
    cutouts: [iPhoneIslandPortrait],
  },
  {
    device: "iPhone",
    name: "Landscape",
    layout: iPhoneLandscapeLayout,
    cutouts: [iPhoneIslandLandscape],
  },
  { device: "iPad", name: "Portrait", layout: iPadPortraitLayout },
  { device: "iPad", name: "Landscape", layout: iPadLandscapeLayout },
  { device: "iPhone Duo", name: "Closed", layout: duoClosedPortraitLayout },
  { device: "iPhone Duo", name: "Closed, landscape", layout: duoClosedLandscapeLayout },
  { device: "iPhone Duo", name: "Book", layout: duoBookLayout },
  { device: "iPhone Duo", name: "Book, Split View left", layout: duoBookSplitLeftLayout },
  { device: "iPhone Duo", name: "Laptop", layout: duoLaptopLayout },
  { device: "iPhone Duo", name: "Open", layout: duoOpenLandscapeLayout },
  { device: "iPhone Duo", name: "Open, Split View left", layout: duoOpenSplitLeftLayout },
  { device: "iPhone Duo", name: "Open, portrait", layout: duoOpenPortraitLayout },
];

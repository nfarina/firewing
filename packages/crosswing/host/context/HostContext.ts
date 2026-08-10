import { createContext } from "react";
import { detectContainer } from "../util/ipc.js";
import { openExternalLink } from "../util/openExternalLink.js";
import { DeepLink, HostContextValue } from "../util/types.js";

export const HostContext = createContext<HostContextValue>(defaultHostContext());
HostContext.displayName = "HostContext";

export function defaultHostContext(merge?: Partial<HostContextValue>): HostContextValue {
  const container = detectContainer();
  return {
    container,
    platform: "unknown",
    viewport: {},
    safeArea: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
    preferredFontSize: 17, // From iOS defaults.
    deepLink: new DeepLink(),
    supportsEmailSignIn: false,
    supportsLogin: false,
    supportsNotifications: false,
    supportsContacts: false,
    supportsClipboardRead: container === "web" || container === "webapp",
    requiresNotificationAuthorization: false,
    supportsLightStatusBar: false,
    supportsPlaid: false,
    getPlugin: () => null,
    openUrl: async (url) => openExternalLink(url),
    sendSignInLink: async () => {},
    login: async () => {},
    requestNotificationAuthorization: async () => {},
    requestLocationWhenInUseAuthorization: async () => {},
    requestTemporaryFullAccuracyLocationAuthorization: async () => {},
    requestLocationUpdate: async () => {},
    openSettings: async () => {},
    requestReview: async () => {},
    badgeAppIcon: async () => {},
    scrollToTop: () => {},
    copyToClipboard: (dataString: string) => {
      navigator.clipboard.writeText(dataString);
    },
    readFromClipboard: () => navigator.clipboard.readText(),
    showShareSheet: () => {},
    shareFile: async () => {},
    showMessageSheet: () => {},
    showEmailSheet: () => {},
    getContacts: async () => [],
    startSmsRetriever: async () => {},
    setWakeLock: async () => {},
    getBrightness: async () => 0,
    setBrightness: async () => {},
    setLightStatusBar: async () => {},
    openPlaid: async () => {},
    closePlaid: async () => {},
    delayUpdates: async () => {},
    unsafe_features: () => ({}),
    unsafe_send: async () => ({}),
    unsafe_post: () => {},
    ...merge,
  };
}

export const AndroidBackButtonClassName = "hardware-back";

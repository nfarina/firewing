import { SafeArea } from "../../safearea/safeArea";

export interface HostContextValue {
  container: HostContainer;
  platform: HostPlatform;
  /**
   * If hosted by a device, the device's unique ID (to match up with the
   * corresponding device record in Firestore).
   */
  deviceId?: string;
  safeArea: SafeArea;
  viewport: HostViewport;
  preferredFontSize: number;
  deepLink: DeepLink;
  clientUrl?: string;
  webBundle?: boolean;
  supportsEmailSignIn: boolean;
  supportsNotifications: boolean;
  supportsLogin: boolean;
  supportsShareSheet?: boolean;
  /** Whether the host can share/save a binary file (e.g. an export). */
  supportsFileShare?: boolean;
  supportsMessageSheet?: boolean;
  supportsEmailSheet?: boolean;
  supportsContacts?: boolean;
  /** Whether reading the OS clipboard is available (host feature, or any web context). */
  supportsClipboardRead?: boolean;
  supportsWakeLock?: boolean;
  supportsBrightness?: boolean;
  supportsLightStatusBar?: boolean;
  supportsPlaid?: boolean;
  /** Whether this host can present a native "rate this app" star dialog (iOS StoreKit). Only true on shells new enough to handle the requestReview message. */
  supportsReviewPrompt?: boolean;
  requiresNotificationAuthorization: boolean;
  smsAutoVerificationToken?: string;
  getPlugin(plugin: string): null | HostPlugin;
  /**
   * Opens the given url in a new tab/window (if on Desktop) or in the user's
   * default browser (if on mobile).
   */
  openUrl(url: string): void;
  sendSignInLink(email: string, url: string): Promise<void>;
  login(token: string): Promise<void>;
  requestNotificationAuthorization(): Promise<void>;
  requestLocationWhenInUseAuthorization(): Promise<void>;
  requestTemporaryFullAccuracyLocationAuthorization({
    purposeKey,
  }: {
    purposeKey: string;
  }): Promise<void>;
  requestLocationUpdate(): Promise<void>;
  openSettings(): Promise<void>;
  /** Best-effort: asks the OS to present its native "rate this app" star dialog (iOS StoreKit). No-op off native; the OS rate-limits and may show nothing. */
  requestReview(): Promise<void>;
  badgeAppIcon(badge: number): Promise<void>;
  /** Attempts to scroll to the top based on what looks scrolled, if on iOS. Otherwise does nothing. */
  scrollToTop(): void;
  /** Copies the given string to the OS clipboard. */
  copyToClipboard(text: string): void;
  /** Reads text from the OS clipboard, prompting for permission if required. */
  readFromClipboard(): Promise<string>;
  /** Displays the system share sheet for the given text, if supported. */
  showShareSheet(text: string): void;
  /**
   * Shares/saves a file via the native share sheet (e.g. iOS), letting the user
   * save to Files, AirDrop, etc. Only meaningful when `supportsFileShare`.
   */
  shareFile(args: { blob: Blob; fileName: string }): Promise<void>;
  /** Displays the system message compose sheet, if supported. */
  showMessageSheet(args: { to: string; body: string }): void;
  /** Displays the system email compose sheet, if supported. */
  showEmailSheet(args: { to: string; subject: string; body: string; isHTML: boolean }): void;
  /** Fetches all contacts from the user's address book, if supported. */
  getContacts(): Promise<HostContact[]>;
  /** Prevents the screen from turning off automatically on supported devices. */
  setWakeLock(on: boolean): Promise<void>;
  /**
   * Returns the current screen brightness. Usually 0-1, but on Android a value
   * of -1 indicates "automatic".
   */
  getBrightness(): Promise<number>;
  /**
   * Sets the screen brightness. iOS may ignore this if the user subsequently
   * manually adjusts the brightness.
   */
  setBrightness(level: number): Promise<void>;
  /** Sets the status bar to render with light content on supported devices. */
  setLightStatusBar(light: boolean): Promise<void>;
  /** Notify the host when the native SMS Retriever service should be started. */
  startSmsRetriever(): Promise<void>;
  /** Opens the native Plaid SDK. */
  openPlaid({ token, redirectUri }: { token: string; redirectUri?: string | null }): void;
  /** Closes the native Plaid SDK. */
  closePlaid(): void;
  /** Delays automatic updates (browser reloads) for the given amount of time. */
  delayUpdates(duration: number): void;
  /** Gets the raw features dictionary passed in by the host device. */
  unsafe_features(): HostFeatures;
  /** Sends an arbitrary command to the host. For experimenting only! */
  unsafe_send(name: string, args?: object): Promise<object>;
  /** Posts an arbitrary command to the host. For experimenting only! */
  unsafe_post(name: string, args?: object): void;
}

export type HostContainer = "ios" | "android" | "electron" | "web" | "webapp";

export type HostPlatform = "visionOS" | "unknown";

export interface HostFeatures {
  /** Platform specifier. */
  platform?: string;
  /** Unique identifier for this host. */
  identifier?: string;
  /** The URL that the host is loading this web application from. */
  clientUrl?: string;
  /**
   * Whether the client was downloaded from clientUrl using bundle.zip
   * and is currently running via a file:// url.
   */
  webBundle?: boolean;
  /** Whether this host supports native Firebase Auth email sign-in. */
  emailSignIn?: boolean;
  /** Whether this host supports passing in login via a token. */
  login?: boolean;
  /** Whether this host supports receiving push notifications. */
  notifications?: boolean;
  /**
   * Whether this host requires user authorization to receive notifications
   * (iOS).
   */
  notificationAuthorization?: boolean;
  /** Whether this host supports "safe areas" in CSS (i.e. The Notch). */
  safeArea?: boolean;
  /** Might be present if this host supports safe areas but not in CSS. */
  pendingSafeArea?: string;
  /** Might be present if this host support user-adjustable font sizes for apps. */
  preferredFontSize?: number;
  /**
   * Whether there is a deep link that the user clicked that the host
   * wasn't able to notify us about because we weren't loaded yet.
   */
  pendingDeepLink?: string;
  /** Whether this host supports copying text to the OS clipboard. */
  clipboard?: boolean;
  /** Whether this host supports reading text from the OS clipboard. */
  clipboardRead?: boolean;
  /** Whether this host supports showing a "share sheet" for text. */
  shareSheet?: boolean;
  /** Whether this host supports sharing/saving a binary file. */
  fileShare?: boolean;
  /** Whether this host supports displaying a form for composing a text message. */
  messageSheet?: boolean;
  /** Whether this host supports displaying a form for composing an email. */
  emailSheet?: boolean;
  /** Whether this host supports fetching device contacts from the address book. */
  contacts?: boolean;
  /** Whether this host supports keeping the screen on. */
  wakeLock?: boolean;
  /** Whether this host supports getting/setting screen brightness. */
  brightness?: boolean;
  /**
   * Might be present if this host supports SMS auto verification.
   *
   * If supported, this value will be a special token that must be included in
   * SMS 2FA messages.
   */
  smsAutoVerificationToken?: string;
  /** Whether this host supports integrating with the native Plaid SDK. */
  plaid?: boolean;
  /** Whether this host can present a native "rate this app" star dialog (iOS StoreKit). */
  reviewPrompt?: boolean;
  /** Any plugins exposed by the host. */
  plugins?: Record<string, HostPlugin>;
}

// DeepLink is a class and not just a string, because, imagine the user
// clicks a deep link that takes them to Page A. Then they navigate
// around, stopping on Page B, then go back to the source of the deep link and
// click it again. We want to take them back to Page A since they clicked it
// again, but if deepLink was a string, then it couldn't "change" from Page A
// to Page A (since the strings would still be strict equal).
//
// With the DeepLink class, we can make a new object (new pointer) containing
// the exact same string. The new object will cause child hooks using [deepLink]
// in their "dependencies" list to render a new effect that causes a navigation.
export class DeepLink {
  private url: string | undefined;

  constructor(url?: string | undefined) {
    this.url = url;
  }

  public peek(): string | undefined {
    return this.url;
  }

  public consume(): string | undefined {
    const { url } = this;
    this.url = undefined;
    return url;
  }
}

export interface HostPlugin {
  /** Sends an arbitrary command to the host intended for a particular plugin. */
  send(name: string, args?: object): Promise<object>;
  /** Posts an arbitrary command to the host intended for a particular plugin. */
  post(name: string, args?: object): void;
  /** Listens for a message from the plugin (as a hook). */
  useListener(name: string, listener: Function | null | undefined): void;
}

export interface HostViewport {
  height?: number;
  keyboardVisible?: boolean;
}

export interface HostContact {
  name?: string;
  phones?: [{ label?: string; value: string }];
  emails?: [{ label?: string; value: string }];
}

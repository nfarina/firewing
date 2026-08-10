import { use } from "react";
import { HostContext } from "../context/HostContext.js";

export function useHostStatusBar(): HostStatusBar | null {
  const { supportsLightStatusBar, setLightStatusBar } = use(HostContext);
  return supportsLightStatusBar ? { setLight: setLightStatusBar } : null;
}

export type HostStatusBar = {
  setLight(isLight: boolean): void;
};

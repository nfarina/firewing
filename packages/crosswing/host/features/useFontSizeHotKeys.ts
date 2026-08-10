import { useLayoutEffect } from "react";
import { useHotKey } from "../../hooks/useHotKey.js";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";

interface FontSizePreset {
  name: string;
  size: number;
}

// From iOS.
const presets: FontSizePreset[] = [
  { name: "Largest", size: 23 },
  { name: "Large", size: 21 },
  { name: "Larger", size: 19 },
  { name: "Default", size: 17 },
  { name: "Smaller", size: 16 },
  { name: "Small", size: 15 },
  { name: "Smallest", size: 14 },
];

const DEFAULT_PRESET_INDEX = 3;

/**
 * Allow you to tweak the font size globally for testing responsive
 * type in mobile apps.
 */
export function useFontSizeHotKeys({
  disabled,
}: {
  /** If true, this hook does nothing. (Maybe you had to call it anyway because of Rules of Hooks) */
  disabled?: boolean;
} = {}) {
  const [presetIndex, setPresetIndex] = useLocalStorage<number>(
    "useFontSizeHotKeys:presetIndex",
    DEFAULT_PRESET_INDEX,
  );

  useHotKey("]", { global: true, disabled }, () => setPresetIndex(Math.max(0, presetIndex - 1)));

  useHotKey("[", { global: true, disabled }, () =>
    setPresetIndex(Math.min(presets.length - 1, presetIndex + 1)),
  );

  useHotKey("=", { global: true, disabled }, () => setPresetIndex(DEFAULT_PRESET_INDEX));

  // Respond to changes in preferred font size.
  useLayoutEffect(() => {
    if (disabled) return;

    const preset = presets[presetIndex];
    // Match behavior in AppContainer.
    const multiplier = preset.size / 17;

    document.body.style.setProperty("--font-scale", String(multiplier));
  }, [presetIndex, disabled]);
}

import { ChangeEvent, HTMLAttributes, useRef, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { useElementSize } from "../../hooks/useElementSize.js";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";
import { HostLayoutDebug } from "../debug/HostLayoutDebug.js";
import { MockDevice } from "./MockDevice.js";
import { hostLayoutPresets } from "./layouts.js";

/**
 * Renders children on a mock device, with a toolbar for picking which captured
 * layout (iPhone, iPad, iPhone Duo poses) the host reports. Changing layouts
 * updates the mock host in place rather than remounting the children, like a
 * real rotation or fold would. The picked layout is remembered, so you can run
 * many components (or stories) through it.
 *
 * For Storybook, or around a live app with `live`, which keeps the real host
 * and only swaps in the device's layout and safe area. (Media queries still
 * see the browser window, not the device.)
 */
export function DeviceSimulator({
  live,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { live?: boolean }) {
  const [presetKey, setPresetKey] = useLocalStorage("DeviceSimulator:layout", keyOf(presets[0]));
  const [showLayout, setShowLayout] = useLocalStorage("DeviceSimulator:showLayout", false);

  const index = Math.max(
    0,
    presets.findIndex((p) => keyOf(p) === presetKey),
  );
  const preset = presets[index];
  const { layout } = preset;

  // Scale big layouts (iPad) down to fit the canvas.
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  useElementSize(stageRef, setStage);

  // The whole screen, which is more than our window in Split View.
  const screen = layout.screen ?? layout;
  const padding = 24;
  const scale = stage.width
    ? Math.min(
        1,
        (stage.width - padding * 2) / screen.width,
        (stage.height - padding * 2) / screen.height,
      )
    : 1;

  function step(delta: number) {
    const next = (index + delta + presets.length) % presets.length;
    setPresetKey(keyOf(presets[next]));
  }

  return (
    <StyledDeviceSimulator {...rest}>
      <div className="toolbar">
        <button onClick={() => step(-1)} title="Previous layout">
          ‹
        </button>
        <select
          value={keyOf(preset)}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setPresetKey(e.target.value)}
        >
          {devices.map((device) => (
            <optgroup key={device} label={device}>
              {presets
                .filter((p) => p.device === device)
                .map((p) => (
                  <option key={keyOf(p)} value={keyOf(p)}>
                    {/* The device too, since a closed picker hides the group label. */}
                    {keyOf(p)}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button onClick={() => step(1)} title="Next layout">
          ›
        </button>
        <label>
          <input
            type="checkbox"
            checked={showLayout}
            onChange={(e) => setShowLayout(e.target.checked)}
          />
          Show layout
        </label>
        <div className="info">
          {layout.width}×{layout.height} · {layout.sizeClass.horizontal} ×{" "}
          {layout.sizeClass.vertical}
        </div>
      </div>
      <div className="stage" ref={stageRef}>
        <div className="zoom" style={{ zoom: scale }}>
          <MockDevice layout={layout} live={live} cutouts={preset.cutouts}>
            {children}
            {showLayout && <HostLayoutDebug overlay readout={false} />}
          </MockDevice>
        </div>
      </div>
    </StyledDeviceSimulator>
  );
}

const presets = hostLayoutPresets;
const devices = [...new Set(presets.map((p) => p.device))];

function keyOf({ device, name }: { device: string; name: string }) {
  return `${device}: ${name}`;
}

export const StyledDeviceSimulator = styled.div`
  display: flex;
  flex-flow: column;
  height: 100vh;
  box-sizing: border-box;

  > .toolbar {
    flex-shrink: 0;
    display: flex;
    flex-flow: row;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: ${colors.textBackgroundPanel()};
    border-bottom: 1px solid ${colors.separator()};
    font: ${fonts.display({ size: 13 })};
    color: ${colors.text()};

    > select,
    > button {
      font: inherit;
    }

    > label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
    }

    > .info {
      margin-left: auto;
      font: ${fonts.displayMono({ size: 12 })};
      color: ${colors.textSecondary()};
    }
  }

  > .stage {
    height: 0;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: ${colors.textBackgroundAlt()};
  }
`;

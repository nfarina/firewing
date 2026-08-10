import { CSSProperties, useState } from "react";
import { useResettableState } from "./useResettableState.js";

export default {
  component: useResettableState,
  parameters: { layout: "centered" },
};

export const Default = () => {
  const [color, setColor] = useState("blue");

  return (
    <div>
      <div style={ColorPickerStyle} onClick={() => setColor(color === "blue" ? "purple" : "blue")}>
        Click to change color and reset click count
      </div>
      <ClickableColor color={color} />
    </div>
  );
};

function ClickableColor({ color }: { color: string }) {
  const [clicks, setClicks] = useResettableState(() => 0, [color]);

  return (
    <div
      style={{ ...ClickableColorStyle, background: color }}
      onClick={() => setClicks((c) => c + 1)}
    >
      Clicked {color} {clicks} times.
    </div>
  );
}

const SharedStyle: CSSProperties = {
  fontFamily: "sans-serif",
  padding: "10px",
  textAlign: "center",
  cursor: "pointer",
  userSelect: "none",
  WebkitUserSelect: "none",
};

const ColorPickerStyle: CSSProperties = {
  ...SharedStyle,
  background: "gray",
};

const ClickableColorStyle: CSSProperties = {
  ...SharedStyle,
  color: "white",
};

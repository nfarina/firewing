import { HTMLAttributes, ReactNode, use, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { HostContext } from "../context/HostContext.js";
import { detectContainer } from "../util/ipc.js";
import { HostInsets, HostLayout, HostRect } from "../util/types.js";

/**
 * Visualizes the layout signals from the host in HostContext: safe areas,
 * where bars would go, the fold, cameras, and panes. Fills its nearest
 * positioned ancestor (or the viewport, if none), since host coordinates are
 * relative to the web view.
 *
 * Works against a real host or a MockHostProvider with a mock `layout`. Use
 * `overlay` to draw over other content instead of on a blank background.
 *
 * Every box is positioned from the host's numbers, except the blue safe area,
 * which comes straight from CSS `env(safe-area-inset-*)`. If the two safe
 * areas don't line up, the bridge and WebKit disagree. That comparison only
 * means something in a real host, so it's skipped when the host is mocked.
 */
export function HostLayoutDebug({
  overlay,
  readout = true,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /** Transparent background, for drawing over real UI. */
  overlay?: boolean;
  /** Show the card with the numbers and legend. */
  readout?: boolean;
}) {
  const { layout, container } = use(HostContext);

  // A mocked host (Storybook, say) has no real safe area for env() to report.
  const showEnv = container === detectContainer();

  // What the web side measures on its own, for comparison with the host.
  const envRef = useRef<HTMLDivElement>(null);
  const [web, setWeb] = useState<{ width: number; height: number; safeArea: HostInsets }>();

  useEffect(() => {
    function measure() {
      if (!envRef.current) return;
      const rect = envRef.current.getBoundingClientRect();
      setWeb({
        width: innerWidth,
        height: innerHeight,
        safeArea: {
          top: rect.top,
          right: innerWidth - rect.right,
          bottom: innerHeight - rect.bottom,
          left: rect.left,
        },
      });
    }

    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [layout, showEnv]);

  const size = layout ?? web ?? { width: innerWidth, height: innerHeight };
  const safeArea = layout?.safeArea ?? web?.safeArea ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const safeRect = inset({ x: 0, y: 0, width: size.width, height: size.height }, safeArea);

  // Both corner adaptations combined: the area that clears the rounded corners
  // on every side.
  const corners = layout?.safeAreaCorners;
  const cornersRect =
    corners &&
    inset(
      { x: 0, y: 0, width: size.width, height: size.height },
      {
        top: Math.max(corners.horizontal.top, corners.vertical.top),
        right: Math.max(corners.horizontal.right, corners.vertical.right),
        bottom: Math.max(corners.horizontal.bottom, corners.vertical.bottom),
        left: Math.max(corners.horizontal.left, corners.vertical.left),
      },
    );

  const division = layout?.divisions?.find((d) => d.active);
  const panes = division ? splitPanes(size, division) : [];

  // Keep the readout clear of the fold by putting it in the larger pane.
  const largestPane = [...panes].sort((a, b) => area(b) - area(a))[0];
  const cardRect = (largestPane && intersect(largestPane, safeRect)) ?? safeRect;

  const barEdges = layout?.barEdge ? [layout.barEdge] : (["top", "bottom"] as const);

  return (
    <StyledHostLayoutDebug data-overlay={!!overlay} {...rest}>
      {showEnv && <StyledEnvSafeArea ref={envRef} />}

      <Box kind="safe" rect={safeRect} label="Safe area" />

      {cornersRect && <Box kind="corners" rect={cornersRect} label="+ corners" />}

      {panes.map((pane, i) => (
        <Box key={i} kind="pane" rect={pane} label={`Pane ${i + 1}`} />
      ))}

      {layout?.bars &&
        (["top", "left", "bottom", "right"] as const).map((edge) => (
          <Box
            key={edge}
            kind="bar"
            rect={layout.bars![edge]}
            highlighted={(barEdges as readonly string[]).includes(edge)}
            label={(barEdges as readonly string[]).includes(edge) ? "Bar" : undefined}
          />
        ))}

      {layout?.occlusions?.map((region, i) => (
        <Box key={i} kind="occlusion" rect={region} active={region.active} />
      ))}

      {layout?.divisions?.map((region, i) => (
        <Box
          key={i}
          kind="division"
          rect={region}
          active={region.active}
          label={region.active ? "Fold" : "Fold (inactive)"}
        />
      ))}

      {readout && (
        <StyledCard style={rectStyle(cardRect)}>
          <div className="card">
            {layout ? (
              <Readout layout={layout} web={showEnv ? web : undefined} />
            ) : (
              <p className="empty">
                The host isn't reporting layout (container: {container}). Showing what the web view
                measures on its own.
              </p>
            )}
            <Legend env={showEnv} />
          </div>
        </StyledCard>
      )}
    </StyledHostLayoutDebug>
  );
}

function Readout({
  layout,
  web,
}: {
  layout: HostLayout;
  web?: { width: number; height: number; safeArea: HostInsets };
}) {
  const webSize = web && `${round(web.width)}×${round(web.height)}`;
  const hostSize = `${round(layout.width)}×${round(layout.height)}`;

  return (
    <dl>
      <Row label="Size">
        {hostSize}
        {webSize && webSize !== hostSize && <span className="mismatch"> web {webSize}</span>}
      </Row>
      <Row label="Size class">
        {layout.sizeClass.horizontal} × {layout.sizeClass.vertical}
      </Row>
      <Row label="Bar edge">{layout.barEdge ?? "none (horizontal bars)"}</Row>
      <Row label="Safe area">
        {insets(layout.safeArea)}
        {web && insets(web.safeArea) !== insets(layout.safeArea) && (
          <span className="mismatch"> env {insets(web.safeArea)}</span>
        )}
      </Row>
      {layout.safeAreaCorners && (
        <>
          <Row label="+ corners (h)">{insets(layout.safeAreaCorners.horizontal)}</Row>
          <Row label="+ corners (v)">{insets(layout.safeAreaCorners.vertical)}</Row>
        </>
      )}
      <Row label="Window">{describeWindow(layout)}</Row>
      <Row label="Fold">{describeRegions(layout.divisions)}</Row>
      <Row label="Cameras">{describeRegions(layout.occlusions)}</Row>
      {layout.hinge && (
        <Row label="Hinge">
          {layout.hinge.status} {layout.hinge.angle}°
        </Row>
      )}
      {layout.orientation && <Row label="Orientation">{layout.orientation}</Row>}
    </dl>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function Legend({ env }: { env: boolean }) {
  return (
    <ul className="legend">
      <li data-kind="safe">Safe area (host)</li>
      {env && <li data-kind="env">Safe area (env)</li>}
      <li data-kind="corners">Safe area + corners</li>
      <li data-kind="bar">Bar</li>
      <li data-kind="occlusion">Camera</li>
      <li data-kind="division">Fold</li>
      <li data-kind="pane">Pane</li>
    </ul>
  );
}

function Box({
  kind,
  rect,
  label,
  active = true,
  highlighted,
}: {
  kind: "safe" | "corners" | "bar" | "occlusion" | "division" | "pane";
  rect: HostRect;
  label?: string;
  active?: boolean;
  highlighted?: boolean;
}) {
  return (
    <StyledBox
      data-kind={kind}
      data-active={active}
      data-highlighted={!!highlighted}
      style={rectStyle(rect)}
    >
      {label && <span>{label}</span>}
    </StyledBox>
  );
}

// Geometry.

/** Splits the screen into the panes on either side of a division. */
function splitPanes(size: { width: number; height: number }, division: HostRect): HostRect[] {
  // A division taller than it is wide is a vertical fold, splitting left/right.
  if (division.height >= division.width) {
    return [
      { x: 0, y: 0, width: division.x, height: size.height },
      {
        x: division.x + division.width,
        y: 0,
        width: size.width - division.x - division.width,
        height: size.height,
      },
    ];
  } else {
    return [
      { x: 0, y: 0, width: size.width, height: division.y },
      {
        x: 0,
        y: division.y + division.height,
        width: size.width,
        height: size.height - division.y - division.height,
      },
    ];
  }
}

function inset(rect: HostRect, insets: HostInsets): HostRect {
  return {
    x: rect.x + insets.left,
    y: rect.y + insets.top,
    width: rect.width - insets.left - insets.right,
    height: rect.height - insets.top - insets.bottom,
  };
}

function intersect(a: HostRect, b: HostRect): HostRect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
}

function area(rect: HostRect) {
  return rect.width * rect.height;
}

function rectStyle(rect: HostRect) {
  return { left: rect.x, top: rect.y, width: rect.width, height: rect.height };
}

// Formatting.

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function insets({ top, right, bottom, left }: HostInsets) {
  return `t${round(top)} r${round(right)} b${round(bottom)} l${round(left)}`;
}

function describeWindow({ window, screen }: HostLayout) {
  if (!window || !screen) return "unknown";

  const frame = `${round(window.width)}×${round(window.height)} of ${round(screen.width)}×${round(screen.height)}`;

  if (window.width >= screen.width - 1 && window.height >= screen.height - 1) {
    return `full screen, ${frame}`;
  }

  const side =
    window.x < 1 ? "left" : window.x + window.width > screen.width - 1 ? "right" : "middle";
  return `${side} of Split View, ${frame}`;
}

function describeRegions(regions: HostLayout["divisions"]) {
  if (!regions?.length) return "none";
  return regions
    .map((r) => `${r.active ? "active" : "inactive"} ${round(r.width)}×${round(r.height)}`)
    .join(", ");
}

// Styles.

const StyledEnvSafeArea = styled.div`
  position: absolute;
  top: env(safe-area-inset-top, 0px);
  right: env(safe-area-inset-right, 0px);
  bottom: env(safe-area-inset-bottom, 0px);
  left: env(safe-area-inset-left, 0px);
  outline: 1px solid ${colors.blue()};
  outline-offset: -1px;
  pointer-events: none;
`;

const StyledBox = styled.div`
  position: absolute;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  pointer-events: none;

  > span {
    font: ${fonts.displayMono({ size: 10 })};
    padding: 2px 4px;
    color: ${colors.white()};
    border-radius: 3px;
    margin: 2px;
  }

  &[data-kind="safe"] {
    border: 2px dashed ${colors.green()};

    > span {
      background: ${colors.green()};
    }
  }

  &[data-kind="corners"] {
    border: 1px dotted ${colors.green()};
    align-items: flex-end;
    justify-content: flex-end;

    > span {
      background: ${colors.green({ alpha: 0.7 })};
    }
  }

  &[data-kind="pane"] {
    background: ${colors.turquoise({ alpha: 0.08 })};
    border: 1px solid ${colors.turquoise({ alpha: 0.5 })};

    > span {
      background: ${colors.turquoise()};
    }
  }

  &[data-kind="bar"] {
    border: 1px dashed ${colors.orange({ alpha: 0.35 })};
    border-radius: 22px;

    &[data-highlighted="true"] {
      background: ${colors.orange({ alpha: 0.25 })};
      border: 2px solid ${colors.orange()};
    }

    > span {
      background: ${colors.orange()};
      margin: auto;
    }
  }

  &[data-kind="occlusion"] {
    background: ${colors.red({ alpha: 0.35 })};
    border: 1px solid ${colors.red()};
  }

  &[data-kind="division"] {
    background: ${colors.purple({ alpha: 0.35 })};
    border: 1px solid ${colors.purple()};
    align-items: center;
    justify-content: center;

    > span {
      background: ${colors.purple()};
      writing-mode: vertical-rl;
    }
  }

  &[data-active="false"] {
    background: none;
    border-style: dashed;
    opacity: 0.6;
  }
`;

const StyledCard = styled.div`
  position: absolute;
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;

  > .card {
    background: ${colors.textBackgroundPanel({ alpha: 0.92 })};
    box-shadow: 0 2px 12px ${colors.black({ alpha: 0.15 })};
    border-radius: 12px;
    padding: 12px 14px;
    max-width: 100%;
    box-sizing: border-box;
    font: ${fonts.displayMono({ size: 12, line: "18px" })};
    color: ${colors.text()};

    > dl {
      margin: 0;
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 12px;

      > dt {
        color: ${colors.textSecondary()};
      }

      > dd {
        margin: 0;

        > .mismatch {
          color: ${colors.red()};
        }
      }
    }

    > .empty {
      margin: 0;
      max-width: 280px;
    }

    > .legend {
      list-style: none;
      margin: 10px 0 0;
      padding: 10px 0 0;
      border-top: 1px solid ${colors.separator()};
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      color: ${colors.textSecondary()};
      font: ${fonts.displayMono({ size: 10 })};

      > li::before {
        content: "";
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-right: 4px;
        vertical-align: -1px;
        box-sizing: border-box;
      }

      > li[data-kind="safe"]::before {
        border: 2px dashed ${colors.green()};
      }

      > li[data-kind="corners"]::before {
        border: 1px dotted ${colors.green()};
      }

      > li[data-kind="env"]::before {
        border: 1px solid ${colors.blue()};
      }

      > li[data-kind="bar"]::before {
        background: ${colors.orange({ alpha: 0.25 })};
        border: 2px solid ${colors.orange()};
        border-radius: 5px;
      }

      > li[data-kind="occlusion"]::before {
        background: ${colors.red({ alpha: 0.35 })};
        border: 1px solid ${colors.red()};
      }

      > li[data-kind="division"]::before {
        background: ${colors.purple({ alpha: 0.35 })};
        border: 1px solid ${colors.purple()};
      }

      > li[data-kind="pane"]::before {
        background: ${colors.turquoise({ alpha: 0.08 })};
        border: 1px solid ${colors.turquoise({ alpha: 0.5 })};
      }
    }
  }
`;

export const StyledHostLayoutDebug = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;

  &[data-overlay="false"] {
    background: ${colors.textBackground()};
  }

  &[data-overlay="true"] {
    pointer-events: none;

    > * {
      pointer-events: none;
    }
  }
`;

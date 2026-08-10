import { Meta } from "@storybook/react";
import { CSSProperties, ReactNode } from "react";
import { styled } from "styled-components";
import { fonts } from "../fonts/fonts.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { ColorView } from "./ColorView.js";
import { colors } from "./colors.js";

export default {
  component: colors as any, // Just for the auto-title.
  parameters: { layout: "centered" },
  decorators: [CrosswingAppDecorator({ layout: "centered" })],
} satisfies Meta;

export const Palette = () => {
  const views: ReactNode[] = [];

  for (const [name, builder] of Object.entries(colors)) {
    views.push(<ColorView key={name} name={name} color={builder} />);
  }

  return <PaletteView>{views}</PaletteView>;
};

const PaletteView = styled.div`
  display: grid;
  grid-gap: 20px;
  padding: 10px;
  grid-template-columns: repeat(5, minmax(60px, 1fr));
`;

export const Transform = () => {
  function renderBadges() {
    const badges: ReactNode[] = [];

    for (let i = 0; i < 10; i++) {
      badges.push(
        <div
          key={String(i)}
          className="badge"
          style={
            {
              "--background-color": colors.mediumBlue({
                hue: i * 35,
              }),
              "--color": colors.mediumBlue({
                hue: i * 35,
                darken: 0.5,
                saturate: 2,
              }),
            } as CSSProperties
          }
        >
          You have no unread messages.
        </div>,
      );
    }

    return badges;
  }

  return <Badges>{renderBadges()}</Badges>;
};

const Badges = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 10px;

  > .badge {
    flex-grow: 0;
    padding: 10px;
    border-radius: 6px;
    background: var(--background-color);
    color: var(--color);
    font: ${fonts.displayMedium({ size: 14 })};
  }

  > .badge + .badge {
    margin-top: 10px;
  }
`;

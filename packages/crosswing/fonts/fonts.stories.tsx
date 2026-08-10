import { Meta } from "@storybook/react";
import { CrosswingApp } from "crosswing/app";
import { ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import DMMonoMedium from "./dm-mono/DMMono-Medium.woff2";
import DMMono from "./dm-mono/DMMono-Regular.woff2";
import DMSansItalic from "./dm-sans/DMSans-Italic-VariableFont_opsz,wght.woff2";
import DMSans from "./dm-sans/DMSans-VariableFont_opsz,wght.woff2";
import { FontBuilder, fonts, GlobalFontFace } from "./fonts.js";

export default {
  component: fonts as any, // Just for the auto-title.
  parameters: { layout: "centered" },
} satisfies Meta;

export const DefaultFonts = () => {
  return (
    <CrosswingApp>
      <FontBook />
    </CrosswingApp>
  );
};

const dmSans: GlobalFontFace = {
  url: DMSans,
  variable: true,
  family: "DM Sans",
  weight: "100 1000",
  style: "normal",
  fallback: "sans-serif",
};

const dmSansItalic: GlobalFontFace = {
  url: DMSansItalic,
  variable: true,
  family: "DM Sans Italic",
  weight: "100 1000",
  style: "italic",
  fallback: "sans-serif",
};

const dmMono: GlobalFontFace = {
  url: DMMono,
  family: "DM Mono",
  weight: "400",
  style: "normal",
  fallback: "monospace",
};

const dmMonoMedium: GlobalFontFace = {
  url: DMMonoMedium,
  family: "DM Mono",
  weight: "500",
  style: "normal",
  fallback: "monospace",
};

const overriddenFonts = {
  ...fonts,
  display: fonts.display.override({ face: dmSans, weight: "400" }),
  displayItalic: fonts.displayItalic.override({
    face: dmSansItalic,
    weight: "400",
  }),
  displayMedium: fonts.displayMedium.override({ face: dmSans, weight: "500" }),
  displayBold: fonts.displayBold.override({ face: dmSans, weight: "600" }),
  displayBlack: fonts.displayBlack.override({ face: dmSans, weight: "700" }),
  numeric: fonts.numeric.override({ face: dmSans, weight: "400" }),
  numericBold: fonts.numericBold.override({ face: dmSans, weight: "600" }),
  numericBlack: fonts.numericBlack.override({ face: dmSans, weight: "700" }),
  displayMono: fonts.displayMono.override({ face: dmMono, weight: "400" }),
  displayMonoMedium: fonts.displayMonoMedium.override({
    face: dmMonoMedium,
    weight: "500",
  }),
};

export const OverridingFonts = () => {
  return (
    <CrosswingApp
      faces={[dmSans, dmSansItalic, dmMono, dmMonoMedium]}
      fonts={Object.values(overriddenFonts)}
    >
      <FontBook />
    </CrosswingApp>
  );
};

function FontBook() {
  const views: ReactNode[] = [];

  for (const [name, builder] of Object.entries(fonts)) {
    views.push(<SpecimenView key={name} name={name} builder={builder} />);
  }

  return <StyledFontBook>{views}</StyledFontBook>;
}

function SpecimenView({ name, builder }: { name: string; builder: FontBuilder }) {
  return (
    <StyledSpecimenView $builder={builder}>
      <div className="name">{name}</div>
      <div className="specimen">The answer is 42. But what is the question?</div>
    </StyledSpecimenView>
  );
}

const StyledSpecimenView = styled.div<{ $builder: FontBuilder }>`
  color: ${colors.text()};

  > .name {
    font-family: Helvetica;
    font-size: 12px;
    margin-bottom: 4px;
    color: ${colors.textSecondary()};
  }

  > .specimen {
    font: ${(p) => p.$builder({ size: 24, line: "32px" })};
  }
`;

const StyledFontBook = styled.div`
  display: flex;
  flex-flow: column;
  padding: 10px;

  > * + * {
    margin-top: 10px;
  }
`;

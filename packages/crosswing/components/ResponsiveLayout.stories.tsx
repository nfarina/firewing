import { Meta } from "@storybook/react";
import { useState } from "react";
import { styled } from "styled-components";
import { CrosswingAppDecorator } from "../storybook.js";
import { ResponsiveChild, ResponsiveLayout, StyledResponsiveLayout } from "./ResponsiveLayout.js";

export default {
  component: ResponsiveLayout,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ResponsiveLayout>;

export const Default = () => {
  const [large, setLarge] = useState(false);

  return (
    <Container data-large={large}>
      <ResponsiveLayout>
        <ResponsiveChild render={() => <div>Mobile Layout</div>} />
        <ResponsiveChild minWidth={150} render={() => <div>Tablet Layout</div>} />
      </ResponsiveLayout>
      <button children="Resize" onClick={() => setLarge((l) => !l)} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  margin: 10px;

  /* Adjust the rendered size of the ResponsiveLayout when you click the button. */

  > ${StyledResponsiveLayout} {
    width: 100px;
    height: 175px;
    transition:
      width 0.5s,
      height 0.5s;
  }

  &[data-large="true"] {
    > ${StyledResponsiveLayout} {
      width: 300px;
      height: 200px;
    }
  }

  /* Give the box some default style. */

  > ${StyledResponsiveLayout} > div {
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-family: sans-serif;
    font-size: 12px;
    background: coral;
  }

  /* Change the background when larger. */

  &[data-large="true"] > ${StyledResponsiveLayout} > div {
    background: lightgreen;
  }

  > button {
    margin-top: 10px;
  }
`;

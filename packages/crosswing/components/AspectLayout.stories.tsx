import { Meta } from "@storybook/react";
import { useState } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { AspectLayout, StyledAspectLayout } from "./AspectLayout.js";

export default {
  component: AspectLayout,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AspectLayout>;

export const Default = () => {
  const [large, setLarge] = useState(false);

  return (
    <Container data-large={large}>
      <AspectLayout aspect={1.586}>
        <div className="card" />
      </AspectLayout>
      <button
        children={<>Resize to {large ? "100x100" : "200x200"}</>}
        onClick={() => setLarge((l) => !l)}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  margin: 10px;

  > ${StyledAspectLayout} {
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    border: 1px dashed lightgray;

    > .card {
      background: ${colors.purple()};
      border-radius: 16px;
    }
  }

  &[data-large="true"] {
    > ${StyledAspectLayout} {
      width: 200px;
      height: 200px;
    }
  }

  > button {
    margin-top: 10px;
  }
`;

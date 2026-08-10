import { useRef, useState } from "react";
import { styled } from "styled-components";
import { useElementSize } from "./useElementSize.js";

export default {
  component: useElementSize,
  parameters: { layout: "centered" },
};

export const Default = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  useElementSize(ref, ({ width, height }) => {
    if (!ref.current) return;
    ref.current.innerText = `Size: ${width}×${height}`;
  });

  const [large, setLarge] = useState(false);

  return (
    <Container data-large={large}>
      <div className="box" ref={ref} />
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

  > .box {
    width: 100px;
    height: 100px;
    background: coral;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    font-size: 12px;
  }

  &[data-large="true"] {
    .box {
      width: 200px;
      height: 200px;
    }
  }

  > button {
    margin-top: 10px;
  }
`;

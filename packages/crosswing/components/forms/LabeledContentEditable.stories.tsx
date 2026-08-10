import { useState } from "react";
import styled from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorLayout } from "../SeparatorLayout.js";
import { LabeledContentEditable } from "./LabeledContentEditable.js";

export default {
  component: LabeledContentEditable,
  decorators: [
    CrosswingAppDecorator({ layout: "component" }),
    (Story: () => any) => <Container children={<Story />} />,
  ],
  parameters: { layout: "centered" },
};

export const Empty = () => {
  const [name, setName] = useState("");
  return (
    <>
      <SeparatorLayout>
        <LabeledContentEditable label="Name" value={name} onValueChange={setName} />
      </SeparatorLayout>
      <pre>HTML Value: "{name}"</pre>
    </>
  );
};

export const WithPlaceholder = () => {
  const [name, setName] = useState("");
  return (
    <>
      <SeparatorLayout>
        <LabeledContentEditable
          label="Name"
          value={name}
          placeholder="Enter your name"
          onValueChange={setName}
        />
      </SeparatorLayout>
      <pre>HTML Value: "{name}"</pre>
    </>
  );
};

export const WithValue = () => {
  const [name, setName] = useState("Nick Farina");

  return (
    <>
      <SeparatorLayout>
        <LabeledContentEditable label="Name" value={name} onValueChange={setName} />
      </SeparatorLayout>
      <pre>HTML Value: "{name}"</pre>
    </>
  );
};

export const Disabled = () => (
  <SeparatorLayout>
    <LabeledContentEditable label="Name" value="Nick Farina" disabled />
  </SeparatorLayout>
);

const Container = styled.div`
  display: flex;
  flex-flow: column;

  > pre {
    max-width: 100%;
    white-space: pre-wrap;
    padding: 10px;
    color: ${colors.textSecondary()};
    font: ${fonts.displayMono({ size: 14 })};
  }

  > * + * {
    margin-top: 20px;
  }
`;

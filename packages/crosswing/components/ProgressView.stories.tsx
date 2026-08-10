import { Meta } from "@storybook/react";
import { usePropSequence } from "../hooks/usePropSequence.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { ProgressView } from "./ProgressView.js";

export default {
  component: ProgressView,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ProgressView>;

export const Indeterminate = () => <ProgressView size="50px" />;

export const Progress = () => {
  const props = usePropSequence<typeof ProgressView>(
    [{ progress: 0, animated: false }, { progress: 0.5 }, { progress: 1 }],
    { interval: 1000 },
  );

  return <ProgressView size="50px" {...props} />;
};

export const IndeterminateToProgress = () => {
  const props = usePropSequence<typeof ProgressView>(
    [{ progress: null, animated: false }, { progress: 0.5 }],
    { interval: 1000 },
  );

  return <ProgressView size="50px" {...props} />;
};

export const ProgressFixed = () => {
  return (
    // Show that the <ProgressView> makes enclosing divs big enough to hold it.
    <div style={{ border: "1px solid #00000022", fontSize: "0" }}>
      <ProgressView size="50px" progress={0.4} />
    </div>
  );
};

export const ProgressCentered = () => {
  return (
    // Show that the <ProgressView> is centered with its given size inside
    // the size given by CSS.
    <ProgressView
      style={{
        width: "100px",
        height: "100px",
        border: "1px solid #00000022",
      }}
      size="50px"
      progress={0.4}
    />
  );
};

export const IndeterminateTiny = () => <ProgressView thickness={0.5} size="12px" />;

export const ProgressTiny = () => {
  const props = usePropSequence<typeof ProgressView>(
    [{ progress: 0, animated: false }, { progress: 0.5 }, { progress: 1 }],
    { interval: 1000 },
  );

  return <ProgressView thickness={0.5} size="12px" {...props} />;
};

import { FunctionComponent, useState } from "react";
import { useInterval } from "./useInterval.js";

// Helpful type for Storybook - allows you to pass an array of prop updates
// that will be applied on regular intervals, so you can easily visualize
// alternating between states (good for testing CSS animations).

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
type PropsOf<Type> = Type extends FunctionComponent<infer Props> ? Props : never;

export function usePropSequence<T extends FunctionComponent>(
  sequence: Partial<PropsOf<T>>[],
  { interval = 1000 }: { interval?: number } = {},
): Partial<PropsOf<T>> {
  const [index, setIndex] = useState(0);

  useInterval(() => {
    const nextIndex = (index + 1) % sequence.length;
    setIndex(nextIndex);
  }, interval);

  const props = sequence[index];

  return props;
}

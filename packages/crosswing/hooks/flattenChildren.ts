import { Children, cloneElement, isValidElement, Key, ReactNode } from "react";
import { isFragment } from "react-is";

/* Returns React children into an array, flattening fragments. */
export function flattenChildren(
  children: ReactNode,
  depth: number = 0,
  keys: Key[] = [],
): ReactNode[] {
  return Children.toArray(children).reduce((acc: ReactNode[], node, nodeIndex) => {
    if (isFragment(node)) {
      acc.push(
        ...flattenChildren(
          (node.props as any)?.children ?? null,
          depth + 1,
          keys.concat(node.key || nodeIndex),
        ),
      );
    } else {
      if (isValidElement(node)) {
        acc.push(
          cloneElement(node, {
            key: keys.concat(String(node.key)).join("."),
          }),
        );
      } else if (typeof node === "string" || typeof node === "number") {
        acc.push(node);
      }
    }
    return acc;
  }, []);
}

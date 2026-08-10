import { createContext, RefObject } from "react";

export type ToolbarContextValue = {
  isDefaultContext: boolean;
  /** Ref to one of any <ToolbarInsertionPoint> children. */
  getInsertionRef(name: string): ToolbarInsertionRef;
  /** For any <ToolbarInsertionPoint> children. */
  setInsertionRef(name: string, insertionRef: ToolbarInsertionRef): void;
};

export type ToolbarRef = RefObject<HTMLDivElement | null>;
export type ToolbarInsertionRef = RefObject<HTMLDivElement | null>;

export const ToolbarContext = createContext<ToolbarContextValue>({
  isDefaultContext: true,
  getInsertionRef() {
    throw new Error("Cannot get ToolbarInsertionPoint refs without a parent <ToolbarLayout>.");
  },
  setInsertionRef() {},
});

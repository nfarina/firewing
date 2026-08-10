import { createContext, createElement, ReactNode } from "react";

// Allows you to define a shared location to handle user-visible errors for
// presentation to the user. So you might have a modal library define a
// <GlobalErrorHandlerProvider> and other hooks like `useAsyncTask` can look
// for it by calling `useGlobalErrorHandler`.

export interface GlobalErrorHandler {
  handleError?: (error: Error) => void;
}

export const GlobalErrorHandlerContext = createContext<GlobalErrorHandler>({});
GlobalErrorHandlerContext.displayName = "GlobalErrorHandlerContext";

export function GlobalErrorHandlerProvider({
  handleError,
  children,
}: {
  handleError: (error: Error) => void;
  children?: ReactNode;
}) {
  const value = { handleError };
  return createElement(GlobalErrorHandlerContext, { value }, children);
}

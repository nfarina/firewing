import { Component, ErrorInfo, ReactNode } from "react";
import { NoContent } from "./NoContent.js";

export type ErrorBoundaryFallbackProps = {
  error: Error;
  /** Clears the error and re-renders `children`. */
  reset: () => void;
};

export type ErrorBoundaryProps = {
  children?: ReactNode;
  /**
   * Renders in place of `children` once an error is caught. Defaults to a
   * generic "something went wrong" with a Try again button.
   */
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
  /**
   * Clears a caught error whenever this value changes. Pass whatever identifies
   * the thing being rendered — a route, a record ID — so moving on to different
   * content gives the boundary a fresh start instead of latching the error
   * forever.
   */
  resetKey?: unknown;
  /** Called when an error is caught, for logging on top of React's own. */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = { error: Error | null };

/**
 * Catches render errors from its subtree so one broken component can't unmount
 * the entire app. Without a boundary anywhere, a single bad document — say a
 * recipe whose `name` is unexpectedly null — takes the whole UI down to a blank
 * white screen, which on a mobile host is unrecoverable: the app restores the
 * route it crashed on at launch, so relaunching just crashes again.
 *
 * Errors are still reported: React hands anything a boundary catches to
 * createRoot's `onCaughtError`, so existing capture keeps working unchanged.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    return (
      <NoContent
        title="Something went wrong"
        subtitle="This screen ran into an unexpected problem."
        action="Try again"
        onActionClick={this.reset}
      />
    );
  }
}

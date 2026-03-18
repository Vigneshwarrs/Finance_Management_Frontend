import React from "react";
import { ErrorDialog } from "./ErrorDialog";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service here
    // e.g., Sentry.captureException(error, { extra: errorInfo })
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    return (
      <>
        <ErrorDialog open={this.state.hasError} error={this.state.error} onClose={this.handleClose} />
        {this.props.children}
      </>
    );
  }
}

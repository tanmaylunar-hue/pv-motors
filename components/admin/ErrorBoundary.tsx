"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="font-display text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <Button onClick={this.resetErrorBoundary ?? this.handleReset} className="mt-4" size="sm">
            Retry / Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }

  // Fallback support for generic react-error-boundary API compliance
  private get resetErrorBoundary() {
    return this.handleReset;
  }
}

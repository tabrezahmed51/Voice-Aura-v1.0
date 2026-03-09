import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: (params: { error: Error | null; reset: () => void }) => ReactNode;
  onReset?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, className } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback({ error, reset: this.reset });
      }

      return (
        <div
          className={className ?? "p-6 bg-[#09090b] rounded-lg border border-red-900/50 m-4 text-center shadow-2xl animate-fade-in font-sans"}
          role="alert"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-900/20 mb-4 ring-1 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-500 mb-2 font-mono tracking-tight">System Critical Error</h2>
          <p className="text-red-400/80 mb-6 font-mono text-sm max-w-md mx-auto leading-relaxed">
            {error?.message || "An unexpected anomaly occurred within the neural matrix."}
          </p>
          <button
            onClick={this.reset}
            className="px-6 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 rounded-lg transition-all duration-300 font-mono text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Reinitialize System
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
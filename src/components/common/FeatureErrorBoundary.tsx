'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  featureName?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: any): State {
    let safeError: Error;
    if (error instanceof Error) {
      safeError = error;
    } else if (typeof error === 'object' && error !== null) {
      safeError = new Error(error.message || error.type || 'A feature event error occurred');
    } else {
      safeError = new Error(String(error || 'An unexpected error occurred'));
    }
    return { hasError: true, error: safeError };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error(`[NeoTunes FeatureErrorBoundary - ${this.props.featureName || 'Feature'}] Error:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl bg-[#111217] border border-white/10 text-center space-y-3 my-4 max-w-lg mx-auto">
          <AlertTriangle className="h-6 w-6 text-[#AFC7FF] mx-auto opacity-80" />
          <div className="text-xs font-bold text-white">
            {this.props.featureName || 'This feature'} is temporarily unavailable.
          </div>
          <p className="text-[11px] text-[#A8A7AF]">
            The rest of NeoTunes remains fully functional.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

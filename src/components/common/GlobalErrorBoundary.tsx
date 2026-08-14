'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NeoTunes GlobalErrorBoundary] Uncaught UI error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#050507] text-[#F4F1F7] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#111217] border border-white/10 shadow-2xl space-y-6">
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">NeoTunes hit a temporary snag</h2>
              <p className="text-xs text-[#A8A7AF] leading-relaxed">
                We couldn&apos;t load this screen right now. Your music, playlists, and library are completely safe.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-left font-mono text-[10px] text-red-300 max-h-32 overflow-y-auto">
                <div className="font-bold">{this.state.error.toString()}</div>
                {this.state.errorInfo && <div className="mt-1 opacity-70 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-full bg-[#AFC7FF] text-black text-xs font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-full bg-[#17191F] border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="h-4 w-4" /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

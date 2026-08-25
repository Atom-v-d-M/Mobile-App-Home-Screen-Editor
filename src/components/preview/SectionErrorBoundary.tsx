"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

/** One bad section shows a tile; the rest of the screen keeps rendering. */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Section failed to render", error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="m-4 rounded-[10px] border border-dashed border-[#D8534C]/60 bg-[#F0554B]/8 p-4 text-[13px] text-[#B23A33]">
        This section couldn&apos;t render. Check its values in the editor.
      </div>
    );
  }
}

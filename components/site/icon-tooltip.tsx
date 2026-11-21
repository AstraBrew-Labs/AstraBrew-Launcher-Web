"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./icon-tooltip.css";

type Props = {
  label: string;
  children: ReactNode;
  placement?: "below" | "below-end" | "left";
  className?: string;
  inactive?: boolean;
};

export function IconTooltip({ label, children, placement = "below", className, inactive = false }: Props) {
  const popup = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (inactive || dismissed) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape" && popup.current && getComputedStyle(popup.current).visibility === "visible") {
        setDismissed(true);
      }
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [inactive, dismissed]);

  return (
    <span className={className ? `icon-tooltip ${className}` : "icon-tooltip"}
      data-placement={placement} data-tooltip-inactive={inactive ? "" : undefined} data-dismissed={dismissed ? "" : undefined}
      onPointerEnter={event => { if (event.pointerType !== "touch") setDismissed(false); }}
      onFocus={() => setDismissed(false)}>
      {children}
      {/* The trigger already has its own accessible name; don't announce it twice. */}
      <span ref={popup} className="icon-tooltip-popup" aria-hidden="true">
        <span className="icon-tooltip-label">{label}</span>
      </span>
    </span>
  );
}

"use client";

import { useRef } from "react";
import clsx from "clsx";
import { useIntroStore } from "@/store/introStore";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
  download?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function MagneticButton({
  href,
  children,
  variant = "primary",
  external = false,
  download = false,
  className,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    ref.current.style.transform = `translate3d(${(dx * 0.18).toFixed(1)}px, ${(
      dy * 0.22
    ).toFixed(1)}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download ? true : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={clsx(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden px-6 py-3.5 font-mono text-xs tracking-[0.18em] uppercase transition-[transform,border-color,background-color,color] duration-300 ease-out",
        variant === "primary" &&
          "border border-[var(--color-bronze)] bg-[rgba(210,154,92,0.14)] text-[var(--color-ink)] hover:border-[var(--color-bronze-bright)] hover:bg-[rgba(210,154,92,0.24)]",
        variant === "secondary" &&
          "border border-[var(--border-hairline-strong)] bg-[rgba(17,21,27,0.72)] text-[var(--color-ink-soft)] hover:border-[var(--border-bronze)] hover:text-[var(--color-ink)]",
        variant === "ghost" &&
          "px-3 py-2 text-[var(--color-ink-muted)] hover:text-[var(--color-bronze)]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] origin-left scale-x-0 bg-[var(--color-bronze)] transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      {children}
    </a>
  );
}

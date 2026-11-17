"use client";

import { useEffect, useState } from "react";
import { useIntroStore } from "@/store/introStore";

const GLYPHS = "01∆◊◈X#79ĐÔNGSƠN/*+";

interface ScrambleTextProps {
  text: string;
  active?: boolean;
  className?: string;
}

/**
 * Telemetry Text Scramble (`Chữ số giải mã Telemetry Text Scramble`):
 * Decodes characters through Đông Sơn & hexadecimal telemetry glyphs whenever `active`
 * becomes true (e.g. on project hover) or when `text` switches (e.g. EN <-> VI)!
 */
export function ScrambleText({ text, active = false, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    if (!active || reducedMotion) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const totalFrames = 16;
    const chars = Array.from(text);

    const id = window.setInterval(() => {
      frame += 1;
      const lockCount = Math.floor((frame / totalFrames) * chars.length);

      const next = chars
        .map((ch, idx) => {
          if (ch === " " || ch === "·" || ch === "/") return ch;
          if (idx < lockCount) return ch;
          return GLYPHS[(idx * 7 + frame * 3) % GLYPHS.length] ?? ch;
        })
        .join("");

      setDisplay(next);

      if (frame >= totalFrames) {
        window.clearInterval(id);
        setDisplay(text);
      }
    }, 26);

    return () => {
      window.clearInterval(id);
      setDisplay(text);
    };
  }, [active, reducedMotion, text]);

  return <span className={className}>{display}</span>;
}

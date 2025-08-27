"use client";

import { COLOR_STOPS, GLYPHS } from "../lib/config";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

interface GlyphOrbsProps {
  hideGlyphs?: boolean;
}

function interpolateColor(t: number): string {
  const stops = [0.0, 0.3, 0.55, 0.75, 1.0];
  const cols = COLOR_STOPS.map((s) => s.color);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a && t <= b) {
      const u = (t - a) / (b - a);
      const ca = hexToRgb(cols[i]);
      const cb = hexToRgb(cols[i + 1]);
      const r = Math.round(ca[0] + (cb[0] - ca[0]) * u);
      const g = Math.round(ca[1] + (cb[1] - ca[1]) * u);
      const bch = Math.round(ca[2] + (cb[2] - ca[2]) * u);
      return `rgb(${r}, ${g}, ${bch})`;
    }
  }
  const c = hexToRgb(cols[cols.length - 1]);
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.substring(0, 2), 16),
    parseInt(m.substring(2, 4), 16),
    parseInt(m.substring(4, 6), 16),
  ];
}

// (Old spiral placement removed; we now render a side menu and color via palette)

export default function GlyphOrbs({ hideGlyphs = false }: GlyphOrbsProps) {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handle = () => setSize([window.innerWidth, window.innerHeight]);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const handleRecursionClick = () => {
    // Check if we're currently on Page 2
    const page2 = document.getElementById('page2');
    const hero = document.getElementById('hero');
    
    if (page2 && hero) {
      const page2Rect = page2.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      
      // If Page 2 is visible, scroll to Hero (Page 1)
      // If Hero is visible, scroll to Page 2
      if (page2Rect.top < window.innerHeight / 2) {
        // We're on Page 2, scroll to Hero
        hero.scrollIntoView({ behavior: 'smooth' });
      } else {
        // We're on Page 1, scroll to Page 2
        page2.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Side menu layout instead of spiral placement
  const positions = useMemo(() => {
    const [width, height] = size;
    const menuRight = 44; // pad inwards a bit from edge
    // Restore original top spacing so the side menu position is unchanged
    const topOffset = Math.max(120, Math.round(height * 0.22));
    const spacing = 60; // vertical gap
    
    // Check if we're on Page 2 to show different glyphs
    const page2Element = typeof window !== 'undefined' ? document.getElementById('page2') : null;
    const isPage2 = page2Element && page2Element.getBoundingClientRect().top < window.innerHeight / 2;
    
    if (isPage2) {
      // Page 2: Show no side glyphs
      return [];
    } else {
      // Landing page: Show ⚘⟁ glyph button on the right side, vertically centered
      return [{
        char: "⚘⟁",
        label: "Lotus Trader",
        x: Math.max(60, width - menuRight),
        y: Math.round(height / 2), // Center vertically
        color: "#3b82f6", // blue color
      }];
    }
  }, [size]);

  if (size[0] === 0 || size[1] === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Side menu glyphs - only show if not hidden */}
      {!hideGlyphs && positions.map(({ char, label, x, y, color }, idx) => {
        const style: CSSProperties & { [key: string]: string | number | undefined } = {
          left: Math.round(x - 24),
          top: Math.round(y - 24),
          "--halo": color,
        };
        
        // Make the ⚘⟁ glyph clickable for navigation
        if (char === "⚘⟁") {
          return (
            <button
              key={idx}
              aria-label={label}
              title={label}
              onClick={handleRecursionClick}
              className={`menu-orb pointer-events-auto absolute select-none rounded-full text-[18px] md:text-[20px] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center backdrop-blur-sm border border-white/15 text-white/90 transition-all duration-300 hover:scale-[1.05] cursor-pointer ${
                prefersReduced ? "" : "animate-[float_4s_ease-in-out_infinite]"
              }`}
              style={style}
            >
              <span style={{ color }}>{char}</span>
            </button>
          );
        }
        
        return (
          <button
            key={idx}
            aria-label={label}
            title={label}
            className={`menu-orb pointer-events-auto absolute select-none rounded-full text-[18px] md:text-[20px] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center backdrop-blur-sm border border-white/15 text-white/90 transition-transform hover:scale-[1.03] ${
              prefersReduced ? "" : "animate-[float_4s_ease-in-out_infinite]"
            }`}
            style={style}
          >
            <span style={{ color }}>{char}</span>
          </button>
        );
      })}
      

    </div>
  );
}


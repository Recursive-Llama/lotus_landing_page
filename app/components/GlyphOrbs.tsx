"use client";

import { COLOR_STOPS, GLYPHS, SPIRAL } from "../lib/config";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

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

function computePositions(width: number, height: number) {
  const { a, b, scale, clockwise, turns } = SPIRAL as typeof SPIRAL & { turns: number };
  const centerX = width / 2;
  const centerY = height / 2;
  const direction = clockwise ? 1 : -1;
  // Shared pixelScale with shader
  const maxTheta = Math.PI * 2 * turns;
  const baseRadius = a * Math.exp(b * maxTheta);
  const fit = 0.48;
  const pixelScale = (Math.min(width, height) * fit) / baseRadius;

  return GLYPHS.map((g) => {
    const theta = direction * (Math.PI * 2 * g.t);
    const r = a * Math.exp(b * theta) * pixelScale;
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);
    const t01 = Math.max(0, Math.min(1, (theta + Math.PI) / (2 * Math.PI * turns)));
    const color = interpolateColor(t01);
    return { ...g, x, y, color } as typeof g & { x: number; y: number; color: string };
  });
}

export default function GlyphOrbs() {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handle = () => setSize([window.innerWidth, window.innerHeight]);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Side menu layout instead of spiral placement
  const positions = useMemo(() => {
    const [width, height] = size;
    const menuRight = 44; // pad inwards a bit from edge
    const topOffset = Math.max(120, Math.round(height * 0.22));
    const spacing = 60; // vertical gap
    // Assign menu colors following the spiral gradient order
    const menuColors = [
      COLOR_STOPS[0].color, // teal
      COLOR_STOPS[1].color, // violet
      COLOR_STOPS[2].color, // magenta
      COLOR_STOPS[3].color, // pink/orange
      COLOR_STOPS[4].color, // orange
      "#7fd1ff", // extra fallback tone
      "#b2ffea", // extra fallback tone
    ];
    return GLYPHS.map((g, idx) => ({
      ...g,
      x: Math.max(60, width - menuRight),
      y: topOffset + idx * spacing,
      color: menuColors[idx % menuColors.length],
    }));
  }, [size]);

  if (size[0] === 0 || size[1] === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {positions.map(({ char, label, x, y, color }, idx) => {
        const style: CSSProperties & { [key: string]: string | number | undefined } = {
          left: Math.round(x - 24),
          top: Math.round(y - 24),
          "--halo": color,
        };
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


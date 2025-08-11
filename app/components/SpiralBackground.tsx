"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

type VisualViewportLike = {
  width: number;
  height: number;
  addEventListener?: (type: string, handler: () => void) => void;
  removeEventListener?: (type: string, handler: () => void) => void;
};

type WindowWithVV = Window & { visualViewport?: VisualViewportLike };
import { COLOR_STOPS, SPIRAL } from "../lib/config";

export default function SpiralBackground() {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const update = () => {
      const wwin = window as WindowWithVV;
      const vv = wwin.visualViewport;
      const w = Math.round(vv?.width ?? window.innerWidth);
      const h = Math.round(vv?.height ?? window.innerHeight);
      setSize([w, h]);
    };
    update();
    try {
      const q = new URLSearchParams(window.location.search);
      setDebug(q.get("debugSpiral") === "1");
    } catch {}
    window.addEventListener("resize", update);
    const wwin = window as WindowWithVV;
    wwin.visualViewport?.addEventListener?.("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      wwin.visualViewport?.removeEventListener?.("resize", update);
    };
  }, []);

  const { paths, gradientId, stats } = useMemo(() => {
    const [width, height] = size;
    if (width === 0 || height === 0) {
      return { paths: [], gradientId: "grad", stats: { width, height, pixelScale: 0, totalTheta: 0 } };
    }
    const cx = width / 2;
    const cy = height / 2;
    // Reduce global top gap on mobile by shifting viewBox baseline slightly upward (visual adjustment)
    const isMobile = width <= 640;
    const totalTheta = Math.PI * 2 * SPIRAL.turns;
    const baseRadius = SPIRAL.a * Math.exp(SPIRAL.b * totalTheta);
    // Slightly tighter fit on mobile to reclaim top/right wasted space
    const fit = isMobile ? 0.68 : 0.62;
    const pixelScale = (Math.min(width, height) * fit) / baseRadius;
    const makePath = (offset: number) => {
      const step = isMobile ? 0.014 : 0.010;
      const pts: string[] = [];
      // start where radius is sub-pixel so the spiral visually disappears into the center
      const targetPx = 0.4; // sub-pixel radius
      const tStart = Math.log(targetPx / (SPIRAL.a * pixelScale)) / SPIRAL.b;
      for (let t = tStart; t <= totalTheta; t += step) {
        const r = SPIRAL.a * Math.exp(SPIRAL.b * t) * pixelScale * (1.0 - offset * 0.04);
        const x = cx + r * Math.cos(t);
        const y = cy + r * Math.sin(t);
        pts.push(`${x},${y}`);
      }
      return `M ${pts.join(" L ")}`;
    };

    // Build multiple concentric fades; keep 3 on mobile for quality
    const count = isMobile ? 3 : 4;
    const paths = Array.from({ length: count }, (_, i) => makePath(i));
    return { paths, gradientId: "grad", stats: { width, height, pixelScale, totalTheta } };
  }, [size]);

  // Build a static SVG data URL for mobile to rasterize once and rotate the bitmap smoothly
  const mobileDataUrl = useMemo(() => {
    const [width, height] = size;
    if (width === 0 || height === 0 || width > 640) return "";
    const yShift = -Math.round(height * 0.08);
    const gradientStops = COLOR_STOPS.map((s, i) => `<stop offset="${s.stop * 100}%" stop-color="${s.color}" />`).join("");
    const layer = (p: string, i: number) => [
      `<g opacity="${(0.48 - i * 0.10).toFixed(2)}">`,
      `<path d="${p}" stroke="url(#grad)" stroke-opacity="0.14" stroke-width="${(16 - i * 2.5).toFixed(2)}" stroke-linecap="round" fill="none" />`,
      `<path d="${p}" stroke="url(#grad)" stroke-opacity="0.10" stroke-width="${(12 - i * 2).toFixed(2)}" stroke-linecap="round" fill="none" />`,
      `<path d="${p}" stroke="url(#grad)" stroke-width="${(2.2 - i * 0.15).toFixed(2)}" stroke-linecap="round" fill="none" />`,
      `</g>`
    ].join("");
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 ${yShift} ${width} ${height}" preserveAspectRatio="xMidYMid slice">`,
      `<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">${gradientStops}</linearGradient></defs>`,
      `<rect width="100%" height="100%" fill="#0a0b10"/>`,
      `<g>`,
      paths.map(layer).join(""),
      `</g>`,
      `</svg>`
    ].join("");
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }, [paths, size]);

  const prefersReducedMotion = useReducedMotion();

  // Avoid SSR/client mismatch: render nothing until we have real size
  if (size[0] === 0 || size[1] === 0) {
    return <div className="absolute inset-0 -z-10" aria-hidden />;
  }

  const isMobile = size[0] <= 640;

  // Mobile: show rasterized SVG in <img> and rotate the container for smoothness
  if (isMobile && mobileDataUrl) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          willChange: "transform",
          animation: prefersReducedMotion ? "none" : "rotSlow 90s linear infinite",
        }}
        aria-hidden
      >
        <img src={mobileDataUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <svg
        className="w-full h-full"
        viewBox={`0 ${size[0] <= 640 ? -Math.round(size[1] * 0.08) : 0} ${size[0]} ${size[1]}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        suppressHydrationWarning
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {COLOR_STOPS.map((s, i) => (
              <stop key={i} offset={`${s.stop * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          </filter>
          <filter id="softGlowMobile" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          </filter>
        </defs>
        <style>
          {`
            .spiral-glow { filter: url(#softGlow); }
            @media (max-width: 640px) {
              .spiral-glow { filter: none; }
            }
          `}
        </style>
        <rect width="100%" height="100%" fill="#0a0b10" />
        <g
          style={{
            transformOrigin: "50% 50%",
            transformBox: "view-box",
            willChange: "transform",
            animation: prefersReducedMotion
              ? "none"
              : `rotSlow ${size[0] > 640 ? "60s" : "90s"} linear infinite`,
          }}
        >
        {paths.map((p, i) => (
          <g key={i} opacity={0.48 - i * 0.10}>
            {/* Mobile: no filter; simulate glow with layered strokes */}
            <path d={p} className="spiral-glow" stroke={`url(#${gradientId})`} strokeOpacity="0.14" strokeWidth={16 - i * 2.5} strokeLinecap="round" fill="none" />
            <path d={p} stroke={`url(#${gradientId})`} strokeOpacity={0.10} strokeWidth={12 - i * 2} strokeLinecap="round" fill="none" />
            <path d={p} stroke={`url(#${gradientId})`} strokeWidth={2.2 - i * 0.15} strokeLinecap="round" fill="none" />
          </g>
        ))}
        </g>
      </svg>
      {debug && (
        <div className="absolute left-2 top-2 text-[11px] text-white/80 bg-black/40 rounded px-2 py-1 z-20">
          <div>size: {size[0]}×{size[1]}</div>
          <div>paths: {paths.length}</div>
          <div>pxScale: {stats.pixelScale.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}


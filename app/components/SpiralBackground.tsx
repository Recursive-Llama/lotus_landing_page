"use client";

import { useEffect, useMemo, useState } from "react";
import { COLOR_STOPS, SPIRAL } from "../lib/config";

export default function SpiralBackground() {
  const [size, setSize] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const handle = () => setSize([window.innerWidth, window.innerHeight]);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const { paths, gradientId } = useMemo(() => {
    const [width, height] = size;
    if (width === 0 || height === 0) {
      return { paths: [], gradientId: "grad" };
    }
    const cx = width / 2;
    const cy = height / 2;
    const totalTheta = Math.PI * 2 * SPIRAL.turns;
    const baseRadius = SPIRAL.a * Math.exp(SPIRAL.b * totalTheta);
    const fit = 0.62; // extend outer coils further toward edges
    const pixelScale = (Math.min(width, height) * fit) / baseRadius;
    const makePath = (offset: number) => {
      const step = 0.010;
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

    // Build 4 concentric fades like the reference
    const paths = [0, 1, 2, 3].map((i) => makePath(i));
    return { paths, gradientId: "grad" };
  }, [size]);

  // Avoid SSR/client mismatch: render nothing until we have real size
  if (size[0] === 0 || size[1] === 0) {
    return <div className="absolute inset-0 -z-10" aria-hidden />;
  }

  return (
    <div className="absolute inset-0 z-0">
      <svg className="w-full h-full" viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden suppressHydrationWarning>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {COLOR_STOPS.map((s, i) => (
              <stop key={i} offset={`${s.stop * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#0a0b10" />
        <g style={{ transformOrigin: "50% 50%", animation: "rotSlow 60s linear infinite" }}>
        {paths.map((p, i) => (
          <g key={i} opacity={0.48 - i * 0.10}>
            <path d={p} stroke={`url(#${gradientId})`} strokeOpacity="0.14" strokeWidth={16 - i * 2.5} strokeLinecap="round" filter="url(#softGlow)" fill="none" />
            <path d={p} stroke={`url(#${gradientId})`} strokeWidth={2.2 - i * 0.15} strokeLinecap="round" fill="none" />
          </g>
        ))}
        </g>
      </svg>
    </div>
  );
}


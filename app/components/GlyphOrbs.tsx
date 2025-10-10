"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

interface GlyphOrbsProps {
  hideGlyphs?: boolean;
}

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
    // Check which page we're currently on
    const page2 = document.getElementById('page2');
    const hero = document.getElementById('hero');
    const portfolio = document.getElementById('portfolio');
    
    if (page2 && hero && portfolio) {
      const page2Rect = page2.getBoundingClientRect();
      const portfolioRect = portfolio.getBoundingClientRect();
      
      // Navigation flow: Hero → Page 2 → Portfolio → Hero
      if (portfolioRect.top < window.innerHeight / 2) {
        // We're on Portfolio, scroll to Hero
        hero.scrollIntoView({ behavior: 'smooth' });
      } else if (page2Rect.top < window.innerHeight / 2) {
        // We're on Page 2, scroll to Portfolio
        portfolio.scrollIntoView({ behavior: 'smooth' });
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
              className={`menu-orb pointer-events-auto absolute select-none rounded-full text-[18px] md:text-[20px] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center backdrop-blur-sm border text-white/90 transition-all duration-300 hover:scale-[1.05] cursor-pointer z-50 ${
                prefersReduced ? "" : "animate-[float_4s_ease-in-out_infinite]"
              }`}
              style={{
                left: Math.round(size[0] / 2 - 24), // Center horizontally
                bottom: 60, // Position from bottom
                // Invisible clickable area extends beyond the button
                padding: "12px", // Extends clickable area by 12px in all directions
                // Consistent blue styling for both pages
                border: "1px solid rgba(59, 130, 246, 0.4)",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                // Enhanced blue hover glow effect
                e.currentTarget.style.boxShadow = "0 0 60px rgba(59, 130, 246, 0.8)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.8)";
              }}
              onMouseLeave={(e) => {
                // Restore original blue glow
                e.currentTarget.style.boxShadow = "0 0 30px rgba(59, 130, 246, 0.3)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
              }}
            >
              <span style={{ color: "#3b82f6" }}>⚘⟁</span>
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


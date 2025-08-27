"use client";

import { useState, useEffect } from "react";
import type { CardMinimal } from "@/app/lib/types";
import styles from "../styles/cards.module.css";

type GlyphStyle = "burnt" | "foil" | "flat";

type Props = {
  card: CardMinimal;
  className?: string;
  glyphStyle?: GlyphStyle;
};

export default function CardView({ card, className, glyphStyle = "burnt" }: Props) {
  const { handle: originalHandle, glyphs, psi_delta_phi, level } = card;
  
  // Truncate handle at 63 characters if needed
  const handle = originalHandle.length > 63 ? originalHandle.substring(0, 63) + "..." : originalHandle;
  

  
  // State for dynamic font sizing and text wrapping
  const [handleFontSize, setHandleFontSize] = useState(50);
  const [levelFontSize, setLevelFontSize] = useState(42);
  const [handleNeedsWrapping, setHandleNeedsWrapping] = useState(false);
  const [wrappedHandleLines, setWrappedHandleLines] = useState<string[]>([]);
  
  // State for Level text positioning
  const [levelTextAnchor, setLevelTextAnchor] = useState("start");
  const [levelTextX, setLevelTextX] = useState(128);
  
  // Calculate optimal font sizes and text wrapping
  useEffect(() => {
    const calculateTextLayout = (text: string, maxWidth: number, baseSize: number, minSize: number = 20) => {
      // Create a temporary canvas to measure text width
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return { fontSize: baseSize, needsWrapping: false, lines: [text] };
      
      // Try single line first
      ctx.font = `700 ${baseSize}px "Cormorant Garamond", serif`;
      let textWidth = ctx.measureText(text).width;
      
      // If text fits at base size, use it
      if (textWidth <= maxWidth) {
        return { fontSize: baseSize, needsWrapping: false, lines: [text] };
      }
      
      // Try scaling down
      let fontSize = baseSize;
      while (textWidth > maxWidth && fontSize > minSize) {
        fontSize--;
        ctx.font = `700 ${fontSize}px "Cormorant Garamond", serif`;
        textWidth = ctx.measureText(text).width;
      }
      
      // If we can fit it with scaling, use that
      if (textWidth <= maxWidth) {
        return { fontSize, needsWrapping: false, lines: [text] };
      }
      
      // Otherwise, we need to wrap - split into 2-3 lines
      const words = text.split('_');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine}_${word}` : word;
        ctx.font = `700 ${minSize}px "Cormorant Garamond", serif`;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      return { fontSize: minSize, needsWrapping: true, lines };
    };
    
    // Calculate handle layout (max width: 300px, min font: 20px)
    const handleLayout = calculateTextLayout(handle, 300, 50, 20);
    setHandleFontSize(handleLayout.fontSize);
    setHandleNeedsWrapping(handleLayout.needsWrapping);
    setWrappedHandleLines(handleLayout.lines);
    
    // Calculate level font size and positioning
    const levelLayout = calculateTextLayout(level, 500, 42, 20);
    setLevelFontSize(levelLayout.fontSize);
    
    // Determine Level text positioning based on length
    if (level.length <= 15) {
      // Short text: center it
      setLevelTextAnchor("middle");
      setLevelTextX(375); // Center of card (750/2)
    } else {
      // Longer text: left-align it
      setLevelTextAnchor("start");
      setLevelTextX(128); // Original left position
    }
  }, [handle, level]);

  return (
    <div className={`${styles.cardBox} ${className || ""}`.trim()}>
      <div className={styles.cardContainer}>
        {/* Use the actual card image as background */}
        <img 
          src="/Resonance_Card_front_cut.png" 
          alt="Lotus Card Background" 
          className={styles.cardBackground}
        />
        
        {/* SVG overlays for professional text rendering */}
        <svg 
          className={styles.textOverlay} 
          viewBox="0 0 750 1050" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Light parchment fill */}
            <linearGradient id="lightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAF6EA"/>
              <stop offset="55%" stopColor="#EFE6CF"/>
              <stop offset="100%" stopColor="#E2D4B0"/>
            </linearGradient>

            {/* Dark edge (nearly black, warm) */}
            <linearGradient id="darkEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16110B"/>
              <stop offset="100%" stopColor="#2A1E12"/>
            </linearGradient>

            {/* Bubble shading */}
            <radialGradient id="bubbleGrad" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#f6f1da"/>
              <stop offset="55%" stopColor="#d9cfa6"/>
              <stop offset="100%" stopColor="#a58e56"/>
            </radialGradient>



            {/* Engraved inner shadow for the glyph (no fill) */}
            <filter id="engrave" filterUnits="userSpaceOnUse" x="-120" y="-120" width="420" height="420">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b"/>
              <feOffset in="b" dx="0" dy="1.2" result="o"/>
              <feComposite in="o" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
              <feColorMatrix in="inner" type="matrix"
                values="0 0 0 0 0.12
                        0 0 0 0 0.09
                        0 0 0 0 0.05
                        0 0 0 0.70 0" result="innerTint"/>
              <feBlend in="innerTint" in2="innerTint" mode="normal"/>
            </filter>

            {/* Outer glow for the glyph */}
            <filter id="neon" filterUnits="userSpaceOnUse" x="-120" y="-120" width="420" height="420">
              <feGaussianBlur stdDeviation="3"/>
            </filter>

            {/* Soft halo glow */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.8"/>
            </filter>

            {/* Inner shadow (letterpress) */}
            <filter id="inset" x="-30%" y="-40%" width="160%" height="200%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur"/>
              <feOffset in="blur" dx="0" dy="1.0" result="off"/>
              <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
              <feColorMatrix in="inner" type="matrix"
                values="0 0 0 0 0.10
                        0 0 0 0 0.08
                        0 0 0 0 0.05
                        0 0 0 0.55 0"/>
            </filter>

            {/* Very soft outer shadow for lift */}
            <filter id="outer" x="-40%" y="-40%" width="180%" height="220%">
              <feOffset dx="0" dy="1" in="SourceAlpha" result="off"/>
              <feGaussianBlur in="off" stdDeviation="1.2" result="blur"/>
              <feColorMatrix in="blur" type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0.35 0" result="shadow"/>
              <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Thin top sheen to sell the emboss */}
            <linearGradient id="topSheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".45"/>
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0"/>
            </linearGradient>
            <mask id="topHalf"><rect x="0" y="0" width="100%" height="45%" fill="#fff"/></mask>

            {/* Inner shadow (deboss) for other text */}
            <filter id="deboss" x="-50%" y="-20%" width="200%" height="140%">
              <feOffset dx="0.6" dy="0.8" result="off"/>
              <feGaussianBlur in="off" stdDeviation="0.9" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="-1" k3="1" result="inner"/>
              <feMerge>
                <feMergeNode in="inner"/>
                <feMergeNode in="inner"/>
              </feMerge>
            </filter>

            {/* Avatar circle clip path */}
            <clipPath id="avatarClip">
              <circle cx="565" cy="155" r="105" />
            </clipPath>

            {/* Bloom filter for glyphs */}
            <filter id="bloom" filterUnits="userSpaceOnUse" x="-120" y="-120" width="420" height="420">
              <feMorphology operator="dilate" radius="1.5"/>
              <feGaussianBlur stdDeviation="2"/>
            </filter>

            {/* Cavity filter for glyphs */}
            <filter id="cavity" filterUnits="userSpaceOnUse" x="-120" y="-120" width="420" height="420">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
              <feOffset in="SourceAlpha" dx="0" dy="0.5" result="off"/>
              <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
              <feColorMatrix in="inner" type="matrix"
                values="0 0 0 0 0.05
                        0 0 0 0 0.04
                        0 0 0 0 0.03
                        0 0 0 0.20 0"/>
            </filter>

            {/* Light source behind the card - bright glow */}
            <filter id="behindLight" filterUnits="userSpaceOnUse" x="-120" y="-120" width="420" height="420">
              <feGaussianBlur stdDeviation="1.5"/>
              <feOffset in="SourceAlpha" dx="0" dy="0.5" result="off"/>
              <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
              <feColorMatrix in="inner" type="matrix"
                values="0 0 0 0 0.15
                        0 0 0 0 0.15
                        0 0 0 0 0.15
                        0 0 0 0.80 0"/>
            </filter>

            {/* Strong shadow for delta phi text - makes it look raised */}
            <filter id="strongShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dx="0" dy="3" in="SourceAlpha" result="off"/>
              <feGaussianBlur in="off" stdDeviation="2" result="blur"/>
              <feColorMatrix in="blur" type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0.8 0" result="shadow"/>
              <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>



            {/* Bevel/emboss filter for 3D metallic effect */}
            <filter id="goldBevel" x="-20%" y="-20%" width="140%" height="140%">
              {/* External drop shadow */}
              <feDropShadow dx="8" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.8"/>
              
              {/* inner shadow */}
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
              <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>

              {/* lighting highlight */}
              <feSpecularLighting result="specOut" in="blur" specularConstant="1"
                specularExponent="20" lightingColor="#fff">
                <fePointLight x="-5000" y="-5000" z="20000"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in"/>
            </filter>

            {/* Black bevel filter for level text */}
            <filter id="blackBevel" x="-20%" y="-20%" width="140%" height="140%">
              {/* inner shadow */}
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
              <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>

              {/* lighting highlight */}
              <feSpecularLighting result="specOut" in="blur" specularConstant="1"
                specularExponent="20" lightingColor="#fff">
                <fePointLight x="-5000" y="-5000" z="20000"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in"/>
            </filter>
          </defs>

          {/* Handle text with MTG-style styling */}
          {/* Bottom layer: solid fill for readability */}
          {handleNeedsWrapping ? (
            // Multi-line rendering - start higher to fit all lines
            wrappedHandleLines.map((line, index) => (
              <text
                key={`handle-bottom-${index}`}
                x="114" y={142 - 25 + (index * (handleFontSize + 8))}
                fontFamily="Cormorant Garamond, serif"
                fontSize={handleFontSize}
                fontWeight="700"
                letterSpacing="0.4px"
                fill="#5B5646"
                opacity="0.75"
              >
                {line}
              </text>
            ))
          ) : (
            // Single line rendering
            <text
              x="114" y="142"
              fontFamily="Cormorant Garamond, serif"
              fontSize={handleFontSize}
              fontWeight="700"
              letterSpacing="0.4px"
              fill="#5B5646"
              opacity="0.75"
            >
              {handle}
            </text>
          )}
          
          {/* Top layer: with shadow effect */}
          <g filter="url(#outer)">
            {handleNeedsWrapping ? (
              // Multi-line rendering
              wrappedHandleLines.map((line, index) => (
                <text
                  key={`handle-top-${index}`}
                  id={`handle-text-${index}`}
                  x="114" y={141.69 - 25 + (index * (handleFontSize + 8))}
                  fontFamily="Cormorant Garamond, serif"
                  fontSize={handleFontSize}
                  fontWeight="700"
                  letterSpacing="0.4px"
                  fill="url(#lightFill)"
                  stroke="url(#darkEdge)" strokeWidth="1.2"
                  filter="url(#inset)"
                  opacity="0.9"
                >
                  {line}
                </text>
              ))
            ) : (
              // Single line rendering
              <text
                id="handle-text"
                x="114" y="141.69"
                fontFamily="Cormorant Garamond, serif"
                fontSize={handleFontSize}
                fontWeight="700"
                letterSpacing="0.4px"
                fill="url(#lightFill)"
                stroke="url(#darkEdge)" strokeWidth="1.2"
                filter="url(#inset)"
                opacity="0.9"
              >
                {handle}
              </text>
            )}
          </g>
          
          {/* HALO: clipped glow to lift the letters (top layer) */}
          <g style={{ mixBlendMode: "soft-light", opacity: 0.6 }}>
            {handleNeedsWrapping ? (
              // Multi-line halo effect
              wrappedHandleLines.map((line, index) => (
                <use key={`handle-halo-${index}`} href={`#handle-text-${index}`} fill="#FFFFFF" filter="url(#softGlow)"/>
              ))
            ) : (
              // Single line halo effect
              <use href="#handle-text" fill="#FFFFFF" filter="url(#softGlow)"/>
            )}
          </g>

          {/* Top shimmer clipped to upper part of glyphs */}
          {handleNeedsWrapping ? (
            // Multi-line shimmer effect
            wrappedHandleLines.map((line, index) => (
              <use key={`handle-shimmer-${index}`} href={`#handle-text-${index}`} fill="url(#topSheen)" mask="url(#topHalf)"/>
            ))
          ) : (
            // Single line shimmer effect
            <use href="#handle-text" fill="url(#topSheen)" mask="url(#topHalf)"/>
          )}

          {/* Avatar circle */}
          <g id="slot-avatar">
            <image href={card.image_url} x="460" y="50" width="210" height="210" clipPath="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />
          </g>

          {/* Psi Delta Phi - big box - Metallic gold effect */}
          {/* External shadow layer */}
          <text id="psi-number-shadow"
                x="276.5" y="701.5"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="90" fontWeight="800"
                fill="#000"
                opacity="0.15"
                style={{ letterSpacing: ".02em" }}>
            {psi_delta_phi.toFixed(2)}
          </text>
          
          {/* Main text with internal effects */}
          <text id="psi-number"
                x="275" y="700"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="90" fontWeight="800"
                filter="url(#goldBevel)"
                style={{ letterSpacing: ".02em" }}>
            {psi_delta_phi.toFixed(2)}
          </text>
          
          {/* Symbol external shadow */}
          <text id="psi-symbol-shadow"
                x="301.5" y="781.5"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="90" fontWeight="800"
                fill="#000"
                opacity="0.15"
                style={{ letterSpacing: ".02em" }}>
            ∆φ
          </text>
          
          {/* Symbol main text */}
          <text id="psi-symbol"
                x="300" y="780"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="90" fontWeight="800"
                filter="url(#goldBevel)"
                style={{ letterSpacing: ".02em" }}>
            ∆φ
          </text>

          {/* Level - bottom bar */}
          {/* Bottom layer: solid fill for readability */}
          <text
                x={levelTextX} y="920"
                fontFamily="Cormorant Garamond, serif"
                fontSize={levelFontSize}
                fontWeight="750"
                letterSpacing="0.4px"
                textAnchor={levelTextAnchor}
                fill="#5B5646">
            {level}
          </text>
          
          {/* Top layer: with shadow effect */}
          <g filter="url(#outer)">
            <text id="level-text"
                  x={levelTextX} y="919.69"
                  fontFamily="Cormorant Garamond, serif"
                  fontSize={levelFontSize}
                  fontWeight="750"
                  letterSpacing="0.4px"
                  textAnchor={levelTextAnchor}
                  fill="url(#lightFill)"
                  stroke="url(#darkEdge)" strokeWidth="1.2"
                  filter="url(#inset)">
              {level}
            </text>
          </g>
          
          {/* HALO: clipped glow to lift the letters (top layer) */}
          <g style={{ mixBlendMode: "soft-light", opacity: 0.6 }}>
            <use href="#level-text" fill="#FFFFFF" filter="url(#softGlow)"/>
          </g>

          {/* Top shimmer clipped to upper part of glyphs */}
          <use href="#level-text" fill="url(#topSheen)" mask="url(#topHalf)"/>
        </svg>
        
        {/* CSS Bubbles with glowing text - positioned relative to card container */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top bubble */}
          <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-top-rotate">
            {/* Bubble glow effect - positioned behind the bubble */}
            <div className="absolute -inset-2 w-24 h-24 rounded-full bg-[#28d8c1] opacity-40 blur-sm animate-custom-pulse"></div>
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-gray-800/90 to-gray-900/95 border border-gray-500/60 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-[24px] text-[#28d8c1] drop-shadow-[0_0_4px_rgba(40,216,193,0.6)] font-normal" style={{fontFamily: "'Noto Sans Symbols 2', 'Symbola', 'DejaVu Sans', system-ui"}}>{glyphs.split(' ')[0] || '∫'}</span>
            </div>
          </div>
          
          {/* Bottom left bubble */}
          <div className="absolute top-[45%] left-[33%] transform -translate-x-1/2 -translate-y-1/2 animate-bottom-left-rotate">
            {/* Bubble glow effect - positioned behind the bubble */}
            <div className="absolute -inset-2 w-24 h-24 rounded-full bg-[#3B82F6] opacity-40 blur-sm animate-custom-pulse"></div>
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-gray-800/90 to-gray-900/95 border border-gray-500/60 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-[24px] text-[#3B82F6] drop-shadow-[0_0_4px_rgba(59,130,246,0.6)] font-normal" style={{fontFamily: "'Noto Sans Symbols 2', 'Symbola', 'DejaVu Sans', system-ui"}}>{glyphs.split(' ')[1] || '℧'}</span>
            </div>
          </div>
          
          {/* Bottom right bubble */}
          <div className="absolute top-[45%] left-[67.5%] transform -translate-x-1/2 -translate-y-1/2 animate-bottom-right-rotate">
            {/* Bubble glow effect - positioned behind the bubble */}
            <div className="absolute -inset-2 w-24 h-24 rounded-full bg-[#F97316] opacity-40 blur-sm animate-custom-pulse"></div>
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-gray-800/90 to-gray-900/95 border border-gray-500/60 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-[24px] text-[#F97316] drop-shadow-[0_0_4px_rgba(249,115,22,0.6)] font-normal" style={{fontFamily: "'Noto Sans Symbols 2', 'Symbola', 'DejaVu Sans', system-ui"}}>{glyphs.split(' ')[2] || '⧚'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.shine} aria-hidden />
    </div>
  );
}



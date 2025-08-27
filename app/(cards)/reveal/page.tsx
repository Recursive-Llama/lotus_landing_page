"use client";

import { useEffect, useMemo, useState } from "react";
import CardView from "../components/CardView";
import styles from "../styles/cards.module.css";
import type { CardMinimal, RunResponse } from "@/app/lib/types";
import { useReducedMotion } from "@/app/lib/useReducedMotion";
import html2canvas from "html2canvas";

type Phase = "idle" | "processing" | "rendering" | "revealed" | "error";

export default function RevealPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [card, setCard] = useState<CardMinimal | null>(null);
  const prefersReduced = useReducedMotion();
  const [testDelay, setTestDelay] = useState(true); // Toggle for test delay
  const [animationPhase, setAnimationPhase] = useState(0); // Current animation phase
  const [processingText, setProcessingText] = useState<string[]>([]); // Array of processing text lines
  const [showShareOptions, setShowShareOptions] = useState(false); // Show/hide share options
  
  // demo handle; in production read from search param or input
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const handle = (params.get("handle") || "@lotusprotocol").trim();
  const glyphStyle = (params.get("glyphStyle") as any) || "burnt";
  
  // Test data for development - remove in production
  const testCard: CardMinimal = {
    handle: handle,
    image_url: "/kickz.jpg", // This will be dynamic from API
    narrative: "This is a test narrative to see how the text wrapping works in the Lore section. It should wrap properly within the container boundaries and maintain good readability.",
    narrative_twitter: "This is a test twitter narrative to see how the text wrapping works in the Lore section. It should wrap properly within the container boundaries and maintain good readability.",
    glyphs: "∫ ℧ ⧚", // This will be dynamic from API
    psi_delta_phi: 3.45,
    level: "Architect of the Spiral Bloom",
    family: "Spiral Architects",
    scores: {
      coherence: 8.7,
      surprise: 6.2,
      resonance: 9.1,
      complexity: 7.8,
      depth: 8.9,
      emergence: 7.3,
      novelty: 6.8
    }
  };

  // Close share options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.share-options-container')) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);

  // Processing text phases for tension building
  const processingSteps = [
    "Extracting Twitter Essence...",
    "Analysing Essence...",
    "Compressing Essence...",
    "Analysing Compression...",
    "Creating SoulPrint...",
    "Compressing SoulPrint to Glyphs...",
    "Calculating Essence Scores...",
    "Rendering...."
  ];

  // Animation phases for progressive intensity
  const animationPhases = [
    { shake: "none", duration: 16000 },   // 0-16s: No shaking, just breathing
    { shake: "gentle", duration: 8000 },  // 16-24s: Gentle shaking starts
    { shake: "moderate", duration: 8000 }, // 24-32s: Moderate shaking
    { shake: "intense", duration: 8000 }  // 32-40s: Intense shaking
  ];

  const start = async () => {
    try {
      setPhase("processing");
      setProcessingText([]);
      setAnimationPhase(0);
      
      // Start the progressive text and animation phases
      let currentPhase = 0;
      let currentTextIndex = 0;
      let textTimer: NodeJS.Timeout | null = null;
      
      const startTime = Date.now();
      const totalDuration = testDelay ? 60000 : 1000; // 1 minute for test, 1 second for production
      
      // First text line appears after 2 second delay
      setTimeout(() => {
        setProcessingText([processingSteps[0]]);
        currentTextIndex = 1;
        
        // Text progression timer (remaining lines)
        textTimer = setInterval(() => {
          if (currentTextIndex < processingSteps.length) {
            setProcessingText(prev => [...prev, processingSteps[currentTextIndex]]);
            currentTextIndex++;
          }
        }, (totalDuration - 3000) / (processingSteps.length - 1)); // Subtract 3 seconds (2s delay + 1s for first line)
      }, 2000);
      
      // Animation phase progression timer
      const animationTimer = setInterval(() => {
        if (currentPhase < animationPhases.length - 1) {
          currentPhase++;
          setAnimationPhase(currentPhase);
        }
      }, totalDuration / animationPhases.length);
      
      // Main completion timer
      const completionTimer = setTimeout(() => {
        if (textTimer) clearInterval(textTimer);
        clearInterval(animationTimer);
        
        // Flip immediately when data arrives - no calm phase
        setCard(testCard);
        setPhase("rendering");
        setTimeout(() => setPhase("revealed"), prefersReduced ? 100 : 900);
        
      }, totalDuration);
      
      // Cleanup function
      return () => {
        if (textTimer) clearInterval(textTimer);
        clearInterval(animationTimer);
        clearTimeout(completionTimer);
      };
      
    } catch (e) {
      setPhase("error");
    }
  };

  const wrapClass = useMemo(() => (phase === "revealed" ? styles.reveal : ""), [phase]);

  // Sharing functionality
  const formatTwitterText = () => {
    if (!card) return "";
    
    const glyphs = card.glyphs || "";
    const narrativeTwitter = card.narrative_twitter || card.narrative || "";
    
    return `${glyphs}\n\n${narrativeTwitter}\n\nTwitter essence compressed by @lotusprotocol.\nWho are you?`;
  };

      const convertCardToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    try {
      console.log('=== CREATING CANVAS FROM SCRATCH ===');
      
      // Create a new canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Failed to get canvas context');
        return null;
      }
      
      // Set canvas size (card dimensions)
      const cardWidth = 400;
      const cardHeight = 560;
      canvas.width = cardWidth * 2; // 2x scale for quality
      canvas.height = cardHeight * 2;
      
      // Scale the context for high quality
      ctx.scale(2, 2);
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cardWidth, cardHeight);
      
      // Draw card background (dark with glow)
      const gradient = ctx.createRadialGradient(cardWidth/2, cardHeight/2, 0, cardWidth/2, cardHeight/2, cardWidth/2);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.7, '#16213e');
      gradient.addColorStop(1, '#0f0f23');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(20, 20, cardWidth - 40, cardHeight - 40);
      
      // Add card glow effect
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 20;
      ctx.fillRect(20, 20, cardWidth - 40, cardHeight - 40);
      ctx.shadowBlur = 0;
      
      // Draw card content based on phase
      if (phase === "revealed" && card) {
        // Draw front face content
        console.log('Drawing front face content...');
        
        // Profile image placeholder (circle)
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(200, 80, 40, 0, 2 * Math.PI);
        ctx.fill();
        
        // Handle text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(card.handle || '@user', 200, 150);
        
        // Level text
        ctx.font = 'bold 24px system-ui';
        ctx.fillText(card.level || 'Level', 200, 200);
        
        // Glyphs
        ctx.font = '48px system-ui';
        ctx.fillText(card.glyphs || '∫ ℧ ⧚', 200, 280);
        
        // Score
        ctx.font = 'bold 36px system-ui';
        ctx.fillText(`ψ(∆φ) = ${card.psi_delta_phi || '0.0'}`, 200, 340);
        
        // Lore text (wrapped)
        const loreText = card.narrative || 'No narrative available';
        ctx.font = '16px system-ui';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e5e7eb';
        
        // Simple text wrapping
        const maxWidth = 320;
        const lineHeight = 20;
        let y = 380;
        let currentLine = '';
        const words = loreText.split(' ');
        
        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine !== '') {
            ctx.fillText(currentLine, 40, y);
            y += lineHeight;
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          ctx.fillText(currentLine, 40, y);
        }
        
      } else {
        // Draw back face content
        console.log('Drawing back face content...');
        
        // Lotus symbol
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 48px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('⚘', 200, 200);
        
        // Back text
        ctx.font = 'bold 24px system-ui';
        ctx.fillText('Lotus Protocol', 200, 280);
        ctx.font = '18px system-ui';
        ctx.fillText('Click to reveal your essence', 200, 320);
      }
      
      console.log('Canvas creation successful!');
      return canvas;
      
    } catch (error) {
      console.error('Error creating canvas from scratch:', error);
      return null;
    }
  };

  const shareToTwitter = async () => {
    const text = formatTwitterText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyPNGToClipboard = async () => {
    console.log('=== COPY PNG TO CLIPBOARD STARTED ===');
    try {
      console.log('Calling convertCardToCanvas...');
      const canvas = await convertCardToCanvas();
      console.log('convertCardToCanvas result:', canvas ? 'Success' : 'Failed');
      
      if (!canvas) {
        alert('Failed to generate canvas. Please try again.');
        return;
      }
      
      console.log('Attempting to copy PNG to clipboard...');
      
      // Method 1: Try modern Clipboard API with image
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
            }, 'image/png');
          });
          
          // Create clipboard item with image
          const clipboardItem = new ClipboardItem({
            'image/png': blob
          });
          
          // Copy to clipboard
          await navigator.clipboard.write([clipboardItem]);
          alert('PNG copied to clipboard! You can now paste it directly into Twitter.');
          return;
        } catch (clipboardError) {
          console.log('Modern clipboard API failed, trying fallback...', clipboardError);
        }
      }
      
      // Method 2: Try copying as data URL to text clipboard
      try {
        const pngData = canvas.toDataURL('image/png');
        await navigator.clipboard.writeText(pngData);
        alert('PNG data URL copied to clipboard! You can paste this into image-compatible apps.');
        return;
      } catch (textClipboardError) {
        console.log('Text clipboard failed, trying final fallback...', textClipboardError);
      }
      
      // Method 3: Fallback to download
      alert('Clipboard copy not supported on this browser/context. Downloading PNG instead...');
      downloadPNG();
      
    } catch (error) {
      console.error('All clipboard methods failed:', error);
      alert('Clipboard copy failed. Downloading PNG instead...');
      downloadPNG();
    }
  };

  const downloadPNG = async () => {
    console.log('=== DOWNLOAD PNG STARTED ===');
    try {
      console.log('Calling convertCardToCanvas...');
      const canvas = await convertCardToCanvas();
      console.log('convertCardToCanvas result:', canvas ? 'Success' : 'Failed');
      
      if (!canvas) {
        alert('Failed to generate canvas. Please try again.');
        return;
      }
      
      console.log('Downloading PNG...');
      
      // Method 1: Try direct download with canvas
      try {
        const link = document.createElement('a');
        link.download = `lotus-card-${handle.replace('@', '')}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Download initiated');
        return;
      } catch (downloadError) {
        console.log('Direct download failed, trying blob method...', downloadError);
      }
      
      // Method 2: Convert canvas to blob and download
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png');
        });
        
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `lotus-card-${handle.replace('@', '')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        console.log('Blob download successful');
        return;
      } catch (blobError) {
        console.log('Blob download failed:', blobError);
      }
      
      // Method 3: Open canvas in new tab for manual save
      alert('Automatic download failed. Opening canvas in new tab for manual save...');
      const dataUrl = canvas.toDataURL('image/png');
      window.open(dataUrl, '_blank');
      
    } catch (error) {
      console.error('All download methods failed:', error);
      alert('Failed to download PNG. Please try again or contact support.');
    }
  };

  const copyTextToClipboard = async () => {
    const text = formatTwitterText();
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Text copied to clipboard!');
    }
  };

  const showCardCanvas = async () => {
    try {
      const canvas = await convertCardToCanvas();
      if (!canvas) {
        alert('Failed to generate card canvas. Please try again.');
        return;
      }
      
      // Create a modal to show the canvas
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
      `;
      
      // Create canvas container
      const canvasContainer = document.createElement('div');
      canvasContainer.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        cursor: default;
      `;
      
      // Add instructions
      const instructions = document.createElement('div');
      instructions.innerHTML = `
        <div style="margin-bottom: 15px; text-align: center; color: #333;">
          <h3 style="margin: 0 0 10px 0;">Your Lotus Card</h3>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Right-click the image to save or copy it
          </p>
        </div>
      `;
      
      // Add canvas
      canvas.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 8px;
        max-width: 100%;
        height: auto;
      `;
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Assemble modal
      canvasContainer.appendChild(instructions);
      canvasContainer.appendChild(canvas);
      canvasContainer.appendChild(closeButton);
      modal.appendChild(canvasContainer);
      
      // Add to page
      document.body.appendChild(modal);
      
      // Event handlers
      const closeModal = () => {
        document.body.removeChild(modal);
      };
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      
      closeButton.addEventListener('click', closeModal);
      
      // Escape key to close
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
      };
      document.addEventListener('keydown', handleEscape);
      
      // Cleanup
      modal.addEventListener('remove', () => {
        document.removeEventListener('keydown', handleEscape);
      });
      
    } catch (error) {
      console.error('Failed to show card canvas:', error);
      alert('Failed to show card canvas. Please try again.');
    }
  };

  // Get current animation classes based on phase
  const getShakeClasses = () => {
    // Only apply shaking during processing phase
    if (phase !== "processing") return "";
    
    const currentPhase = animationPhases[animationPhase];
    if (!currentPhase) return "";
    
    switch (currentPhase.shake) {
      case "none":
        return ""; // No shaking, just breathing animation
      case "gentle":
        return styles['shake-gentle'];
      case "moderate":
        return styles['shake-moderate'];
      case "intense":
        return styles['shake-intense'];
      default:
        return "";
    }
  };



  return (
    <main className="relative min-h-screen bg-[#0a0b10] text-white overflow-hidden">
      {/* Enhanced background with spiral field */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b10] via-[#0f1419] to-[#0a0b10]" />
      
      {/* Subtle spiral background - like landing page but softer */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full rounded-full border border-transparent bg-gradient-conic from-purple-500/30 via-blue-500/20 via-teal-500/20 to-purple-500/30 blur-sm"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full rounded-full border border-transparent bg-gradient-conic from-teal-500/20 via-blue-500/20 via-purple-500/20 to-teal-500/20 blur-sm"></div>
        </div>
      </div>
      
      {/* Partial spiral arcs - echoing landing page motif */}
      <div className="absolute inset-0 opacity-15">
        {/* Top-left spiral arc */}
        <div className="absolute top-0 left-0 w-96 h-96">
          <div className="w-full h-full rounded-full border border-transparent bg-gradient-conic from-purple-500/25 via-blue-500/15 to-transparent blur-sm"></div>
        </div>
        {/* Bottom-right spiral arc */}
        <div className="absolute bottom-0 right-0 w-80 h-80">
          <div className="w-full h-full rounded-full border border-transparent bg-gradient-conic from-teal-500/25 via-blue-500/15 to-transparent blur-sm"></div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8 p-6">
        <div className="text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm md:text-base text-white/70">
              Analysis Twitter:
            </span>
            <input
              type="text"
              placeholder="Paste your Twitter URL here..."
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:border-white/40 w-80"
              value={handle}
              onChange={(e) => {
                // Extract handle from URL or use as-is
                const url = e.target.value;
                if (url.includes('twitter.com/') || url.includes('x.com/')) {
                  const match = url.match(/(?:twitter\.com|x\.com)\/([^/?]+)/);
                  if (match) {
                    // Update the handle state if you want to make it dynamic
                    // For now, just store the URL
                  }
                }
              }}
            />
            <button 
              className="btn px-6 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 font-medium text-sm" 
              onClick={start} 
              disabled={phase !== "idle" && phase !== "error"}
            >
              {phase === "idle" || phase === "error" ? "Compress" : "Compressing…"}
            </button>
          </div>
          
          {/* Test Delay Toggle */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <label className="text-sm text-white/60">
              <input
                type="checkbox"
                checked={testDelay}
                onChange={(e) => setTestDelay(e.target.checked)}
                className="mr-2"
              />
              Test Mode: 1-minute delay
            </label>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center w-full">
          {/* Left Panel - Dynamic content based on phase */}
          <div className="absolute left-8 top-0 w-96">
            {phase === "idle" || phase === "error" ? (
              // How It Works - Simple text explanation (no box)
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-6">
                  How It Works
                </h2>
                <div className="space-y-4 text-base text-white/85">
                  <p>
                    The Lotus Card compresses your Twitter presence into a unique resonance signature. 
                    By analyzing your tweets, connections, and engagement patterns, we create a 
                    mathematical representation of your digital consciousness.
                  </p>
                  <p>
                    Click "Compress" to begin the analysis. Your Twitter data will be processed 
                    through our proprietary ψ(Δφ) algorithm, revealing your unique position in the 
                    network's emergent field.
                  </p>
                  <p className="text-sm text-white/60">
                    Your data remains private and is processed locally. No personal information is stored.
                  </p>
                </div>
              </div>
            ) : phase === "processing" ? (
              // Processing Phase - Elegant Code Output
              <div className="text-left font-mono">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-6 text-center">
                  Processing...
                </h2>
                <div className="space-y-2 text-sm text-white/85">
                  {processingText.map((text, index) => (
                    <div 
                      key={index} 
                      className={`${styles['animate-typewriter']} text-green-400/80`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {text}
                    </div>
                  ))}
                  {processingText.length > 0 && (
                    <div className="text-green-400/60 animate-pulse">
                      ▋
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Lore Section (after compression)
              <div className={`${styles['animate-fade-in']} p-6 rounded-lg`}>
                {/* Background glyph etching */}
                <div className="absolute inset-0 opacity-5 text-white/20 pointer-events-none">
                  <div className="text-6xl font-mono text-center mt-20">⚘</div>
                  <div className="text-2xl font-mono text-center mt-4">∆φ</div>
                </div>
                
                <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight text-white mb-6 ${styles['animate-write']}`} style={{ animationDelay: '0.5s' }}>
                  Lore of {handle}
                </h2>
                <p className={`text-base md:text-lg text-white/85 ${styles['animate-fade-in-delayed']}`}
                   style={{ 
                     wordWrap: 'break-word', 
                     overflowWrap: 'break-word',
                     lineHeight: '1.6'
                   }}>
                  {card?.narrative || "Narrative loading..."}
                </p>
              </div>
            )}
          </div>
          
          {/* Shared spiral glass canvas for Lore + Score (only after compression) */}
          {phase === "revealed" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-8 top-0 w-96 h-full rounded-lg bg-gradient-to-br from-purple-500/8 via-blue-500/5 to-transparent border border-white/10"></div>
              <div className="absolute right-8 top-0 w-96 h-full rounded-lg bg-gradient-to-br from-teal-500/8 via-blue-500/5 to-transparent border border-white/10"></div>
            </div>
          )}
          
          {/* Card Section - Centered with spiral resonance glow */}
          <div className={`${styles.wrap} ${styles.float} ${getShakeClasses()}`}>
            {/* Background glow effect - resonates with spiral field */}
            <div className="absolute inset-0 -m-8 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/25 to-teal-500/20 blur-2xl opacity-80"></div>
            

            
            {/* Flip Container */}
            <div className={styles['flip-outer']}>
              <div className={`${styles['flip-inner']} ${phase === "revealed" ? styles.flipped : ""}`}>
                {/* back face image */}
                <img 
                  src="/Resonance_Card_Back_cut.png" 
                  alt="Lotus Resonance Card Back"
                  className={`${styles['card-back']} ${styles.float}`}
                  style={{ objectFit: 'contain' }}
                />
                
                {/* front face card */}
                {card && (
                  <div className={styles['card-front']}>
                    <CardView card={card} glyphStyle={glyphStyle as any} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Score Card - Positioned to the right (only shows after compression) */}
          {phase === "revealed" && (
            <div className={`absolute right-8 top-0 w-96 ${styles['animate-fade-in']} p-6 rounded-lg`}>
              {/* Background formula etching */}
              <div className="absolute inset-0 opacity-5 text-white/20 pointer-events-none">
                <div className="text-6xl font-mono text-center mt-20">ψ(Δφ)</div>
                <div className="text-2xl font-mono text-center mt-4">= ℏ × ψ(ω) × ∫</div>
              </div>
              
              <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight text-white mb-6 text-center ${styles['animate-write']}`} style={{ animationDelay: '0.5s' }}>
                ψ(∆φ) Score
              </h2>
              
              {/* Score Breakdown */}
              <div className="space-y-3 text-base text-white/85 mb-6">
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '0.8s' }}>
                  <span>ψ(ω): Coherence</span>
                  <span className="font-semibold">{card?.scores?.coherence || "—"}</span>
                </div>
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '1.0s' }}>
                  <span>ℏ: Surprise</span>
                  <span className="font-semibold">{card?.scores?.surprise || "—"}</span>
                </div>
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '1.2s' }}>
                  <span>φ: Resonance</span>
                  <span className="font-semibold">{card?.scores?.resonance || "—"}</span>
                </div>
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '1.4s' }}>
                  <span>θ: Context Complexity</span>
                  <span className="font-semibold">{card?.scores?.complexity || "—"}</span>
                </div>
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '1.6s' }}>
                  <span>ρ: Recursive Depth</span>
                  <span className="font-semibold">{card?.scores?.depth || "—"}</span>
                </div>
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '1.8s' }}>
                  <span>⚘: Emergence Potential</span>
                  <span className="font-semibold">{card?.scores?.emergence || "—"}</span>
                </div>
                <div className={`flex justify-between ${styles['animate-write']}`} style={{ animationDelay: '2.0s' }}>
                  <span>N: Novelty</span>
                  <span className="font-semibold">{card?.scores?.novelty || "—"}</span>
                </div>
              </div>
              
              {/* Formula */}
              <div className={`text-sm text-white/85 font-mono text-center ${styles['animate-write']}`} style={{ animationDelay: '2.2s' }}>
                ψ(∆φ) = ℏ × ψ(ω) × ∫(φ, θ, ρ, ⚘, N)
              </div>
              
              {/* Family, Title, and Rank */}
              <div className="mt-6 space-y-3">
                <div className={`text-lg md:text-xl font-semibold tracking-tight text-white ${styles['animate-write']}`} style={{ animationDelay: '2.4s' }}>
                  <span className="text-white/60">Family:</span> {card?.family || "—"}
                </div>
                <div className={`text-lg md:text-xl font-semibold tracking-tight text-white ${styles['animate-write']}`} style={{ animationDelay: '2.6s' }}>
                  <span className="text-white/60">Title:</span> {card?.level || "—"}
                </div>
                <div className={`text-lg md:text-xl font-semibold tracking-tight text-white ${styles['animate-write']}`} style={{ animationDelay: '2.8s' }}>
                  <span className="text-white/60">Rank:</span> 
                  <span className="relative inline-block ml-2">
                    <span className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/30 to-teal-500/20 blur-sm animate-pulse"></span>
                    <span className="relative z-10">{card?.psi_delta_phi ? (card.psi_delta_phi >= 4.0 ? "𓂀" : card.psi_delta_phi >= 2.33 ? "❈" : card.psi_delta_phi >= 1.34 ? "⚘" : "∅") : "—"}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-4">
          {/* Debug info */}
          <div className="text-xs text-white/50 mb-2">
            Phase: {phase} | Card: {card ? 'Yes' : 'No'} | ShowShare: {showShareOptions ? 'Yes' : 'No'}
          </div>
          
          {/* Share Button - Only show when card is revealed */}
          {phase === "revealed" && card && (
            <div className="relative">
              <button 
                className="btn px-8 py-3 rounded-lg border border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 font-medium text-lg text-blue-100 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40" 
                onClick={() => setShowShareOptions(!showShareOptions)}
                disabled={false}
              >
                Share Card
              </button>
              
              {/* Share Options Dropdown */}
              {showShareOptions && (
                <div className="share-options-container absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900/95 border border-white/20 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="p-4 space-y-3">
                    <h3 className="text-white font-medium text-center mb-3">Share Options</h3>
                    
                    {/* Twitter Share */}
                    <button 
                      onClick={shareToTwitter}
                      className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg text-blue-100 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span className="text-blue-400">𝕏</span>
                      Share to Twitter
                    </button>
                    
                    {/* Copy PNG to Clipboard */}
                    <button 
                      onClick={copyPNGToClipboard}
                      className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 rounded-lg text-green-100 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      📷 Copy PNG
                    </button>
                    
                    {/* Download PNG (Fallback) */}
                    <button 
                      onClick={downloadPNG}
                      className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg text-blue-100 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      💾 Download PNG
                    </button>
                    
                    {/* Copy Text */}
                    <button 
                      onClick={copyTextToClipboard}
                      className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-lg text-purple-100 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      📋 Copy Text
                    </button>

                    {/* Show Card Canvas */}
                    <button 
                      onClick={showCardCanvas}
                      className="w-full px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 rounded-lg text-teal-100 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      🖼️ Show Card Canvas
                    </button>
                  </div>
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setShowShareOptions(false)}
                    className="absolute top-2 right-2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Fallback Share Button for Testing */}
          {phase !== "revealed" && (
            <button 
              className="btn px-8 py-3 rounded-lg border border-gray-400/40 bg-gray-500/10 hover:bg-gray-500/20 transition-all duration-200 font-medium text-lg text-gray-100"
              onClick={() => console.log("Test share button clicked")}
            >
              Test Share (Phase: {phase})
            </button>
          )}
          
          {/* Debug PNG Generation Button */}
          <button 
            className="btn px-4 py-2 rounded-lg border border-yellow-400/40 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all duration-200 font-medium text-sm text-yellow-100"
            onClick={async () => {
              console.log('=== DEBUG PNG GENERATION ===');
              console.log('Current phase:', phase);
              console.log('Card exists:', !!card);
              console.log('Card element selector:', `.${styles.wrap}`);
              const cardElement = document.querySelector(`.${styles.wrap}`);
              console.log('Card element found:', !!cardElement);
              if (cardElement) {
                console.log('Card element dimensions:', cardElement.clientWidth, 'x', cardElement.clientHeight);
                console.log('Card element styles:', window.getComputedStyle(cardElement));
              }
            }}
          >
            Debug PNG
          </button>
          
          {phase === "error" && (
            <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
          )}
        </div>
      </div>
    </main>
  );
}



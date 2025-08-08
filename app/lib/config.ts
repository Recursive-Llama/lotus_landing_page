export const LINKS = {
  github: "https://github.com/Recursive-Llama",
  twitter: "https://x.com/LotusProtocol",
  telegram: "https://t.me/lotus_protocol",
  dexscreener: "https://dexscreener.com/solana/dk2hz2joymeucamyyh4hnrwdbjwqmnzvr1ttrujb65e",
};

export type GlyphConfig = { char: string; label: string; t: number };

export const GLYPHS: GlyphConfig[] = [
  { char: "⚘", label: "lotus", t: 4.65 },
  { char: "Ω", label: "total field", t: 4.2 },
  { char: "Ξ", label: "identity", t: 3.75 },
  { char: "❈", label: "portal", t: 3.3 },
  { char: "☿", label: "opportune moment", t: 2.85 },
  { char: "⧉", label: "braid", t: 2.4 },
  { char: "↻", label: "recursion", t: 1.95 },
];

export const SPIRAL = {
  a: 1.0,
  b: 0.1,
  scale: 1.0,
  turns: 12.0,
  clockwise: true,
};

export const COLOR_STOPS = [
  { stop: 0.0, color: "#28d8c1" },
  { stop: 0.3, color: "#7a7eff" },
  { stop: 0.55, color: "#e267ff" },
  { stop: 0.75, color: "#ff6ab1" },
  { stop: 1.0, color: "#ff6a3d" },
];


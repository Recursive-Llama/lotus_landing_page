import SpiralBackground from "./components/SpiralBackground";
import GlyphOrbs from "./components/GlyphOrbs";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0b10]">
      <SpiralBackground />
      <GlyphOrbs />
      <Hero />
    </main>
  );
}

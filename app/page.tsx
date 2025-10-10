import SpiralBackground from "./components/SpiralBackground";
import GlyphOrbs from "./components/GlyphOrbs";
import Hero from "./components/Hero";
import Page2 from "./components/Page2";
import Page3 from "./components/Page3";

export default function Home() {
  return (
    <main className="relative bg-[#0a0b10]">
      {/* Landing Page */}
      <div id="hero" className="relative min-h-screen">
        <SpiralBackground />
        <GlyphOrbs hideGlyphs={false} />
        <Hero />
      </div>
      
      {/* Page 2 */}
      <div id="page2" className="relative min-h-screen">
        <SpiralBackground />
        <GlyphOrbs hideGlyphs={true} />
        <Page2 />
      </div>
      
      {/* Page 3 */}
      <div id="page3" className="relative min-h-screen">
        <GlyphOrbs hideGlyphs={true} />
        <Page3 />
      </div>
    </main>
  );
}

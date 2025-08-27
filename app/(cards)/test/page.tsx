import CardView from "../components/CardView";

export default function TestPage() {
  const testCard = {
    handle: "TestUser",
    image_url: "/kickz.jpg",
    narrative: "This is a test narrative to see how the text wrapping works in the Lore section. It should wrap properly within the container boundaries and maintain good readability.",
    narrative_twitter: "This is a test twitter narrative to see how the text wrapping works in the Lore section. It should wrap properly within the container boundaries and maintain good readability.",
    glyphs: "∫ ℧ ⧚",
    psi_delta_phi: 3.14,
    level: "Test Level"
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">CardView Test - HTML/CSS Version</h1>
        <p className="text-gray-600 mb-8">
          This page tests the new HTML/CSS approach for the glyph bubbles, 
          replicating the landing page style exactly.
        </p>
        
        <div className="flex justify-center">
          <CardView card={testCard} />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">What to Compare:</h2>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Bubble transparency and glass effect</li>
            <li>• Border subtlety and color</li>
            <li>• Glyph rendering quality</li>
            <li>• Overall professional appearance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}



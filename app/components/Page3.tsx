export default function Page3() {
  return (
    <div className="relative z-10 w-full h-full flex flex-col px-6 md:px-10 py-4">
      
      {/* Top Right Text */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10 max-w-[680px] text-white text-right">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Page 3</h1>
        <p className="mt-2 text-sm md:text-base text-white/70">Coming soon...</p>
      </div>
      
      {/* Main Content Area - Empty for now */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-4">
            Page 3 Content
          </h2>
          <p className="text-lg text-white/75">
            Content coming soon...
          </p>
        </div>
      </div>
      
    </div>
  );
}

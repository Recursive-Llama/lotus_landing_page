export default function Page2() {
  return (
    <div className="relative z-10 w-full h-full flex flex-col px-6 md:px-10 py-4">
      
      {/* Top Right Text */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10 max-w-[680px] text-white text-right">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Lotus Trader⚘⟁</h1>
        <p className="mt-2 text-sm md:text-base text-white/70">Your Personal, Recursively↻ Learning Trading Partner.</p>
        
        <p className="mt-4 text-base md:text-lg text-white/90">
          Lotus Trader⚘⟁ The first Specialisation of Lotus⚘.<br />
          ⚘⟁ a chart & chat native trading system, that ↻learns from every interaction ✨
        </p>
      </div>
      
      {/* Top Row - Box 1 on the left, move up a bit */}
              <div className="flex justify-start mt-16">
          <div className="p-6 rounded-lg border border-teal-400/40 bg-white/5 backdrop-blur-sm max-w-sm shadow-[0_0_30px_rgba(20,184,166,0.3)] animate-pulse-teal">
                      <h2 className="text-xl md:text-2xl font-semibold text-white/90 mb-4 text-center">What is Lotus Trader⚘⟁?</h2>
          <p className="text-sm md:text-base text-white/85 mb-3">
            A trading system where charts drive everything. No coding, no manual setup - just visual input that becomes automated execution and lessons for evolution.
          </p>
          <p className="text-sm md:text-base text-white/75">
            This isn't another bot that follows your rules. This is a system that sees what you see, understands it, and learns from every outcome to get better at trading.
          </p>
        </div>
      </div>
      
      {/* Middle Row - Box 2 centered, move down a bit */}
              <div className="flex justify-center -mt-32">
          <div className="p-6 rounded-lg border border-blue-400/40 bg-white/5 backdrop-blur-sm max-w-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse-blue">
                      <h2 className="text-xl md:text-2xl font-semibold text-white/90 mb-4 text-center">What Makes ⚘⟁ Different?</h2>
          <p className="text-sm md:text-base text-white/75 mb-3">
            <span className="text-white/90 font-medium">Traditional systems:</span> You code strategies, they execute them.
          </p>
          <p className="text-sm md:text-base text-white/75 mb-3">
            <span className="text-white/90 font-medium">Lotus Trader:</span> You use natural language and show it charts. It understands them natively, plans execution, and learns from outcomes.
          </p>
          <p className="text-sm md:text-base text-white/75">
            The difference is that charts are the strategy. No translation needed between what you see and what gets executed.
          </p>
        </div>
      </div>
      
      {/* Bottom Row - Box 3 on the right, move down a bit */}
              <div className="flex justify-end -mt-40">
          <div className="p-6 rounded-lg border border-purple-400/40 bg-white/5 backdrop-blur-sm max-w-sm shadow-[0_0_30px_rgba(147,51,234,0.3)] animate-pulse-purple">
                      <h2 className="text-xl md:text-2xl font-semibold text-white/90 mb-4 text-center">Who Can Use ⚘⟁?</h2>
          <p className="text-sm md:text-base text-white/75 mb-3">
            <span className="text-white/90 font-medium">New?</span> Automate strategies from proven traders, learn through execution.
          </p>
          <p className="text-sm md:text-base text-white/75 mb-3">
            <span className="text-white/90 font-medium">Experienced?</span> Scale your strategies across more opportunities, perfect your execution through recursive learning.
          </p>
          <p className="text-sm md:text-base text-white/75">
            <span className="text-white/90 font-medium">Professional?</span> Combine multiple strategies into unified execution, adapt & generate alpha through pattern innovation.
          </p>
        </div>
      </div>
      

      
    </div>
  );
}

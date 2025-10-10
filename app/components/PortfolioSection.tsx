"use client";

// import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolioData } from "../hooks/usePortfolioData";
import NetworkBubbleChart from "./NetworkBubbleChart";
import SpiralBackground from "./SpiralBackground";

export default function PortfolioSection() {
  const router = useRouter();
  const { portfolioData, loading, error } = usePortfolioData();
  // const [hoveredPosition, setHoveredPosition] = useState<{ id: string; token_ticker: string } | null>(null);

  if (loading) {
    return (
      <section id="portfolio" className="relative bg-[#0a0b10] min-h-screen">
        <SpiralBackground />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-center h-96">
            <div className="text-white/50">Loading portfolio...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !portfolioData) {
    return (
      <section id="portfolio" className="relative bg-[#0a0b10] min-h-screen">
        <SpiralBackground />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-center h-96">
            <div className="text-white/50">Error loading portfolio data</div>
          </div>
        </div>
      </section>
    );
  }

  // Debug logging
  console.log('PortfolioSection - portfolioData:', portfolioData);
  console.log('PortfolioSection - lotusAmount:', portfolioData.summary.lotusAmount);
  console.log('PortfolioSection - lotusAcquired:', portfolioData.summary.lotusAcquired);

  return (
    <section id="portfolio" className="relative bg-[#0a0b10] min-h-screen">
      <SpiralBackground />
      <div className="container mx-auto px-6 pt-16 pb-0 relative z-10">
        <div className="flex gap-8">
          {/* Left Side - Portfolio Metrics */}
          <div className="w-80 flex-shrink-0">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
              Portfolio⚘⟁
            </h2>

            {/* Portfolio Metrics */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  ${portfolioData.summary.portfolioValue?.toFixed(0) || '0'}
                </div>
                <div className="text-sm text-white/70">Portfolio Value</div>
              </div>
              
              <button
                onClick={() => router.push('/portfolio/performance')}
                className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left hover:shadow-lg hover:shadow-cyan-500/30"
              >
                <div className={`text-2xl font-bold mb-1 ${
                  (portfolioData.summary.portfolioPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(portfolioData.summary.portfolioPnL || 0) >= 0 ? '+' : ''}${(portfolioData.summary.portfolioPnL || 0).toFixed(0)}
                </div>
                <div className="text-sm text-white/70">Portfolio PnL</div>
              </button>
              
              <button
                onClick={() => router.push('/portfolio/performance')}
                className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left hover:shadow-lg hover:shadow-cyan-500/30"
              >
                <div className={`text-2xl font-bold mb-1 ${
                  (portfolioData.summary.portfolioPnLPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(portfolioData.summary.portfolioPnLPercent || 0) >= 0 ? '+' : ''}{(portfolioData.summary.portfolioPnLPercent || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">Portfolio PnL %</div>
              </button>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {(portfolioData.summary.percentDeployed || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">% Deployed</div>
              </div>
              
              <div 
                className="p-4 rounded-xl border border-white/20 bg-white/5"
                style={{
                  animation: 'pulse 3s ease-in-out infinite',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                }}
              >
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolioData.summary.lotusAmount?.toFixed(3) || '0.000'}/1618.033 ⚘❈
                </div>
                <div className="text-sm text-white/70">Lotus Acquired</div>
              </div>
            </div>
          </div>

          {/* Right Side - Network Bubbles */}
          <div className="flex-1">
            <NetworkBubbleChart 
              positions={portfolioData.positions}
              closedPositions={portfolioData.closedPositions || []}
              nativeBalances={portfolioData.summary.nativeBalances || []}
              portfolioValue={portfolioData.summary.portfolioValue || 0}
              closedPnL={portfolioData.summary.closedPnL || 0}
              totalPnLWithClosed={portfolioData.summary.totalPnLWithClosed || 0}
              onHover={() => {}}
              mode="network"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

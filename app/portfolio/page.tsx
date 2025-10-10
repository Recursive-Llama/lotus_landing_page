"use client";

import { useState } from "react";
import { usePortfolioData } from "../hooks/usePortfolioData";
import NetworkBubbleChart from "../components/NetworkBubbleChart";
import SpiralBackground from "../components/SpiralBackground";
import type { PortfolioPosition } from "../api/portfolio/route";

export default function PortfolioBubblesPage() {
  const { portfolioData, loading, error } = usePortfolioData();
  const [hoveredPosition, setHoveredPosition] = useState<PortfolioPosition | null>(null);

  if (loading) {
    return (
      <main className="relative bg-[#0a0b10] min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-white/50">Loading portfolio...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !portfolioData) {
    return (
      <main className="relative bg-[#0a0b10] min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-red-400">Portfolio Unavailable</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative bg-[#0a0b10] min-h-screen">
      <SpiralBackground />
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex gap-8">
          {/* Left Side - Title and Summary Cards */}
          <div className="w-80 flex-shrink-0">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-8">
              Portfolio⚘⟁
            </h1>

            {/* Summary Cards - Vertical */}
            <div className="space-y-4">
              {/* New Portfolio-level metrics */}
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  ${portfolioData.summary.portfolioValue.toFixed(0)}
                </div>
                <div className="text-sm text-white/70">Portfolio Value</div>
              </div>
              
              <button 
                onClick={() => window.location.href = '/portfolio/performance'}
                className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left hover:shadow-lg hover:shadow-cyan-500/30"
              >
                <div className={`text-2xl font-bold mb-1 ${
                  portfolioData.summary.portfolioPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolioData.summary.portfolioPnL >= 0 ? '+' : ''}${portfolioData.summary.portfolioPnL.toFixed(0)}
                </div>
                <div className="text-sm text-white/70">Portfolio PnL</div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/portfolio/performance'}
                className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left hover:shadow-lg hover:shadow-cyan-500/30"
              >
                <div className={`text-2xl font-bold mb-1 ${
                  portfolioData.summary.portfolioPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolioData.summary.portfolioPnLPercent >= 0 ? '+' : ''}{portfolioData.summary.portfolioPnLPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">Portfolio PnL %</div>
              </button>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolioData.summary.positionCount}
                </div>
                <div className="text-sm text-white/70">Positions</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolioData.summary.percentDeployed.toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">% Deployed</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5" style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)',
                animation: 'pulse 3s ease-in-out infinite'
              }}>
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolioData.summary.lotusAmount?.toFixed(3) || '0.000'}/1618.033 ⚘❈
                </div>
                <div className="text-sm text-white/70">Lotus Acquired (${portfolioData.summary.lotusAcquired.toFixed(0)})</div>
              </div>
            </div>
          </div>

          {/* Right Side - Bubble Chart */}
          <div className="flex-1">
            <NetworkBubbleChart 
              positions={portfolioData.positions}
              closedPositions={portfolioData.closedPositions || []}
              nativeBalances={portfolioData.summary.nativeBalances || []}
              portfolioValue={portfolioData.summary.portfolioValue}
              closedPnL={portfolioData.summary.closedPnL}
              totalPnLWithClosed={portfolioData.summary.totalPnLWithClosed}
              onHover={setHoveredPosition}
            />
          </div>
        </div>

        {/* Positions needing attention alert */}
        {portfolioData.positions.some(pos => pos.status === 'needs_attention') && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Some positions need attention
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-8 mb-6">
          <p className="text-white/70 text-lg mb-2">
            Your trading positions by network
          </p>
          <p className="text-white/50 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center space-x-4">
          <a
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            📊 Pie Chart View
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
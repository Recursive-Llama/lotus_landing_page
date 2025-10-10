"use client";

import { useState } from "react";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import NetworkBubbleChart from "../../components/NetworkBubbleChart";
import SpiralBackground from "../../components/SpiralBackground";

export default function PastPerformancePage() {
  const { portfolioData, loading, error } = usePortfolioData();
  const [hoveredPosition, setHoveredPosition] = useState<any>(null);

  if (loading) {
    return (
      <main className="relative bg-[#0a0b10] min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-white/50">Loading performance data...</div>
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
            <div className="text-red-500">Error loading performance data: {error}</div>
          </div>
        </div>
      </main>
    );
  }

  const closedPositions = portfolioData.closedPositions || [];
  
  // Sort closed positions by PnL% magnitude (biggest absolute PnL% first - wins and losses)
  const sortedClosedPositions = [...closedPositions].sort((a, b) => Math.abs(b.total_pnl_pct || 0) - Math.abs(a.total_pnl_pct || 0));
  
  // Take top 6 biggest moves (no "Others" bubble)
  const performancePositions = sortedClosedPositions.slice(0, 6);

  // Calculate total value for percentage calculations
  const totalValue = performancePositions.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);

  return (
    <main className="relative bg-[#0a0b10] min-h-screen">
      <SpiralBackground />
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex gap-8">
          {/* Left Side - Performance Metrics */}
          <div className="w-80 flex-shrink-0">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-8">
              Past Performance⚘⟁
            </h1>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  ${portfolioData.summary.closedPnL?.toFixed(0) || '0'}
                </div>
                <div className="text-sm text-white/70">Total Closed PnL</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {closedPositions.length}
                </div>
                <div className="text-sm text-white/70">Closed Positions</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {closedPositions.length > 0 ? 
                    ((closedPositions.filter(pos => (pos.total_pnl_usd || 0) > 0).length / closedPositions.length) * 100).toFixed(1) + '%' : 
                    '0%'
                  }
                </div>
                <div className="text-sm text-white/70">Win Rate</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className={`text-2xl font-bold mb-1 ${
                  (sortedClosedPositions[0]?.total_pnl_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {sortedClosedPositions.length > 0 ? 
                    `${(sortedClosedPositions[0].total_pnl_pct || 0) >= 0 ? '+' : ''}${(sortedClosedPositions[0].total_pnl_pct || 0).toFixed(1)}%` : 
                    '0%'
                  }
                </div>
                <div className="text-sm text-white/70">Biggest Move</div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => window.history.back()}
                className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-white"
              >
                <div className="text-2xl font-bold mb-1">←</div>
                <div className="text-sm text-white/70">Back to Portfolio</div>
              </button>
            </div>
          </div>

          {/* Right Side - Performance Bubbles */}
          <div className="flex-1">
            <NetworkBubbleChart 
              positions={performancePositions}
              closedPositions={[]} // No need for closed positions here since we're showing them
              nativeBalances={[]} // No native balances for past performance
              portfolioValue={totalValue}
              onHover={setHoveredPosition}
              mode="position" // Use position mode to show individual closed positions
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 mb-6">
          <p className="text-white/70 text-lg mb-2">
            Biggest moves from closed positions
          </p>
          <p className="text-white/50 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Hover Details */}
        {hoveredPosition && (
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Position Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-white/70">Token</div>
                <div className="text-white font-medium">{hoveredPosition.token_ticker}</div>
              </div>
              <div>
                <div className="text-white/70">Chain</div>
                <div className="text-white font-medium">{hoveredPosition.token_chain}</div>
              </div>
              <div>
                <div className="text-white/70">PnL</div>
                <div className={`font-medium ${(hoveredPosition.total_pnl_usd || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(hoveredPosition.total_pnl_usd || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-white/70">PnL %</div>
                <div className={`font-medium ${(hoveredPosition.total_pnl_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(hoveredPosition.total_pnl_pct || 0) >= 0 ? '+' : ''}{(hoveredPosition.total_pnl_pct || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

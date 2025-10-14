"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import NetworkBubbleChart from "../../components/NetworkBubbleChart";
import SpiralBackground from "../../components/SpiralBackground";
import type { PortfolioPosition } from "../../api/portfolio/route";

export default function NetworkFocusedPage() {
  const params = useParams();
  const router = useRouter();
  const network = params.network as string;
  const { portfolioData, loading, error } = usePortfolioData();
  const [hoveredPosition, setHoveredPosition] = useState<PortfolioPosition | null>(null);

  if (loading) {
    return (
      <main className="relative bg-[#0a0b10] min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-white/50">Loading network data...</div>
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
            <div className="text-white/50">Error loading data</div>
          </div>
        </div>
      </main>
    );
  }

  // Filter positions for this network
  const networkPositions = portfolioData.positions.filter(pos => pos.token_chain === network);
  const networkNativeBalance = portfolioData.summary.nativeBalances?.find(bal => bal.chain === network);
  
  // Calculate network-specific metrics
  const networkTokenValue = networkPositions.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);
  const networkNativeValue = networkNativeBalance?.balance_usd || 0;
  const networkTotalValue = networkTokenValue + networkNativeValue;
  const networkTokenPnL = networkPositions.reduce((sum, pos) => sum + (pos.total_pnl_usd || 0), 0);
  const networkTokenPnLPercent = networkTokenValue > 0 ? (networkTokenPnL / networkTokenValue) * 100 : 0;
  const networkShare = portfolioData.summary.portfolioValue > 0 ? (networkTotalValue / portfolioData.summary.portfolioValue) * 100 : 0;
  const networkDeployedPercent = networkTotalValue > 0 ? (networkTokenValue / networkTotalValue) * 100 : 0;

  // Get top 5 positions and others
  const sortedPositions = [...networkPositions].sort((a, b) => (b.current_invested_usd || 0) - (a.current_invested_usd || 0));
  const top5Positions = sortedPositions.slice(0, 5);
  const otherPositions = sortedPositions.slice(5);
  
  // Calculate "Others" metrics
  const othersValue = otherPositions.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);
  const othersPnL = otherPositions.reduce((sum, pos) => sum + (pos.total_pnl_usd || 0), 0);
  const othersPnLPercent = othersValue > 0 ? (othersPnL / othersValue) * 100 : 0;
  const othersShare = networkTotalValue > 0 ? (othersValue / networkTotalValue) * 100 : 0;

  // Create "Others" position object
  const othersPosition: PortfolioPosition = {
    id: `others_${network}`,
    token_ticker: "Others",
    token_chain: network,
    total_investment_native: 0,
    current_invested_usd: othersValue,
    total_pnl_usd: othersPnL,
    total_pnl_pct: othersPnLPercent,
    total_quantity: otherPositions.length, // Count of remaining tokens
    avg_entry_price: 0,
    curator_sources: "",
    total_allocation_pct: 0,
    first_entry_timestamp: "",
    status: "active",
    entries: [],
    exits: []
  };

  // Combine top 5 + others for display
  const displayPositions = [...top5Positions];
  if (otherPositions.length > 0) {
    displayPositions.push(othersPosition);
  }

  const nativeTokenSymbols = {
    solana: 'SOL',
    ethereum: 'ETH',
    bsc: 'BNB',
    base: 'ETH'
  };

  const nativePrices = portfolioData.summary.nativePrices || {};
  const price = nativePrices[network] || 0;
  const nativeSymbol = nativeTokenSymbols[network as keyof typeof nativeTokenSymbols] || 'TOKEN';
  const nativeAmount = price > 0 ? networkNativeValue / price : 0;

  return (
    <main className="relative bg-[#0a0b10] min-h-screen">
      <SpiralBackground />
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex gap-8">
          {/* Left Side - Network-Specific Metrics */}
          <div className="w-80 flex-shrink-0">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-8">
              {network.toUpperCase()}⚘⟁
            </h1>

            {/* Network-Specific Metrics */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  ${networkTotalValue.toFixed(0)}
                </div>
                <div className="text-sm text-white/70">Network Value</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className={`text-2xl font-bold mb-1 ${
                  networkTokenPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {networkTokenPnL >= 0 ? '+' : ''}${networkTokenPnL.toFixed(0)}
                </div>
                <div className="text-sm text-white/70">Network PnL</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className={`text-2xl font-bold mb-1 ${
                  networkTokenPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {networkTokenPnLPercent >= 0 ? '+' : ''}{networkTokenPnLPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">Network PnL %</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {networkPositions.length}
                </div>
                <div className="text-sm text-white/70">Positions</div>
              </div>
              
              <div className="p-4 rounded-xl border border-white/20 bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  {networkDeployedPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">% Deployed</div>
              </div>
              

              {/* Back Button */}
              <button
                onClick={() => router.push('/portfolio')}
                className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-white"
              >
                <div className="text-2xl font-bold mb-1">←</div>
                <div className="text-sm text-white/70">Back to Portfolio</div>
              </button>
            </div>
          </div>

          {/* Right Side - Position Bubbles */}
          <div className="flex-1">
            <NetworkBubbleChart 
              positions={displayPositions}
              nativePrices={portfolioData.summary.nativePrices || {}}
              onHover={setHoveredPosition}
              mode="position"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 mb-6">
          <p className="text-white/70 text-lg mb-2">
            {network.toUpperCase()} positions by size
          </p>
          <p className="text-white/50 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </main>
  );
}

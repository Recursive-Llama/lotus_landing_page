"use client";

import { useMemo, useState } from "react";
import type { PortfolioPosition } from "../api/portfolio/route";

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  return "0, 0, 0";
}

interface NetworkBubbleChartProps {
  positions: PortfolioPosition[];
  closedPositions?: PortfolioPosition[];
  nativeBalances?: Array<{ chain: string; balance_usd: number }>;
  portfolioValue?: number;
  onNetworkClick?: (network: string) => void;
  onHover?: (position: PortfolioPosition | null) => void;
  network?: string;
  closedPnL?: number; // Total PnL from closed positions
  totalPnLWithClosed?: number; // Active PnL + Closed PnL
  mode?: 'network' | 'position' | 'performance'; // New prop to distinguish display mode
  nativePrices?: Record<string, number>;
}

export default function NetworkBubbleChart({ positions, closedPositions = [], nativeBalances = [], portfolioValue = 0, onNetworkClick, onHover, mode = 'network', nativePrices = {} }: NetworkBubbleChartProps) {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);

  const networkData = useMemo(() => {
    if (positions.length === 0 && nativeBalances.length === 0) return [];
    
    if (mode === 'position') {
      // Position mode - treat each position as a separate bubble
      const totalValue = positions.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);
      
      return positions.map((position) => ({
        network: position.token_ticker, // Use position name instead of network
        tokenValue: position.current_invested_usd || 0,
        pnl: position.total_pnl_usd || 0,
        positionCount: position.total_quantity || 0, // Use actual quantity instead of 1
        positions: [position],
        nativeValue: 0, // No native value for individual positions
        totalValue: position.current_invested_usd || 0,
        percentage: totalValue > 0 ? ((position.current_invested_usd || 0) / totalValue) * 100 : 0,
        pnlPercent: position.total_pnl_pct || 0
      }));
    } else if (mode === 'performance') {
      // Performance mode - treat each closed position as a separate bubble, sized by PnL%
      const totalValue = positions.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);
      
      return positions.map((position) => ({
        network: position.token_ticker, // Use position name instead of network
        tokenValue: position.current_invested_usd || 0,
        pnl: position.total_pnl_usd || 0,
        positionCount: position.total_quantity || 0,
        positions: [position],
        nativeValue: 0, // No native value for individual positions
        totalValue: position.current_invested_usd || 0,
        percentage: totalValue > 0 ? ((position.current_invested_usd || 0) / totalValue) * 100 : 0,
        pnlPercent: position.total_pnl_pct || 0
      }));
    } else {
      // Network mode - group positions by network and calculate totals
    const networkTotals = positions.reduce((acc, position) => {
      const network = position.token_chain;
      if (!acc[network]) {
        acc[network] = {
          network,
            tokenValue: 0,
          pnl: 0,
          positionCount: 0,
            positions: [],
            nativeValue: 0
        };
      }
        acc[network].tokenValue += position.current_invested_usd || 0;
      acc[network].pnl += position.total_pnl_usd || 0;
      acc[network].positionCount += 1;
      acc[network].positions.push(position);
      return acc;
      }, {} as Record<string, { network: string; tokenValue: number; nativeValue: number; pnl: number; positionCount: number; positions: PortfolioPosition[] }>);

      // Add native balances to each network
      nativeBalances.forEach(balance => {
        if (balance.chain !== 'lotus') { // Exclude Lotus from portfolio calculation
          if (!networkTotals[balance.chain]) {
            networkTotals[balance.chain] = {
              network: balance.chain,
              tokenValue: 0,
              pnl: 0,
              positionCount: 0,
              positions: [],
              nativeValue: 0
            };
          }
          networkTotals[balance.chain].nativeValue += balance.balance_usd || 0;
        }
      });

      // Add mock "coming soon" networks
      const mockNetworks = [
        {
          network: 'hyperliquid',
          tokenValue: 0,
          pnl: 0,
          positionCount: 0,
          positions: [],
          nativeValue: 0,
          isComingSoon: true
        },
        {
          network: 'polymarket',
          tokenValue: 0,
          pnl: 0,
          positionCount: 0,
          positions: [],
          nativeValue: 0,
          isComingSoon: true
        }
      ];

      mockNetworks.forEach(mockNet => {
        networkTotals[mockNet.network] = mockNet;
      });

    // Convert to array and calculate percentages
      return Object.values(networkTotals).map((net: { network: string; tokenValue: number; nativeValue: number; pnl: number; positionCount: number; positions: PortfolioPosition[]; isComingSoon?: boolean }) => {
        const totalValue = net.tokenValue + net.nativeValue;
        return {
          ...net,
          totalValue,
          percentage: portfolioValue > 0 ? (totalValue / portfolioValue) * 100 : 0,
          pnlPercent: net.tokenValue > 0 ? (net.pnl / net.tokenValue) * 100 : 0,
          // Calculate Total PnL (Active + Closed) for this network
          totalPnlPercent: (() => {
            const networkClosedPositions = closedPositions.filter(pos => pos.token_chain === net.network);
            const networkClosedPnL = networkClosedPositions.reduce((sum, pos) => sum + (pos.total_pnl_usd || 0), 0);
            
            // Calculate total investment in USD from executed entries
            const networkClosedInvestment = networkClosedPositions.reduce((sum, pos) => {
              const executedEntries = pos.entries?.filter(entry => entry.status === 'executed') || [];
              const entryInvestment = executedEntries.reduce((entrySum, entry) => entrySum + ((entry as { cost_usd?: number }).cost_usd || 0), 0);
              return sum + entryInvestment;
            }, 0);
            
            const totalNetworkPnL = net.pnl + networkClosedPnL;
            const totalNetworkInvestment = net.tokenValue + networkClosedInvestment;
            
            // Debug logging for Solana
            if (net.network === 'solana') {
              console.log('Solana Total PnL Debug:', {
                network: net.network,
                activePnL: net.pnl,
                activeInvestment: net.tokenValue,
                closedPositions: networkClosedPositions.length,
                networkClosedPnL,
                networkClosedInvestment,
                totalNetworkPnL,
                totalNetworkInvestment,
                totalPnlPercent: totalNetworkInvestment > 0 ? (totalNetworkPnL / totalNetworkInvestment) * 100 : 0
              });
            }
            
            return totalNetworkInvestment > 0 ? (totalNetworkPnL / totalNetworkInvestment) * 100 : 0;
          })()
        };
      }).filter(net => net.totalValue > 0 || net.isComingSoon); // Show networks with value or coming soon
    }
  }, [positions, closedPositions, nativeBalances, portfolioValue, mode]);

  const networkColors = {
    solana: '#e267ff',
    ethereum: '#7a7eff', 
    bsc: '#ffd700',
    base: '#28d8c1',
    hyperliquid: '#4ade80', // Green
    polymarket: '#06b6d4'  // Cyan
  };

  // Get network color for a position
  const getNetworkColor = (position: { token_chain: string }) => {
    const chain = position.token_chain?.toLowerCase();
    return networkColors[chain as keyof typeof networkColors] || '#ffffff';
  };

  // Position colors for individual tokens (unused but kept for future use)
  // const positionColors = [
  //   '#e267ff', // Purple
  //   '#7a7eff', // Blue
  //   '#ff6a3d', // Orange
  //   '#28d8c1', // Teal
  //   '#ff6ab1', // Pink
  //   '#4ade80', // Green
  //   '#f59e0b', // Amber
  //   '#ef4444', // Red
  //   '#8b5cf6', // Violet
  //   '#06b6d4'  // Cyan
  // ];

  const nativeTokenSymbols = {
    solana: 'SOL',
    ethereum: 'ETH',
    bsc: 'BNB',
    base: 'ETH' // Base uses ETH as native token
  };

  const formatNumber = (value: number, decimals = 2) =>
    Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const formatUsdCompact = (usd: number) => {
    const abs = Math.abs(usd || 0);
    if (abs >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `$${(usd / 1_000).toFixed(2)}k`;
    return `$${(usd).toFixed(2)}`;
  };

  const variedPositionColors = ['#e267ff', '#7a7eff', '#28d8c1', '#ff6ab1', '#4ade80', '#8b5cf6', '#06b6d4', '#14b8a6', '#3b82f6', '#a855f7'];
  const getVariedColorForTicker = (ticker: string) => {
    let hash = 0;
    for (let i = 0; i < ticker.length; i++) hash = (hash * 31 + ticker.charCodeAt(i)) >>> 0;
    return variedPositionColors[hash % variedPositionColors.length];
  };

  // Smart positioning - different logic for network vs position mode
  const getBubblePositions = (networkData: Array<{ network: string; totalValue: number; percentage: number; positionCount: number; pnlPercent: number; totalPnlPercent?: number; tokenValue: number; nativeValue: number; pnl: number; positions: PortfolioPosition[]; isComingSoon?: boolean }>) => {
    const centerX = 400;
    const centerY = 300;
    const positions: { x: number; y: number }[] = [];
    
    // Sort by size (largest first)
    const sortedData = [...networkData].sort((a, b) => {
      if (mode === 'performance') {
        // For performance mode, sort by PnL percentage magnitude (biggest moves first)
        return Math.abs(b.pnlPercent || 0) - Math.abs(a.pnlPercent || 0);
      } else if (mode === 'position') {
        // For position mode, sort by value/amount (percentage), not PnL
        return b.percentage - a.percentage;
      } else {
        // For network mode, sort by portfolio percentage
        return b.percentage - a.percentage;
      }
    });
    
    if (mode === 'position' || mode === 'performance') {
      // Position mode and Performance mode - simple circle layout
      const bubbleAreaCenterX = 450; // Center of bubble area
      const bubbleAreaCenterY = 350;
      const spacing = 33; // Spacing between bubbles
      
      // Find largest bubble (already sorted, so index 0)
      const largestBubble = sortedData[0];
      const largestSize = getBubbleSize(largestBubble.percentage, largestBubble.pnlPercent);
      const largestRadius = largestSize / 2;
    
    for (let i = 0; i < sortedData.length; i++) {
      const segment = sortedData[i];
        const size = getBubbleSize(segment.percentage, segment.pnlPercent);
      const radius = size / 2;
      
        let position;
        
        if (segment === largestBubble) {
          // Largest bubble at center
          position = { x: bubbleAreaCenterX, y: bubbleAreaCenterY };
        } else {
          // Put others in a simple circle around the center
          const angle = (i * 2 * Math.PI) / (sortedData.length - 1);
          const circleRadius = largestRadius + radius + spacing;
          
          position = {
            x: bubbleAreaCenterX + Math.cos(angle) * circleRadius,
            y: bubbleAreaCenterY + Math.sin(angle) * circleRadius
          };
        }
        
        positions.push(position);
      }
    } else {
      // Network mode - use same approach as position mode (largest in center, others around)
      const spacing = 50; // Spacing between bubbles
      
      // Find largest bubble (already sorted by percentage, so index 0)
      const largestBubble = sortedData[0];
      const largestSize = getBubbleSize(largestBubble.percentage, largestBubble.pnlPercent);
      const largestRadius = largestSize / 2;
      
      for (let i = 0; i < sortedData.length; i++) {
        const segment = sortedData[i];
        const size = getBubbleSize(segment.percentage, segment.pnlPercent);
        const radius = size / 2;
        
        let position;
        
        if (segment === largestBubble) {
          // Largest bubble at center
          position = { x: centerX, y: centerY };
        } else {
          // Put others in a circle around the center
          const angle = ((i - 1) * 2 * Math.PI) / (sortedData.length - 1);
          const circleRadius = largestRadius + radius + spacing;
          
        position = {
            x: centerX + Math.cos(angle) * circleRadius,
            y: centerY + Math.sin(angle) * circleRadius
        };
      }
      
      positions.push(position);
      }
    }
    
    return positions;
  };

  const getBubbleSize = (percentage: number, pnlPercent?: number) => {
    if (mode === 'position') {
      // For position mode, size based on value/amount (percentage), not PnL
      const sizeValue = percentage;
      
      // 15% bigger bubbles for position mode
      const minSize = 184; // 160 * 1.15
      const maxSize = 322; // 280 * 1.15
      
      // Scale based on the maximum percentage in the dataset for better distribution
      const maxValue = Math.max(...networkData.map(segment => segment.percentage));
      
      const normalizedValue = maxValue > 0 ? (sizeValue / maxValue) * 100 : 0;
      const size = minSize + (normalizedValue / 100) * (maxSize - minSize);
      return Math.max(minSize, Math.min(maxSize, size));
    } else if (mode === 'performance') {
      // For performance mode, size based on PnL percentage magnitude (biggest moves)
      const sizeValue = Math.abs(pnlPercent || 0);
      
      const minSize = 120; // Increased from 80
      const maxSize = 250; // Increased from 200
      
      // Scale based on the maximum PnL percentage magnitude in the dataset
      const maxValue = Math.max(...networkData.map(segment => Math.abs(segment.pnlPercent || 0)));
      
      const normalizedValue = maxValue > 0 ? (sizeValue / maxValue) * 100 : 0;
      const size = minSize + (normalizedValue / 100) * (maxSize - minSize);
      return Math.max(minSize, Math.min(maxSize, size));
    } else {
      // Network mode bubbles
    const minSize = 200;
      const maxSize = 450;
    const size = minSize + (percentage / 100) * (maxSize - minSize);
    return Math.max(minSize, Math.min(maxSize, size));
    }
  };

  const handleBubbleClick = (networkData: { network: string; isComingSoon?: boolean }) => {
    // Don't navigate for coming soon networks
    if (networkData.isComingSoon) {
      return;
    }
    
    if (onNetworkClick) {
      onNetworkClick(networkData.network);
    } else {
      // Default navigation to network-focused page
      window.location.href = `/portfolio/${networkData.network}`;
    }
  };

  const handleBubbleHover = (networkData: { network: string; positions?: PortfolioPosition[] }) => {
    setHoveredBubble(networkData.network);
    if (onHover && networkData.positions && networkData.positions.length > 0) {
      onHover(networkData.positions[0]); // Show first position as example
    }
  };

  const handleBubbleLeave = () => {
    setHoveredBubble(null);
    if (onHover) {
      onHover(null);
    }
  };

  if (networkData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white/50">No data available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Bubble Chart Container */}
      <div className="relative w-[800px] h-[800px] mb-8">
        {(() => {
          const positions = getBubblePositions(networkData);
          return networkData.map((segment, index) => {
            const color = (() => {
              if (mode === 'performance') {
                return getNetworkColor(segment.positions?.[0] || segment);
              }
              if (mode === 'position') {
                const ticker = segment.positions?.[0]?.token_ticker || segment.network;
                return getVariedColorForTicker(ticker);
              }
              return networkColors[segment.network.toLowerCase() as keyof typeof networkColors] || '#ffffff';
            })();
            const rgb = hexToRgb(color);
            const size = getBubbleSize(segment.percentage, segment.pnlPercent);
            const position = positions[index];
            const isHovered = hoveredBubble === segment.network;
          
          return (
            <div
              key={segment.network}
              className={`absolute rounded-full ${mode === 'network' ? 'cursor-pointer' : 'cursor-default'} transition-all duration-500 flex items-center justify-center`}
              style={{
                left: position.x - size / 2,
                top: position.y - size / 2,
                width: size,
                height: size,
                border: `1px solid ${color}`,
                backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isHovered 
                  ? `0 0 50px rgba(${rgb}, 0.8), inset 0 0 30px rgba(${rgb}, 0.3)` 
                  : `0 0 30px rgba(${rgb}, 0.5), inset 0 0 15px rgba(${rgb}, 0.2)`,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                backdropFilter: 'blur(10px)',
                zIndex: isHovered ? 10 : 1
              }}
              onMouseEnter={() => handleBubbleHover(segment)}
              onMouseLeave={handleBubbleLeave}
              onClick={() => {
                if (mode !== 'network') return; // Disable click for non-network modes
                handleBubbleClick(segment);
              }}
            >
              {/* Bubble content - different for network vs position mode */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white space-y-1">
                {mode === 'network' ? (
                  // Network mode - show network info
                  <>
                <div className="text-xl font-bold">{segment.network.toUpperCase()}</div>
                    {(segment as { isComingSoon?: boolean }).isComingSoon ? (
                      <>
                        <div className="text-sm font-semibold text-white/90">Coming Soon</div>
                        <div className="text-xs font-medium text-white/60">
                          Integration in progress
                        </div>
                      </>
                    ) : (
                      <>
                <div className="text-sm font-semibold text-white/90">{segment.percentage.toFixed(1)}% Share</div>
                        <div className="text-xs font-medium text-white/80">
                          {(() => {
                            const chain = segment.network.toLowerCase();
                            const nativeSymbol = nativeTokenSymbols[chain as keyof typeof nativeTokenSymbols] || 'TOKEN';
                            const price = nativePrices[chain] || 0;
                            const tokenAmount = price > 0 ? segment.totalValue / price : 0;
                            return `${formatUsdCompact(segment.totalValue)} (${tokenAmount.toFixed(2)} ${nativeSymbol})`;
                          })()}
                        </div>
                        <div className="text-xs font-medium text-white/80">
                          {formatNumber(segment.positionCount)} Tokens: {formatUsdCompact(segment.tokenValue)}
                        </div>
                        <div className={`text-sm font-semibold ${segment.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {segment.pnlPercent >= 0 ? '+' : ''}{segment.pnlPercent.toFixed(1)}% Active PnL
                        </div>
                        <div className={`text-sm font-semibold ${(segment as { totalPnlPercent?: number }).totalPnlPercent && (segment as { totalPnlPercent?: number }).totalPnlPercent! >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(segment as { totalPnlPercent?: number }).totalPnlPercent && (segment as { totalPnlPercent?: number }).totalPnlPercent! >= 0 ? '+' : ''}{(segment as { totalPnlPercent?: number }).totalPnlPercent?.toFixed(1) || '0.0'}% Total PnL
                        </div>
                      </>
                    )}
                  </>
                ) : mode === 'performance' ? (
                  // Performance mode - show percentage and $ profit
                  <>
                    <div className="text-xl font-bold">{segment.network.toUpperCase()}</div>
                    <div className={`text-lg font-semibold ${segment.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {segment.pnlPercent >= 0 ? '+' : ''}{segment.pnlPercent.toFixed(1)}%
                    </div>
                    <div className="text-xs font-medium text-white/80">
                      {(() => {
                        const chain = segment.positions?.[0]?.token_chain?.toLowerCase() || '';
                        const usdPnl = segment.positions?.[0]?.total_pnl_usd || 0;
                        const nativePnl = segment.positions?.[0]?.total_pnl_native || 0;
                        const sign = usdPnl >= 0 ? '+' : '';
                        const symbol = nativeTokenSymbols[chain as keyof typeof nativeTokenSymbols] || '';
                        return `${sign}${formatNumber(Math.abs(nativePnl), 2)} ${symbol} (${sign}${formatUsdCompact(Math.abs(usdPnl))})`;
                      })()}
                    </div>
                  </>
                ) : (
                  // Position mode - show detailed position info
                  <>
                    <div className="text-xl font-bold">{segment.network.toUpperCase()}</div>
                    <div className="text-sm font-medium text-white/90">
                      {formatNumber(segment.positionCount)} Tokens: {formatUsdCompact(segment.tokenValue)}
                    </div>
                    <div className="text-xs font-medium text-white/80">
                      {(() => {
                        const chain = (segment.positions?.[0]?.token_chain || '').toLowerCase();
                        const nativeSymbol = nativeTokenSymbols[chain as keyof typeof nativeTokenSymbols] || 'TOKEN';
                        const price = nativePrices[chain] || 0;
                        const tokenAmount = price > 0 ? segment.totalValue / price : 0;
                        return `${formatNumber(tokenAmount, 2)} ${nativeSymbol}`;
                      })()}
                </div>
                <div className={`text-sm font-semibold ${segment.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {segment.pnlPercent >= 0 ? '+' : ''}{segment.pnlPercent.toFixed(1)}% PnL
                </div>
                  </>
                )}
              </div>
            </div>
          );
        });
        })()}
      </div>

    </div>
  );
}

import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uanwkcczaakybpljxmym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbndrY2N6YWFreWJwbGp4bXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTQ0NiwiZXhwIjoyMDcxNTQ1NDQ2fQ.T7J9kKZKK82kJpqhFeW2ueSHCqhzuem8bPFO_IcKc_A';

const supabase = createClient(supabaseUrl, supabaseKey);

export type PortfolioPosition = {
  id: string;
  token_ticker: string;
  token_chain: string;
  total_allocation_pct: number;
  total_investment_native: number;
  current_invested_usd: number; // Calculated from price data
  total_pnl_usd: number;
  total_pnl_pct: number;
  total_quantity: number;
  avg_entry_price: number;
  curator_sources: string;
  first_entry_timestamp: string;
  status: string;
  source_tweet_url?: string;
  // Optional planning data if present in the row
  entries?: Array<{ price: number; status: string }>;
  exits?: Array<{ price: number; status: string }>;
  nearestEntry?: {
    price: number;
    percentDiff: number;
  };
  nearestExit?: {
    price: number;
    percentDiff: number;
  };
};

export type PortfolioSummary = {
  // New portfolio-level metrics (including native token balances)
  portfolioValue: number; // Token Value + Native Token Balances
  portfolioPnL: number; // Portfolio PnL based on $2000 starting value
  portfolioPnLPercent: number; // Portfolio PnL percentage
  
  // Existing token-level metrics
  totalValue: number; // Token Value only
  totalPnL: number; // Token PnL only
  totalPnLPercent: number; // Token PnL percentage
  positionCount: number; // Number of positions
  
  // New requested metrics
  percentDeployed: number; // (Token Value / Portfolio Value) * 100
  lotusAcquired: number; // Lotus balance from wallet_balances
  lotusAmount?: number; // Actual Lotus token amount (native units)
  nativeBalances: Array<{ chain: string; balance_usd: number }>; // Native token balances for bubble chart
  // Map of chain -> native token USD price derived from wallet_balances
  nativePrices?: Record<string, number>;
  
  // Closed position metrics
  closedPnL: number; // Total PnL from closed positions
  totalPnLWithClosed: number; // Active PnL + Closed PnL
  
  // Additional metrics
  chainDistribution: Record<string, number>;
  topPerformers: PortfolioPosition[];
  worstPerformers: PortfolioPosition[];
  // Trading fund specific metrics
  totalDeployed: number;
  dailyPnL: number;
  winRate: number;
  riskScore: number;
  exitEfficiency: number;
  activeCurators: number;
  positionsNeedingAttention: PortfolioPosition[];
  recentActivity: Array<{
    type: 'entry' | 'exit' | 'update';
    position: string;
    timestamp: string;
    details: string;
  }>;
};

// Minimal shape for wallet balance rows used in native price derivation
type WalletBalanceRow = {
  chain?: string;
  balance_usd?: number;
  balance?: number;
  balance_float?: number;
  balance_native?: number;
  native_balance?: number;
  last_updated?: string;
  updated_at?: string;
  created_at?: string;
};

export type PortfolioResponse = {
  positions: PortfolioPosition[];
  closedPositions: PortfolioPosition[];
  summary: PortfolioSummary;
};

export async function GET() {
  try {
    // Fetch all positions (both active and closed)
    const { data: allPositions, error } = await supabase
      .from('lowcap_positions')
      .select('*')
      .order('total_pnl_usd', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
    }

    // Separate active and closed positions
    const positions = allPositions?.filter(pos => pos.status === 'active') || [];
    const closedPositions = allPositions?.filter(pos => pos.status === 'closed') || [];
    
    // Debug: Log position counts
    console.log('Total positions fetched:', allPositions?.length || 0);
    console.log('Active positions:', positions.length);
    console.log('Closed positions:', closedPositions.length);
    if (closedPositions.length > 0) {
      console.log('Sample closed position:', closedPositions[0]);
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json({ 
        positions: [], 
        summary: {
          portfolioValue: 0,
          portfolioPnL: 0,
          portfolioPnLPercent: 0,
          totalValue: 0,
          totalPnL: 0,
          totalPnLPercent: 0,
          positionCount: 0,
          chainDistribution: {},
          topPerformers: [],
          worstPerformers: []
        }
      });
    }

    // Fetch wallet balances (select * so we can read whichever native amount column exists)
    const { data: walletBalances, error: walletError } = await supabase
      .from('wallet_balances')
      .select('*')
      .order('last_updated', { ascending: false });

    if (walletError) {
      console.error('Wallet balances error:', walletError);
      // Continue without wallet balances if there's an error
    }

    // Debug: Log wallet balances data
    console.log('Wallet balances data:', walletBalances);
    console.log('Number of wallet balance records:', walletBalances?.length || 0);

    // Calculate total native token balance (excluding Lotus - treat as rewards/earnings)
    const totalNativeBalance = walletBalances?.reduce((sum, balance) => {
      // Exclude Lotus from portfolio calculation - it's rewards/earnings, not deployed capital
      if (balance.chain === 'lotus') return sum;
      return sum + (balance.balance_usd || 0);
    }, 0) || 0;
    console.log('Total native token balance (excluding Lotus):', totalNativeBalance);

    // Derive native token USD prices per chain from the most recent wallet_balances rows
    const nativePrices: Record<string, number> = {};
    if (walletBalances && Array.isArray(walletBalances)) {
      // Keep the most recent record per chain
      const latestByChain = new Map<string, WalletBalanceRow>();
      walletBalances.forEach((row: WalletBalanceRow) => {
        const chain = (row.chain || '').toString().toLowerCase();
        if (!chain || chain === 'lotus') return;
        const prev = latestByChain.get(chain);
        const rowTs = new Date(row.last_updated || row.updated_at || row.created_at || 0).getTime();
        const prevTs = prev ? new Date(prev.last_updated || prev.updated_at || prev.created_at || 0).getTime() : -1;
        if (rowTs >= prevTs) {
          latestByChain.set(chain, row);
        }
      });

      latestByChain.forEach((row: WalletBalanceRow, chain: string) => {
        const nativeAmount = Number(
          row?.balance ?? row?.balance_float ?? row?.balance_native ?? row?.native_balance ?? 0
        );
        const usd = Number(row?.balance_usd ?? 0);
        const price = nativeAmount > 0 ? usd / nativeAmount : 0;
        if (price > 0) nativePrices[chain] = price;
      });
    }

    // Get all recent price data (last 24 hours) - no filtering by positions
    console.log('Fetching all recent price data...');
    const { data: priceData, error: priceError } = await supabase
      .from('lowcap_price_data_1m')
      .select('token_contract, chain, price_usd, timestamp, created_at')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('timestamp', { ascending: false })
      .limit(10000); // Higher limit to get more data

    if (priceError) {
      console.error('Price data error:', priceError);
      return NextResponse.json({ error: 'Failed to fetch price data' }, { status: 500 });
    }

    // Create a price lookup map using the LATEST price per token_contract+chain
    const priceMap = new Map<string, number>();
    const priceMapByContract = new Map<string, number>();
    const latestTs = new Map<string, number>();
    const latestTsByContract = new Map<string, number>();
    
    // Debug: Log all price data for FLIPR
    const fliprPriceData = priceData?.filter((row: { token_contract: string }) => 
      row.token_contract === 'JCBKQBPvnjr7emdQGCNM8wtE8AZjyvJgh7JMvkfYxypm'
    );
    console.log('FLIPR Price Data Found:', fliprPriceData?.length || 0, 'records');
    if (fliprPriceData && fliprPriceData.length > 0) {
      console.log('Sample FLIPR price record:', fliprPriceData[0]);
    }
    
    // Debug: Check what token contracts we actually have in price data
    const uniqueContracts = [...new Set(priceData?.map((row: { token_contract: string }) => row.token_contract) || [])];
    console.log('Total price records:', priceData?.length || 0);
    console.log('Unique token contracts in price data:', uniqueContracts.length);
    console.log('Sample contracts:', uniqueContracts.slice(0, 5));
    
    // Check for FLIPR-like contracts (starting with JCBKQBPvnjr7emdQGCNM8)
    const fliprLikeContracts = priceData?.filter((row: { token_contract: string }) => 
      row.token_contract?.startsWith('JCBKQBPvnjr7emdQGCNM8')
    );
    console.log('FLIPR-like contracts found:', fliprLikeContracts?.length || 0);
    if (fliprLikeContracts && fliprLikeContracts.length > 0) {
      console.log('First FLIPR-like contract:', fliprLikeContracts[0].token_contract);
      console.log('Full length:', fliprLikeContracts[0].token_contract?.length);
      console.log('Expected length:', 'JCBKQBPvnjr7emdQGCNM8wtE8AZjyvJgh7JMvkfYxypm'.length);
    }
    
    // Check if FLIPR contract exists with different casing or format
    const fliprVariations = priceData?.filter((row: { token_contract: string }) => 
      row.token_contract?.toLowerCase().includes('jcbkqbpvnjr7emdqgcnm8wte8azjyvjgh7jmvkfyxypm') ||
      row.token_contract?.toLowerCase().includes('flipr')
    );
    console.log('FLIPR variations found:', fliprVariations?.length || 0);
    
    priceData?.forEach((row: { chain: string; token_contract: string; price_usd: number; timestamp: string; created_at: string }) => {
      const chain = (row.chain || '').toString().toLowerCase();
      const key = `${row.token_contract}_${chain}`;
      const tsRaw = row.timestamp ?? row.created_at ?? 0;
      const parsed = new Date(tsRaw as string).getTime();
      const ts = Number.isFinite(parsed) ? parsed : 0;
      const prevTs = latestTs.get(key) ?? -1;
      if (ts >= prevTs) {
        latestTs.set(key, ts);
        priceMap.set(key, Number(row.price_usd) || 0);
      }

      // Also keep a contract-only latest price as a fallback across chains
      const cPrevTs = latestTsByContract.get(row.token_contract) ?? -1;
      if (ts >= cPrevTs) {
        latestTsByContract.set(row.token_contract, ts);
        priceMapByContract.set(row.token_contract, Number(row.price_usd) || 0);
      }
    });

    // Calculate current USD values for each position
    const positionsWithValues = positions.map(pos => {
      const chain = (pos.token_chain || '').toString().toLowerCase();
      const key = `${pos.token_contract}_${chain}`;
      let currentPrice = Number(priceMap.get(key) || 0);
      if (!currentPrice) {
        currentPrice = Number(priceMapByContract.get(pos.token_contract) || 0);
      }
      const quantity = Number(pos.total_quantity) || 0;
      const currentValue = currentPrice * quantity;
      
      // Debug logging for FLIPR
      if (pos.token_ticker === 'FLIPR') {
        console.log('FLIPR Debug:', {
          token_contract: pos.token_contract,
          token_chain: pos.token_chain,
          chain: chain,
          key: key,
          currentPrice: currentPrice,
          quantity: quantity,
          currentValue: currentValue,
          priceMapHasKey: priceMap.has(key),
          priceMapByContractHasKey: priceMapByContract.has(pos.token_contract)
        });
      }
      
      // If no price data available, estimate from P&L data
      let estimatedValue = currentValue;
      if (currentValue === 0 && pos.total_pnl_usd && pos.total_pnl_pct) {
        // Estimate current value from P&L: current_value = pnl_usd / (pnl_pct / 100)
        estimatedValue = pos.total_pnl_usd / (pos.total_pnl_pct / 100);
      }

      // Calculate nearest entry/exit tracking
      let nearestEntry = null;
      let nearestExit = null;
      
      if (pos.entries && Array.isArray(pos.entries)) {
        const plannedEntries = (pos.entries as Array<{ price: number; status: string }>).filter((entry) => entry.status === 'planned');
        if (plannedEntries.length > 0) {
          const nextEntry = plannedEntries.sort((a: { price: number }, b: { price: number }) => a.price - b.price)[0];
          const entryPercentDiff = currentPrice > 0 ? ((nextEntry.price - currentPrice) / currentPrice) * 100 : 0;
          nearestEntry = {
            price: nextEntry.price,
            percentDiff: entryPercentDiff
          };
        }
      }
      
      if (pos.exits && Array.isArray(pos.exits)) {
        const plannedExits = (pos.exits as Array<{ price: number; status: string }>).filter((exit) => exit.status === 'planned');
        if (plannedExits.length > 0) {
          const nextExit = plannedExits.sort((a: { price: number }, b: { price: number }) => a.price - b.price)[0];
          const exitPercentDiff = currentPrice > 0 ? ((nextExit.price - currentPrice) / currentPrice) * 100 : 0;
          nearestExit = {
            price: nextExit.price,
            percentDiff: exitPercentDiff
          };
        }
      }
      
      return {
        ...pos,
        current_invested_usd: estimatedValue,
        nearestEntry,
        nearestExit
      };
    });

    // Calculate summary statistics
    const tokenValue = positionsWithValues.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);
    const totalValue = tokenValue + totalNativeBalance; // Include native balances in totalValue
    const totalPnL = positionsWithValues.reduce((sum, pos) => sum + (pos.total_pnl_usd || 0), 0);
    
    // Calculate closed position PnL
    const closedPnL = closedPositions.reduce((sum, pos) => sum + (pos.total_pnl_usd || 0), 0);
    const totalPnLWithClosed = totalPnL + closedPnL;
    
    // Debug: Log closed PnL calculation
    console.log('Closed PnL calculation:');
    console.log('- Number of closed positions:', closedPositions.length);
    console.log('- Total closed PnL:', closedPnL);
    console.log('- Active PnL:', totalPnL);
    console.log('- Total PnL with closed:', totalPnLWithClosed);
    
    // Calculate P&L % from starting value of $2000
    // const startingValue = 2000;
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;
    
    // Chain distribution
    const chainDistribution = positionsWithValues.reduce((acc, pos) => {
      const chain = pos.token_chain;
      acc[chain] = (acc[chain] || 0) + (pos.current_invested_usd || 0);
      return acc;
    }, {} as Record<string, number>);

    // Top and worst performers
    const sortedByPnL = [...positionsWithValues].sort((a, b) => (b.total_pnl_usd || 0) - (a.total_pnl_usd || 0));
    const topPerformers = sortedByPnL.slice(0, 3);
    const worstPerformers = sortedByPnL.slice(-3).reverse();

    // Trading fund specific calculations
    const totalDeployed = positionsWithValues.reduce((sum, pos) => sum + (pos.current_invested_usd || 0), 0);
    
    // Simulate daily P&L (in real implementation, this would be calculated from price changes)
    const dailyPnL = totalPnL * 0.05; // Simulate 5% of total P&L as daily change
    
    // Win rate calculation
    const profitablePositions = positionsWithValues.filter(pos => (pos.total_pnl_usd || 0) > 0).length;
    const winRate = positionsWithValues.length > 0 ? (profitablePositions / positionsWithValues.length) * 100 : 0;
    
    // Risk score based on chain concentration
    const chainValues: number[] = Object.values(chainDistribution as Record<string, number>) as number[];
    const maxChainValue = chainValues.length > 0 ? Math.max(...chainValues) : 0;
    const riskScore = totalValue > 0 ? (maxChainValue / totalValue) * 100 : 0;
    
    // Exit efficiency (positions with executed exits vs total)
    const positionsWithExits = positionsWithValues.filter((pos) =>
      pos.exits && Array.isArray(pos.exits) && (pos.exits as Array<{ status: string }>).some((exit: { status: string }) => exit.status === 'executed')
    ).length;
    const exitEfficiency = positionsWithValues.length > 0 ? (positionsWithExits / positionsWithValues.length) * 100 : 0;
    
    // Active curators
    const uniqueCurators = new Set(positionsWithValues.map(pos => pos.curator_sources)).size;
    
    // Positions needing attention (high P&L but no exits, or significant losses)
    const positionsNeedingAttention = positionsWithValues.filter(pos => {
      const pnlPercent = pos.total_pnl_pct || 0;
      const hasExecutedExits = pos.exits && Array.isArray(pos.exits) &&
        (pos.exits as Array<{ status: string }>).some((exit: { status: string }) => exit.status === 'executed');
      
      return (pnlPercent > 200 && !hasExecutedExits) || pnlPercent < -50;
    });
    
    // Recent activity simulation (in real implementation, this would come from transaction logs)
    const recentActivity = positionsWithValues.slice(0, 3).map(pos => ({
      type: 'update' as const,
      position: pos.token_ticker,
      timestamp: pos.updated_at || pos.created_at,
      details: `Position updated - P&L: ${pos.total_pnl_pct || 0}%`
    }));

    // Calculate new portfolio-level metrics
    const portfolioValue = totalValue; // totalValue now includes native balances
    const portfolioPnL = portfolioValue - 2000; // Starting value was $2000
    const portfolioPnLPercent = 2000 > 0 ? (portfolioPnL / 2000) * 100 : 0;
    
    // Calculate new requested metrics
    const percentDeployed = portfolioValue > 0 ? (tokenValue / portfolioValue) * 100 : 0;
    const lotusRow = walletBalances?.find((b: { chain: string }) => (b.chain || '').toLowerCase() === 'lotus');
    const lotusBalance = lotusRow?.balance_usd || 0;
    // Read native amount from any of the commonly used column names
    const lotusAmount = Number(
      lotusRow?.balance ??
      lotusRow?.balance_float ??
      lotusRow?.balance_native ??
      lotusRow?.native_balance ??
      0
    );
    
    // Debug: Log detailed breakdown
    console.log('Portfolio Value Breakdown:');
    console.log('- Token Value (active positions):', tokenValue.toFixed(2));
    console.log('- Native Balances (excluding Lotus):', totalNativeBalance.toFixed(2));
    console.log('- Total Value (tokens + native):', totalValue.toFixed(2));
    console.log('- Total Portfolio Value:', portfolioValue.toFixed(2));
    console.log('- Lotus Balance (excluded):', lotusBalance.toFixed(2));
    console.log('- Portfolio PnL:', portfolioPnL.toFixed(2));
    console.log('- % Deployed:', percentDeployed.toFixed(1) + '%');

    const summary: PortfolioSummary = {
      // New portfolio-level metrics
      portfolioValue,
      portfolioPnL,
      portfolioPnLPercent,
      
      // Existing token-level metrics
      totalValue,
      totalPnL,
      totalPnLPercent,
      positionCount: positionsWithValues.length,
      
      // New requested metrics
      percentDeployed,
      lotusAcquired: lotusBalance,
      lotusAmount,
      nativeBalances: walletBalances?.filter(balance => balance.chain !== 'lotus') || [],
      nativePrices,
      
      // Closed position metrics
      closedPnL,
      totalPnLWithClosed,
      
      // Additional metrics
      chainDistribution,
      topPerformers,
      worstPerformers,
      totalDeployed,
      dailyPnL,
      winRate,
      riskScore,
      exitEfficiency,
      activeCurators: uniqueCurators,
      positionsNeedingAttention,
      recentActivity
    };

    return NextResponse.json({
      positions: positionsWithValues,
      closedPositions: closedPositions,
      summary
    });

  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import type { PortfolioResponse } from "../api/portfolio/route";

export function usePortfolioData(refreshInterval = 30000) {
  const [portfolioData, setPortfolioData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      const data = await response.json();
      setPortfolioData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    
    // Set up periodic refresh
    const interval = setInterval(fetchPortfolio, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchPortfolio, refreshInterval]);

  return {
    portfolioData,
    loading,
    error,
    lastUpdated,
    refresh: fetchPortfolio
  };
}


"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Holding, AssetClass } from "@/types";

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/holdings");
      setHoldings(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  return { holdings, loading, refetch: fetchHoldings };
}

export function useAssetClasses() {
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);

  useEffect(() => {
    api.get("/asset-classes").then((res) => setAssetClasses(res.data)).catch(() => {});
  }, []);

  return assetClasses;
}

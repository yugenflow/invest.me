"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { DashboardData, DuplicateGroup } from "@/types";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, refetch: fetchDashboard };
}

export function useDuplicateGroups() {
  const [groups, setGroups] = useState<DuplicateGroup[][]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/holdings/duplicates");
      setGroups(res.data.groups || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, refetch: fetchGroups };
}

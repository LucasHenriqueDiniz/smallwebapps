import { create } from 'zustand';
import type { AnalyticsData } from './types';

interface HistoryStore {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  setData: (data: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  setData: (data) => set({ data, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ data: null, isLoading: false, error: null })
}));

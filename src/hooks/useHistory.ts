import { useState, useCallback } from 'react';
import type { HistoryEntry } from '../types';

const STORAGE_KEY = 'sports-ai-coach-history';

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    // 只保留最近50条
    const trimmed = entries.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage满，清一半再试
    const half = entries.slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const updated = [entry, ...prev];
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  return { entries, addEntry, clearHistory, removeEntry };
}

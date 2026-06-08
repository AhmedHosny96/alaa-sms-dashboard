import { useCallback, useEffect, useState } from 'react';
import { DASHBOARD_SNAP_STORAGE_KEY } from 'components/authentication/authStorage';
import smsService from 'services/smsService';

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function readStoredDashboard() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DASHBOARD_SNAP_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    if (o._date !== todayUtc()) return null;
    return o._data || null;
  } catch {
    return null;
  }
}

function writeStoredDashboard(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      DASHBOARD_SNAP_STORAGE_KEY,
      JSON.stringify({ _date: todayUtc(), _data: data })
    );
  } catch {
    // storage full or private mode
  }
}

export default function useSmsDashboard() {
  const [data, setData] = useState(() => readStoredDashboard());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await smsService.getDashboard();
      const next = res && typeof res === 'object' ? res : {};
      setData(next);
      writeStoredDashboard(next);
      setError(null);
    } catch (e) {
      setError(e?.message || 'Dashboard failed');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchDashboard(false)
  };
}

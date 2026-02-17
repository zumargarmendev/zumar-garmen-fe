import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getToken } from '../utils/tokenManager';
import { fetchAndStoreUserPermissions, getUserPermissions } from '../api/auth';

const REFRESH_INTERVAL = 5 * 60 * 1000;

export const PermissionContext = createContext({
  permissions: [],
  loading: true,
  refreshPermissions: () => {},
});

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState(() => getUserPermissions());
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const refreshPermissions = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const freshPermissions = await fetchAndStoreUserPermissions();
      setPermissions(freshPermissions);
    } catch {
      // Fallback ke cache localStorage jika fetch gagal
      setPermissions(getUserPermissions());
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Auto re-fetch setiap 5 menit
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    intervalRef.current = setInterval(refreshPermissions, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshPermissions]);

  return (
    <PermissionContext.Provider value={{ permissions, loading, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

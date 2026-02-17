import { useContext, useCallback } from 'react';
import { PermissionContext } from '../context/PermissionContext';

export function usePermissions() {
  const { permissions, loading, refreshPermissions } = useContext(PermissionContext);

  const can = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const canAny = useCallback((requiredPermissions) => {
    return requiredPermissions.some((perm) => can(perm));
  }, [can]);

  const canAll = useCallback((requiredPermissions) => {
    return requiredPermissions.every((perm) => can(perm));
  }, [can]);

  return {
    all: permissions,
    loading,
    refresh: refreshPermissions,
    can,
    canAny,
    canAll,
  };
}

export function usePermission(permission) {
  const { can } = usePermissions();
  return can(permission);
}

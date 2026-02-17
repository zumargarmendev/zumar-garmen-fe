import { useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getCurrentUserRole, isAdmin } from "../api/auth";
import { getToken } from "../utils/tokenManager";
import { usePermissions } from "../utils/usePermission";

export default function PermissionGuard({
  roles = [],
  permissions = [],
  requireAdmin = false,
  fallbackPath = "/NotFound"
}) {
  const navigate = useNavigate();
  const token = getToken();
  const userRole = getCurrentUserRole();
  const { canAny } = usePermissions();

  const hasAccess = useMemo(() => {
    if (!token) return false;
    if (requireAdmin && !isAdmin()) return false;
    if (roles.length > 0 && !roles.includes(userRole)) return false;
    if (permissions.length > 0 && !canAny(permissions)) return false;
    return true;
  }, [token, userRole, roles, permissions, requireAdmin, canAny]);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
    } else if (!hasAccess) {
      navigate(fallbackPath);
    }
  }, [navigate, token, hasAccess, fallbackPath]);

  if (!hasAccess) return null;

  return <Outlet />;
}

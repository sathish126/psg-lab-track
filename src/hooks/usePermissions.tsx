import { useAuth, UserRole } from './useAuth';

const roleHierarchy: Record<UserRole, number> = {
  principal: 4,
  hod: 3,
  faculty: 2,
  lab_assistant: 1,
};

export function usePermissions() {
  const { profile } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!profile?.role) return false;
    return profile.role === role;
  };

  const hasMinimumRole = (minRole: UserRole): boolean => {
    if (!profile?.role) return false;
    return roleHierarchy[profile.role] >= roleHierarchy[minRole];
  };

  const canManageUsers = (): boolean => {
    return hasRole('principal');
  };

  const canManageDepartments = (): boolean => {
    return hasMinimumRole('hod');
  };

  const canManageLabs = (): boolean => {
    return hasMinimumRole('hod');
  };

  const canAddEquipment = (): boolean => {
    return hasMinimumRole('hod');
  };

  const canEditEquipment = (): boolean => {
    return hasMinimumRole('hod');
  };

  const canDeleteEquipment = (): boolean => {
    return hasRole('principal');
  };

  const canVerifyEquipment = (): boolean => {
    return hasMinimumRole('lab_assistant');
  };

  const canViewReports = (): boolean => {
    return hasMinimumRole('faculty');
  };

  return {
    role: profile?.role,
    hasRole,
    hasMinimumRole,
    canManageUsers,
    canManageDepartments,
    canManageLabs,
    canAddEquipment,
    canEditEquipment,
    canDeleteEquipment,
    canVerifyEquipment,
    canViewReports,
  };
}

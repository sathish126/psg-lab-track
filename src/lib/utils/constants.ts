import { UserRole, EquipmentStatus, VerificationStatus } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PRINCIPAL]: 'Principal',
  [UserRole.HOD]: 'Head of Department',
  [UserRole.FACULTY]: 'Faculty',
  [UserRole.LAB_ASSISTANT]: 'Lab Assistant',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.WORKING]: 'Working',
  [EquipmentStatus.NOT_WORKING]: 'Not Working',
  [EquipmentStatus.REPAIRABLE]: 'Repairable',
  [EquipmentStatus.TO_BE_SCRAPPED]: 'To Be Scrapped',
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.WORKING]: 'success',
  [EquipmentStatus.NOT_WORKING]: 'destructive',
  [EquipmentStatus.REPAIRABLE]: 'warning',
  [EquipmentStatus.TO_BE_SCRAPPED]: 'secondary',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.VERIFIED]: 'Verified',
  [VerificationStatus.PENDING]: 'Pending',
  [VerificationStatus.MISSING]: 'Missing',
  [VerificationStatus.DAMAGED]: 'Damaged',
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  [VerificationStatus.VERIFIED]: 'success',
  [VerificationStatus.PENDING]: 'warning',
  [VerificationStatus.MISSING]: 'destructive',
  [VerificationStatus.DAMAGED]: 'destructive',
};

export const ROUTES = {
  AUTH: '/auth',
  LOGIN: '/auth',
  DASHBOARD: '/dashboard',
  EQUIPMENT: '/equipment',
  EQUIPMENT_CREATE: '/equipment/create',
  EQUIPMENT_DETAILS: (id: string) => `/equipment/${id}`,
  EQUIPMENT_EDIT: (id: string) => `/equipment/${id}/edit`,
  LABS: '/labs',
  LAB_DETAILS: (id: string) => `/labs/${id}`,
  LAB_CREATE: '/labs/create',
  VERIFICATION: '/verification',
  VERIFICATION_SCAN: '/verification/scan',
  CALENDAR: '/calendar',
  REPORTS: '/reports',
  USERS: '/users',
  SETTINGS: '/settings',
};

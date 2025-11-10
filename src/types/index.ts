export enum UserRole {
  PRINCIPAL = 'PRINCIPAL',
  HOD = 'HOD',
  FACULTY = 'FACULTY',
  LAB_ASSISTANT = 'LAB_ASSISTANT',
}

export enum EquipmentStatus {
  WORKING = 'WORKING',
  NOT_WORKING = 'NOT_WORKING',
  REPAIRABLE = 'REPAIRABLE',
  TO_BE_SCRAPPED = 'TO_BE_SCRAPPED',
}

export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  MISSING = 'MISSING',
  DAMAGED = 'DAMAGED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  departmentId?: string;
  department?: Department;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Lab {
  id: string;
  name: string;
  labCode: string;
  block: string;
  hallNo: string;
  floor?: string;
  capacity?: number;
  departmentId: string;
  department?: Department;
  inChargeId: string;
  inCharge?: User;
}

export interface Equipment {
  id: string;
  qrCode: string;
  name: string;
  make: string;
  serialNo: string;
  modelNo?: string;
  purchaseDate: Date;
  cost: number;
  fundingSource: string;
  stockPageNo: string;
  stockSerialNo: string;
  block: string;
  hallNo: string;
  physicalPresence: boolean;
  workingStatus: EquipmentStatus;
  remarks?: string;
  labId: string;
  lab?: Lab;
  facultyInChargeId: string;
  facultyInCharge?: User;
  verifications?: Verification[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Verification {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  verifiedById: string;
  verifiedBy?: User;
  status: VerificationStatus;
  physicalPresence: boolean;
  workingStatus: EquipmentStatus;
  remarks?: string;
  latitude?: number;
  longitude?: number;
  verifiedAt: Date;
}

export interface DashboardStats {
  totalEquipment: number;
  verifiedThisMonth: number;
  pendingThisMonth: number;
  needsAttentionCount: number;
  verificationRate: string;
}

export interface MonthlyVerificationData {
  month: string;
  count: number;
}

export interface EquipmentStatusData {
  status: string;
  count: number;
  fill: string;
}

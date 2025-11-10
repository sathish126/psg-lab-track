import { Department, User, Lab, Equipment, Verification, UserRole, EquipmentStatus, VerificationStatus } from '@/types';

// Departments
export const departments: Department[] = [
  { id: 'dept-1', name: 'Computer Science and Engineering', code: 'CSE' },
  { id: 'dept-2', name: 'Electronics and Communication Engineering', code: 'ECE' },
  { id: 'dept-3', name: 'Mechanical Engineering', code: 'MECH' },
  { id: 'dept-4', name: 'Civil Engineering', code: 'CIVIL' },
  { id: 'dept-5', name: 'Electrical and Electronics Engineering', code: 'EEE' },
];

// Users
export const users: User[] = [
  {
    id: 'user-1',
    email: 'principal@psg.edu',
    name: 'Dr. Ramaswamy Kumar',
    role: UserRole.PRINCIPAL,
    phone: '+91 98765 43210',
  },
  {
    id: 'user-2',
    email: 'hod.cse@psg.edu',
    name: 'Dr. Vijay Anand',
    role: UserRole.HOD,
    phone: '+91 98765 43211',
    departmentId: 'dept-1',
    department: departments[0],
  },
  {
    id: 'user-3',
    email: 'hod.ece@psg.edu',
    name: 'Dr. Priya Sharma',
    role: UserRole.HOD,
    phone: '+91 98765 43212',
    departmentId: 'dept-2',
    department: departments[1],
  },
  {
    id: 'user-4',
    email: 'faculty@psg.edu',
    name: 'Prof. Rajesh Kumar',
    role: UserRole.FACULTY,
    phone: '+91 98765 43213',
    departmentId: 'dept-1',
    department: departments[0],
  },
  {
    id: 'user-5',
    email: 'assistant@psg.edu',
    name: 'Mr. Suresh Babu',
    role: UserRole.LAB_ASSISTANT,
    phone: '+91 98765 43214',
    departmentId: 'dept-1',
    department: departments[0],
  },
  {
    id: 'user-6',
    email: 'faculty.ece@psg.edu',
    name: 'Dr. Lakshmi Narayanan',
    role: UserRole.FACULTY,
    phone: '+91 98765 43215',
    departmentId: 'dept-2',
    department: departments[1],
  },
  {
    id: 'user-7',
    email: 'faculty.mech@psg.edu',
    name: 'Prof. Karthik Swamy',
    role: UserRole.FACULTY,
    phone: '+91 98765 43216',
    departmentId: 'dept-3',
    department: departments[2],
  },
];

// Labs
export const labs: Lab[] = [
  {
    id: 'lab-1',
    name: 'Computer Networks Lab',
    labCode: 'CNL-01',
    block: 'A',
    hallNo: '101',
    floor: '1',
    capacity: 60,
    departmentId: 'dept-1',
    department: departments[0],
    inChargeId: 'user-4',
    inCharge: users[3],
  },
  {
    id: 'lab-2',
    name: 'Operating Systems Lab',
    labCode: 'OSL-02',
    block: 'A',
    hallNo: '102',
    floor: '1',
    capacity: 60,
    departmentId: 'dept-1',
    department: departments[0],
    inChargeId: 'user-4',
    inCharge: users[3],
  },
  {
    id: 'lab-3',
    name: 'Database Systems Lab',
    labCode: 'DBL-03',
    block: 'A',
    hallNo: '201',
    floor: '2',
    capacity: 50,
    departmentId: 'dept-1',
    department: departments[0],
    inChargeId: 'user-4',
    inCharge: users[3],
  },
  {
    id: 'lab-4',
    name: 'Digital Electronics Lab',
    labCode: 'DEL-01',
    block: 'B',
    hallNo: '101',
    floor: '1',
    capacity: 40,
    departmentId: 'dept-2',
    department: departments[1],
    inChargeId: 'user-6',
    inCharge: users[5],
  },
  {
    id: 'lab-5',
    name: 'Communication Systems Lab',
    labCode: 'CSL-02',
    block: 'B',
    hallNo: '102',
    floor: '1',
    capacity: 40,
    departmentId: 'dept-2',
    department: departments[1],
    inChargeId: 'user-6',
    inCharge: users[5],
  },
  {
    id: 'lab-6',
    name: 'Thermodynamics Lab',
    labCode: 'TDL-01',
    block: 'C',
    hallNo: '101',
    floor: '1',
    capacity: 30,
    departmentId: 'dept-3',
    department: departments[2],
    inChargeId: 'user-7',
    inCharge: users[6],
  },
];

// Equipment - Generate realistic equipment data
const equipmentNames = [
  { name: 'Dell OptiPlex 7090', make: 'Dell' },
  { name: 'HP ProDesk 600', make: 'HP' },
  { name: 'Lenovo ThinkCentre M720', make: 'Lenovo' },
  { name: 'Cisco Catalyst 2960', make: 'Cisco' },
  { name: 'D-Link DGS-1100', make: 'D-Link' },
  { name: 'Tektronix TDS2024C', make: 'Tektronix' },
  { name: 'Agilent DSO-X 3024A', make: 'Agilent' },
  { name: 'Fluke 87V Multimeter', make: 'Fluke' },
  { name: 'Signal Generator AFG3252', make: 'Tektronix' },
  { name: 'Power Supply DP832', make: 'Rigol' },
];

const generateSerialNo = () => `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
const generateModelNo = () => `MDL-${Math.floor(Math.random() * 9000) + 1000}`;

export const equipment: Equipment[] = [];

// Generate 100+ equipment items
for (let i = 0; i < 120; i++) {
  const equipmentType = equipmentNames[i % equipmentNames.length];
  const lab = labs[Math.floor(Math.random() * labs.length)];
  const purchaseDate = new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  
  const statuses = [EquipmentStatus.WORKING, EquipmentStatus.WORKING, EquipmentStatus.WORKING, EquipmentStatus.NOT_WORKING, EquipmentStatus.REPAIRABLE, EquipmentStatus.TO_BE_SCRAPPED];
  const workingStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  equipment.push({
    id: `eq-${i + 1}`,
    qrCode: `QR-${i + 1}-${generateSerialNo()}`,
    name: `${equipmentType.name} ${i + 1}`,
    make: equipmentType.make,
    serialNo: generateSerialNo(),
    modelNo: generateModelNo(),
    purchaseDate,
    cost: Math.floor(Math.random() * 100000) + 20000,
    fundingSource: Math.random() > 0.5 ? 'Government Grant' : 'College Fund',
    stockPageNo: `PG-${Math.floor(Math.random() * 100) + 1}`,
    stockSerialNo: `ST-${Math.floor(Math.random() * 1000) + 1}`,
    block: lab.block,
    hallNo: lab.hallNo,
    physicalPresence: Math.random() > 0.1,
    workingStatus,
    remarks: workingStatus === EquipmentStatus.WORKING ? undefined : 'Needs maintenance',
    labId: lab.id,
    lab,
    facultyInChargeId: lab.inChargeId,
    facultyInCharge: lab.inCharge,
    verifications: [],
    createdAt: purchaseDate,
    updatedAt: new Date(),
  });
}

// Verifications
export const verifications: Verification[] = [];

// Generate verification history
for (let i = 0; i < 80; i++) {
  const eq = equipment[Math.floor(Math.random() * equipment.length)];
  const verifier = users.filter(u => u.role !== UserRole.PRINCIPAL)[Math.floor(Math.random() * 5)];
  const monthsAgo = Math.floor(Math.random() * 6);
  const verifiedAt = new Date();
  verifiedAt.setMonth(verifiedAt.getMonth() - monthsAgo);
  verifiedAt.setDate(Math.floor(Math.random() * 28) + 1);
  
  const statuses = [VerificationStatus.VERIFIED, VerificationStatus.VERIFIED, VerificationStatus.VERIFIED, VerificationStatus.DAMAGED, VerificationStatus.MISSING];
  
  verifications.push({
    id: `ver-${i + 1}`,
    equipmentId: eq.id,
    equipment: eq,
    verifiedById: verifier.id,
    verifiedBy: verifier,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    physicalPresence: Math.random() > 0.1,
    workingStatus: eq.workingStatus,
    remarks: Math.random() > 0.7 ? 'All good' : undefined,
    latitude: 11.0168 + (Math.random() - 0.5) * 0.01,
    longitude: 76.9558 + (Math.random() - 0.5) * 0.01,
    verifiedAt,
  });
}

// Link verifications to equipment
equipment.forEach(eq => {
  eq.verifications = verifications.filter(v => v.equipmentId === eq.id);
});

// Mock user credentials
export const mockCredentials = {
  'principal@psg.edu': { password: 'password123', user: users[0] },
  'hod.cse@psg.edu': { password: 'password123', user: users[1] },
  'hod.ece@psg.edu': { password: 'password123', user: users[2] },
  'faculty@psg.edu': { password: 'password123', user: users[3] },
  'assistant@psg.edu': { password: 'password123', user: users[4] },
};

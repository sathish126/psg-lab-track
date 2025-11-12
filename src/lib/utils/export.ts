import { Equipment, User, Verification } from '@/types';
import { formatDate, formatCurrency } from './formatters';

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header] ?? '';
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

/**
 * Trigger download of CSV file
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export equipment data to CSV
 */
export function exportEquipmentToCSV(equipment: Equipment[], filename = 'equipment_export') {
  const data = equipment.map(eq => ({
    name: eq.name,
    serialNo: eq.serialNo,
    make: eq.make,
    lab: eq.lab?.name || 'N/A',
    department: eq.lab?.department?.name || 'N/A',
    status: eq.workingStatus,
    purchaseDate: formatDate(eq.purchaseDate),
    cost: formatCurrency(eq.cost),
    facultyInCharge: eq.facultyInCharge?.name || 'N/A',
    qrCode: eq.qrCode,
  }));

  const headers = [
    'name', 'serialNo', 'make', 'lab', 'department', 
    'status', 'purchaseDate', 'cost', 'facultyInCharge', 'qrCode'
  ];

  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, filename);
}

/**
 * Export users data to CSV
 */
export function exportUsersToCSV(users: User[], filename = 'users_export') {
  const data = users.map(user => ({
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department?.name || 'N/A',
    phone: user.phone || 'N/A',
  }));

  const headers = ['name', 'email', 'role', 'department', 'phone'];
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, filename);
}

/**
 * Export verification data to CSV
 */
export function exportVerificationsToCSV(verifications: Verification[], filename = 'verifications_export') {
  const data = verifications.map(ver => ({
    equipment: ver.equipment?.name || 'N/A',
    serialNo: ver.equipment?.serialNo || 'N/A',
    verifiedBy: ver.verifiedBy?.name || 'N/A',
    verifiedAt: formatDate(ver.verifiedAt),
    status: ver.status,
    remarks: ver.remarks || '',
  }));

  const headers = ['equipment', 'serialNo', 'verifiedBy', 'verifiedAt', 'status', 'remarks'];
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, filename);
}

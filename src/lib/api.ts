import axios from 'axios';
import { User, Equipment, Lab, Verification, Department } from '@/types';
import { 
  users, 
  equipment as mockEquipment, 
  labs as mockLabs, 
  verifications as mockVerifications,
  departments as mockDepartments,
  mockCredentials 
} from '@/data/mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    await delay(500);
    const credentials = mockCredentials[email as keyof typeof mockCredentials];
    
    if (credentials && credentials.password === password) {
      const token = `mock-token-${Date.now()}`;
      return {
        user: credentials.user,
        token,
      };
    }
    throw new Error('Invalid credentials');
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    await delay(300);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    throw new Error('Not authenticated');
  },
};

// Equipment API
export const equipmentApi = {
  getAll: async (filters?: { 
    search?: string; 
    status?: string; 
    labId?: string; 
    departmentId?: string;
  }) => {
    await delay(400);
    let filtered = [...mockEquipment];
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.name.toLowerCase().includes(search) ||
        eq.serialNo.toLowerCase().includes(search) ||
        eq.make.toLowerCase().includes(search)
      );
    }
    
    if (filters?.status) {
      filtered = filtered.filter(eq => eq.workingStatus === filters.status);
    }
    
    if (filters?.labId) {
      filtered = filtered.filter(eq => eq.labId === filters.labId);
    }
    
    if (filters?.departmentId) {
      filtered = filtered.filter(eq => eq.lab?.departmentId === filters.departmentId);
    }
    
    return filtered;
  },

  getById: async (id: string) => {
    await delay(300);
    const item = mockEquipment.find(eq => eq.id === id);
    if (!item) throw new Error('Equipment not found');
    return item;
  },

  getByQRCode: async (qrCode: string) => {
    await delay(300);
    const item = mockEquipment.find(eq => eq.qrCode === qrCode);
    if (!item) throw new Error('Equipment not found');
    return item;
  },

  create: async (data: Partial<Equipment>) => {
    await delay(500);
    const newEquipment: Equipment = {
      id: `eq-${mockEquipment.length + 1}`,
      qrCode: `QR-${Date.now()}`,
      ...data,
    } as Equipment;
    mockEquipment.push(newEquipment);
    return newEquipment;
  },

  update: async (id: string, data: Partial<Equipment>) => {
    await delay(500);
    const index = mockEquipment.findIndex(eq => eq.id === id);
    if (index === -1) throw new Error('Equipment not found');
    mockEquipment[index] = { ...mockEquipment[index], ...data };
    return mockEquipment[index];
  },

  delete: async (id: string) => {
    await delay(500);
    const index = mockEquipment.findIndex(eq => eq.id === id);
    if (index === -1) throw new Error('Equipment not found');
    mockEquipment.splice(index, 1);
  },
};

// Lab API
export const labApi = {
  getAll: async (filters?: { departmentId?: string }) => {
    await delay(300);
    let filtered = [...mockLabs];
    
    if (filters?.departmentId) {
      filtered = filtered.filter(lab => lab.departmentId === filters.departmentId);
    }
    
    return filtered;
  },

  getById: async (id: string) => {
    await delay(300);
    const lab = mockLabs.find(l => l.id === id);
    if (!lab) throw new Error('Lab not found');
    return lab;
  },

  create: async (data: Partial<Lab>) => {
    await delay(500);
    const newLab: Lab = {
      id: `lab-${mockLabs.length + 1}`,
      ...data,
    } as Lab;
    mockLabs.push(newLab);
    return newLab;
  },

  update: async (id: string, data: Partial<Lab>) => {
    await delay(500);
    const index = mockLabs.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lab not found');
    mockLabs[index] = { ...mockLabs[index], ...data };
    return mockLabs[index];
  },
};

// Verification API
export const verificationApi = {
  getAll: async (filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    equipmentId?: string;
    labId?: string;
  }) => {
    await delay(400);
    let filtered = [...mockVerifications];
    
    if (filters?.startDate) {
      filtered = filtered.filter(v => new Date(v.verifiedAt) >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      filtered = filtered.filter(v => new Date(v.verifiedAt) <= filters.endDate!);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    
    if (filters?.equipmentId) {
      filtered = filtered.filter(v => v.equipmentId === filters.equipmentId);
    }
    
    if (filters?.labId) {
      filtered = filtered.filter(v => v.equipment?.labId === filters.labId);
    }
    
    return filtered.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
  },

  create: async (data: Partial<Verification>) => {
    await delay(500);
    const newVerification: Verification = {
      id: `ver-${mockVerifications.length + 1}`,
      verifiedAt: new Date(),
      ...data,
    } as Verification;
    mockVerifications.push(newVerification);
    return newVerification;
  },

  getMonthlyStatus: async (month: number, year: number) => {
    await delay(300);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyCounts: Record<number, number> = {};
    
    mockVerifications.forEach(v => {
      const date = new Date(v.verifiedAt);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate();
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      }
    });
    
    return dailyCounts;
  },
};

// Dashboard API
export const dashboardApi = {
  getOverview: async () => {
    await delay(400);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthVerifications = mockVerifications.filter(v => 
      new Date(v.verifiedAt) >= firstDayOfMonth
    );
    
    const needsAttention = mockEquipment.filter(eq => 
      eq.workingStatus !== 'WORKING' || !eq.physicalPresence
    );
    
    return {
      totalEquipment: mockEquipment.length,
      verifiedThisMonth: thisMonthVerifications.length,
      pendingThisMonth: mockEquipment.length - thisMonthVerifications.length,
      needsAttentionCount: needsAttention.length,
      verificationRate: `${Math.round((thisMonthVerifications.length / mockEquipment.length) * 100)}%`,
    };
  },
};

// Department API
export const departmentApi = {
  getAll: async () => {
    await delay(200);
    return mockDepartments;
  },
};

// User API
export const userApi = {
  getAll: async () => {
    await delay(300);
    return users;
  },

  getById: async (id: string) => {
    await delay(200);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  create: async (data: Partial<User>) => {
    await delay(500);
    const newUser: User = {
      id: `user-${users.length + 1}`,
      ...data,
    } as User;
    users.push(newUser);
    return newUser;
  },

  update: async (id: string, data: Partial<User>) => {
    await delay(500);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data };
    return users[index];
  },

  delete: async (id: string) => {
    await delay(500);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users.splice(index, 1);
  },
};

export default api;

import { create } from 'zustand';
import { Equipment } from '@/types';
import { equipmentApi } from '@/lib/api';
import { toast } from 'sonner';

interface EquipmentState {
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  loading: boolean;
  error: string | null;
  fetchEquipment: (filters?: any) => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<void>;
  createEquipment: (data: Partial<Equipment>) => Promise<Equipment>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  bulkUpdateEquipment: (ids: string[], data: Partial<Equipment>) => Promise<void>;
  bulkDeleteEquipment: (ids: string[]) => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  selectedEquipment: null,
  loading: false,
  error: null,

  fetchEquipment: async (filters?: any) => {
    set({ loading: true, error: null });
    try {
      const data = await equipmentApi.getAll(filters);
      set({ equipment: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Failed to fetch equipment');
    }
  },

  fetchEquipmentById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await equipmentApi.getById(id);
      set({ selectedEquipment: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Equipment not found');
    }
  },

  createEquipment: async (data: Partial<Equipment>) => {
    set({ loading: true, error: null });
    try {
      const newEquipment = await equipmentApi.create(data);
      set(state => ({ 
        equipment: [...state.equipment, newEquipment], 
        loading: false 
      }));
      toast.success('Equipment created successfully');
      return newEquipment;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Failed to create equipment');
      throw error;
    }
  },

  updateEquipment: async (id: string, data: Partial<Equipment>) => {
    set({ loading: true, error: null });
    try {
      const updated = await equipmentApi.update(id, data);
      set(state => ({
        equipment: state.equipment.map(eq => eq.id === id ? updated : eq),
        selectedEquipment: state.selectedEquipment?.id === id ? updated : state.selectedEquipment,
        loading: false,
      }));
      toast.success('Equipment updated successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Failed to update equipment');
      throw error;
    }
  },

  deleteEquipment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await equipmentApi.delete(id);
      set(state => ({
        equipment: state.equipment.filter(eq => eq.id !== id),
        selectedEquipment: null,
        loading: false,
      }));
      toast.success('Equipment deleted successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Failed to delete equipment');
      throw error;
    }
  },

  bulkUpdateEquipment: async (ids: string[], data: Partial<Equipment>) => {
    set({ loading: true, error: null });
    try {
      // Update each equipment item
      const updatePromises = ids.map(id => equipmentApi.update(id, data));
      await Promise.all(updatePromises);
      
      // Refresh equipment list
      await get().fetchEquipment();
      toast.success(`${ids.length} equipment items updated successfully`);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Failed to update equipment');
      throw error;
    }
  },

  bulkDeleteEquipment: async (ids: string[]) => {
    set({ loading: true, error: null });
    try {
      // Delete each equipment item
      const deletePromises = ids.map(id => equipmentApi.delete(id));
      await Promise.all(deletePromises);
      
      set(state => ({
        equipment: state.equipment.filter(eq => !ids.includes(eq.id)),
        loading: false,
      }));
      toast.success(`${ids.length} equipment items deleted successfully`);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error('Failed to delete equipment');
      throw error;
    }
  },

  setSelectedEquipment: (equipment: Equipment | null) => {
    set({ selectedEquipment: equipment });
  },
}));

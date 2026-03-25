import { create } from "zustand";
import api from "../utils/api";
import type { RecurringService, RecurringServiceFormData } from "../types/recurringService";

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface RecurringServiceFilters {
  search?: string;
  status?: string;
  billing_cycle?: string;
  project_id?: number | string;
}

interface RecurringServiceState {
  services: RecurringService[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  currentFilters: RecurringServiceFilters | null;
  fetchServices: (
    page?: number,
    perPage?: number,
    filters?: RecurringServiceFilters
  ) => Promise<void>;
  createService: (data: RecurringServiceFormData) => Promise<void>;
  updateService: (id: number, data: RecurringServiceFormData) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
}

export const useRecurringServiceStore = create<RecurringServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 12,
  },
  currentFilters: null,

  fetchServices: async (page = 1, perPage = 12, filters = {}) => {
    set({ isLoading: true, error: null, currentFilters: filters });
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.billing_cycle) params.billing_cycle = filters.billing_cycle;
      if (filters.project_id) params.project_id = filters.project_id;

      const response = await api.get("/api/v1/recurring_services", { params });

      if (response.status === 200) {
        set({
          services: response.data.recurring_services,
          pagination: response.data.pagination,
          isLoading: false,
        });
        return;
      }
      throw new Error("Error al obtener servicios recurrentes");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener servicios recurrentes";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createService: async (data: RecurringServiceFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/v1/recurring_services", { recurring_service: data });

      if (response.status === 201) {
        const { pagination } = get();
        await get().fetchServices(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al crear servicio recurrente");
    } catch (error: any) {
      let errorMessage = "Error al crear servicio recurrente";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateService: async (id: number, data: RecurringServiceFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/recurring_services/${id}`, { recurring_service: data });

      if (response.status === 200) {
        const { pagination } = get();
        await get().fetchServices(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al actualizar servicio recurrente");
    } catch (error: any) {
      let errorMessage = "Error al actualizar servicio recurrente";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteService: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/v1/recurring_services/${id}`);

      if (response.status === 200) {
        const { pagination } = get();
        await get().fetchServices(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al eliminar servicio recurrente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al eliminar servicio recurrente";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));

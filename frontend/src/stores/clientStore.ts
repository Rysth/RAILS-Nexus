import { create } from "zustand";
import api from "../utils/api";
import type { Client, ClientFormData } from "../types/client";

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface ClientFilters {
  search?: string;
  identification_type?: string;
}

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  currentFilters: ClientFilters | null;
  fetchClients: (
    page?: number,
    perPage?: number,
    filters?: ClientFilters
  ) => Promise<void>;
  fetchClient: (id: number) => Promise<void>;
  createClient: (data: ClientFormData) => Promise<void>;
  updateClient: (id: number, data: ClientFormData) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 12,
  },
  currentFilters: null,

  fetchClients: async (page = 1, perPage = 12, filters = {}) => {
    set({ isLoading: true, error: null, currentFilters: filters });
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (filters.search) params.search = filters.search;
      if (filters.identification_type) params.identification_type = filters.identification_type;

      const response = await api.get("/api/v1/clients", { params });

      if (response.status === 200) {
        set({
          clients: response.data.clients,
          pagination: response.data.pagination,
          isLoading: false,
        });
        return;
      }
      throw new Error("Error al obtener clientes");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener clientes";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchClient: async (id: number) => {
    set({ isLoading: true, error: null, currentClient: null });
    try {
      const response = await api.get(`/api/v1/clients/${id}`);

      if (response.status === 200) {
        set({ currentClient: response.data.client, isLoading: false });
        return;
      }
      throw new Error("Error al obtener cliente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener cliente";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createClient: async (data: ClientFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/v1/clients", { client: data });

      if (response.status === 201) {
        const { pagination } = get();
        await get().fetchClients(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al crear cliente");
    } catch (error: any) {
      let errorMessage = "Error al crear cliente";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateClient: async (id: number, data: ClientFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/clients/${id}`, { client: data });

      if (response.status === 200) {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...response.data.client } : c
          ),
          isLoading: false,
        }));
        return;
      }
      throw new Error("Error al actualizar cliente");
    } catch (error: any) {
      let errorMessage = "Error al actualizar cliente";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteClient: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/v1/clients/${id}`);

      if (response.status === 200) {
        const { pagination, currentFilters } = get();
        if (get().clients.length === 1 && pagination.current_page > 1) {
          await get().fetchClients(pagination.current_page - 1, pagination.per_page, currentFilters || {});
        } else {
          await get().fetchClients(pagination.current_page, pagination.per_page, currentFilters || {});
        }
        return;
      }
      throw new Error("Error al eliminar cliente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al eliminar cliente";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));

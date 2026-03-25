import { create } from "zustand";
import api from "../utils/api";
import type { Project, ProjectFormData } from "../types/project";

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface ProjectFilters {
  search?: string;
  status?: string;
  client_id?: number | string;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  currentFilters: ProjectFilters | null;
  fetchProjects: (
    page?: number,
    perPage?: number,
    filters?: ProjectFilters
  ) => Promise<void>;
  createProject: (data: ProjectFormData) => Promise<void>;
  updateProject: (id: number, data: ProjectFormData) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 12,
  },
  currentFilters: null,

  fetchProjects: async (page = 1, perPage = 12, filters = {}) => {
    set({ isLoading: true, error: null, currentFilters: filters });
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.client_id) params.client_id = filters.client_id;

      const response = await api.get("/api/v1/projects", { params });

      if (response.status === 200) {
        set({
          projects: response.data.projects,
          pagination: response.data.pagination,
          isLoading: false,
        });
        return;
      }
      throw new Error("Error al obtener proyectos");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener proyectos";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createProject: async (data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/v1/projects", { project: data });

      if (response.status === 201) {
        const { pagination } = get();
        await get().fetchProjects(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al crear proyecto");
    } catch (error: any) {
      let errorMessage = "Error al crear proyecto";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateProject: async (id: number, data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/projects/${id}`, { project: data });

      if (response.status === 200) {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...response.data.project } : p
          ),
          isLoading: false,
        }));
        return;
      }
      throw new Error("Error al actualizar proyecto");
    } catch (error: any) {
      let errorMessage = "Error al actualizar proyecto";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/v1/projects/${id}`);

      if (response.status === 200) {
        const { pagination, currentFilters } = get();
        if (get().projects.length === 1 && pagination.current_page > 1) {
          await get().fetchProjects(pagination.current_page - 1, pagination.per_page, currentFilters || {});
        } else {
          await get().fetchProjects(pagination.current_page, pagination.per_page, currentFilters || {});
        }
        return;
      }
      throw new Error("Error al eliminar proyecto");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al eliminar proyecto";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));

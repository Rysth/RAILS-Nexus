import { create } from "zustand";
import api from "../utils/api";
import type { Quote, QuoteFormData } from "../types/quote";

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface QuoteFilters {
  search?: string;
  status?: string;
  project_id?: number | string;
}

interface QuoteState {
  quotes: Quote[];
  currentQuote: Quote | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  currentFilters: QuoteFilters | null;
  fetchQuotes: (page?: number, perPage?: number, filters?: QuoteFilters) => Promise<void>;
  fetchQuote: (id: number) => Promise<Quote>;
  createQuote: (data: QuoteFormData) => Promise<void>;
  updateQuote: (id: number, data: QuoteFormData) => Promise<void>;
  deleteQuote: (id: number) => Promise<void>;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: [],
  currentQuote: null,
  isLoading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 12,
  },
  currentFilters: null,

  fetchQuotes: async (page = 1, perPage = 12, filters = {}) => {
    set({ isLoading: true, error: null, currentFilters: filters });
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.project_id) params.project_id = filters.project_id;

      const response = await api.get("/api/v1/quotes", { params });

      if (response.status === 200) {
        set({
          quotes: response.data.quotes,
          pagination: response.data.pagination,
          isLoading: false,
        });
        return;
      }
      throw new Error("Error al obtener cotizaciones");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener cotizaciones";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchQuote: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/v1/quotes/${id}`);

      if (response.status === 200) {
        const quote = response.data.quote;
        set({ currentQuote: quote, isLoading: false });
        return quote;
      }
      throw new Error("Error al obtener cotización");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener cotización";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createQuote: async (data: QuoteFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/v1/quotes", { quote: data });

      if (response.status === 201) {
        const { pagination } = get();
        await get().fetchQuotes(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al crear cotización");
    } catch (error: any) {
      let errorMessage = "Error al crear cotización";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateQuote: async (id: number, data: QuoteFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/quotes/${id}`, { quote: data });

      if (response.status === 200) {
        const { pagination } = get();
        await get().fetchQuotes(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al actualizar cotización");
    } catch (error: any) {
      let errorMessage = "Error al actualizar cotización";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteQuote: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/v1/quotes/${id}`);

      if (response.status === 200) {
        const { pagination } = get();
        await get().fetchQuotes(pagination.current_page, pagination.per_page);
        return;
      }
      throw new Error("Error al eliminar cotización");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al eliminar cotización";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));

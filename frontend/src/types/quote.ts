export interface QuoteItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Quote {
  id: number;
  project_id: number;
  project_name: string;
  client_name: string;
  issue_date: string;
  valid_until: string | null;
  status: string;
  total: number;
  items_count: number;
  quote_items?: QuoteItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteItemFormData {
  id?: number;
  description: string;
  quantity: number | string;
  unit_price: number | string;
  _destroy?: boolean;
}

export interface QuoteFormData {
  project_id: number | string;
  issue_date: string;
  valid_until: string;
  status: string;
  quote_items_attributes: QuoteItemFormData[];
}

export const QUOTE_STATUSES = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "approved", label: "Aprobada" },
  { value: "rejected", label: "Rechazada" },
] as const;

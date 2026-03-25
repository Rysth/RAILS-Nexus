export interface RecurringService {
  id: number;
  project_id: number;
  project_name: string;
  client_name: string;
  name: string;
  amount: number;
  billing_cycle: string;
  next_billing_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringServiceFormData {
  project_id: number | string;
  name: string;
  amount: number | string;
  billing_cycle: string;
  next_billing_date: string;
  status: string;
}

export const BILLING_CYCLES = [
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
  { value: "unique", label: "Único" },
] as const;

export const SERVICE_STATUSES = [
  { value: "active", label: "Activo" },
  { value: "paused", label: "Pausado" },
] as const;

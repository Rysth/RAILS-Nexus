export interface Project {
  id: number;
  client_id: number;
  client_name: string;
  name: string;
  production_url: string;
  start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  client_id: number | string;
  name: string;
  production_url: string;
  start_date: string;
  status: string;
}

export const PROJECT_STATUSES = [
  { value: "active", label: "Activo" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "canceled", label: "Cancelado" },
] as const;

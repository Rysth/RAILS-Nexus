export interface Client {
  id: number;
  name: string;
  identification_type: string;
  identification_type_label: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
  projects_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  identification_type: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
}

export const IDENTIFICATION_TYPES = [
  { value: "04", label: "RUC" },
  { value: "05", label: "Cédula" },
  { value: "06", label: "Pasaporte" },
] as const;

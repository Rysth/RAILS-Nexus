import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useProjectStore } from "../../../stores/projectStore";
import { useClientStore } from "../../../stores/clientStore";
import type { Project, ProjectFormData } from "../../../types/project";
import { PROJECT_STATUSES } from "../../../types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectsFormProps {
  project?: Project | null;
  defaultClientId?: number;
  onClose: () => void;
}

export default function ProjectsForm({
  project,
  defaultClientId,
  onClose,
}: ProjectsFormProps) {
  const {
    isLoading: storeLoading,
    createProject,
    updateProject,
  } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>();

  // Ensure clients are loaded for the dropdown
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients(1, 100);
    }
  }, [clients.length, fetchClients]);

  useEffect(() => {
    if (isEditing && project) {
      reset({
        client_id: project.client_id,
        name: project.name,
        production_url: project.production_url || "",
        start_date: project.start_date || "",
        status: project.status,
      });
    } else {
      reset({
        client_id: defaultClientId || "",
        name: "",
        production_url: "",
        start_date: "",
        status: "active",
      });
    }
  }, [isEditing, project, defaultClientId, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        client_id: Number(data.client_id),
      };

      if (isEditing && project) {
        await updateProject(project.id, payload);
        toast.success("Proyecto actualizado correctamente");
      } else {
        await createProject(payload);
        toast.success("Proyecto creado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} proyecto`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Client */}
      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente</Label>
        <select
          id="client_id"
          disabled={!!defaultClientId}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("client_id", {
            required: "Debes seleccionar un cliente",
          })}
        >
          <option value="">Seleccionar cliente...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.client_id && (
          <p className="text-sm text-destructive">{errors.client_id.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Proyecto</Label>
        <Input
          id="name"
          placeholder="Sitio Web Corporativo"
          {...register("name", {
            required: "El nombre del proyecto es requerido",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Production URL */}
        <div className="space-y-2">
          <Label htmlFor="production_url">URL de Producción</Label>
          <Input
            id="production_url"
            type="url"
            placeholder="https://ejemplo.com"
            {...register("production_url")}
          />
          {errors.production_url && (
            <p className="text-sm text-destructive">
              {errors.production_url.message}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Fecha de Inicio</Label>
          <Input id="start_date" type="date" {...register("start_date")} />
          {errors.start_date && (
            <p className="text-sm text-destructive">
              {errors.start_date.message}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register("status", { required: "El estado es requerido" })}
        >
          {PROJECT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || storeLoading}>
          {(isLoading || storeLoading) && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isEditing ? "Guardar Cambios" : "Crear Proyecto"}
        </Button>
      </div>
    </form>
  );
}

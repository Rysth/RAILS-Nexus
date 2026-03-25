import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRecurringServiceStore } from "../../../stores/recurringServiceStore";
import { useProjectStore } from "../../../stores/projectStore";
import type {
  RecurringService,
  RecurringServiceFormData,
} from "../../../types/recurringService";
import {
  BILLING_CYCLES,
  SERVICE_STATUSES,
} from "../../../types/recurringService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RecurringServicesFormProps {
  service?: RecurringService | null;
  defaultProjectId?: number;
  onClose: () => void;
}

export default function RecurringServicesForm({
  service,
  defaultProjectId,
  onClose,
}: RecurringServicesFormProps) {
  const {
    isLoading: storeLoading,
    createService,
    updateService,
  } = useRecurringServiceStore();
  const { projects, fetchProjects } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!service;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RecurringServiceFormData>();

  const billingCycle = watch("billing_cycle");

  // Ensure projects are loaded for the dropdown
  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects(1, 100);
    }
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (isEditing && service) {
      reset({
        project_id: service.project_id,
        name: service.name,
        amount: service.amount,
        billing_cycle: service.billing_cycle,
        next_billing_date: service.next_billing_date || "",
        status: service.status,
      });
    } else {
      reset({
        project_id: defaultProjectId || "",
        name: "",
        amount: "",
        billing_cycle: "monthly",
        next_billing_date: "",
        status: "active",
      });
    }
  }, [isEditing, service, defaultProjectId, reset]);

  const onSubmit = async (data: RecurringServiceFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        project_id: Number(data.project_id),
        amount: Number(data.amount),
      };

      if (isEditing && service) {
        await updateService(service.id, payload);
        toast.success("Servicio actualizado correctamente");
      } else {
        await createService(payload);
        toast.success("Servicio creado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} servicio`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Project */}
      <div className="space-y-2">
        <Label htmlFor="project_id">Proyecto</Label>
        <select
          id="project_id"
          disabled={!!defaultProjectId}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("project_id", {
            required: "Debes seleccionar un proyecto",
          })}
        >
          <option value="">Seleccionar proyecto...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} — {project.client_name}
            </option>
          ))}
        </select>
        {errors.project_id && (
          <p className="text-sm text-destructive">
            {errors.project_id.message}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Servicio</Label>
        <Input
          id="name"
          placeholder="Hosting, Dominio, Mantenimiento..."
          {...register("name", {
            required: "El nombre del servicio es requerido",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Monto ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("amount", {
              required: "El monto es requerido",
              min: { value: 0.01, message: "El monto debe ser mayor a 0" },
            })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        {/* Billing Cycle */}
        <div className="space-y-2">
          <Label htmlFor="billing_cycle">Ciclo de Facturación</Label>
          <select
            id="billing_cycle"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("billing_cycle", {
              required: "El ciclo de facturación es requerido",
            })}
          >
            {BILLING_CYCLES.map((cycle) => (
              <option key={cycle.value} value={cycle.value}>
                {cycle.label}
              </option>
            ))}
          </select>
          {errors.billing_cycle && (
            <p className="text-sm text-destructive">
              {errors.billing_cycle.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Next Billing Date - hidden when unique */}
        {billingCycle !== "unique" && (
          <div className="space-y-2">
            <Label htmlFor="next_billing_date">Próxima Fecha de Cobro</Label>
            <Input
              id="next_billing_date"
              type="date"
              {...register("next_billing_date")}
            />
            {errors.next_billing_date && (
              <p className="text-sm text-destructive">
                {errors.next_billing_date.message}
              </p>
            )}
          </div>
        )}

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("status", { required: "El estado es requerido" })}
          >
            {SERVICE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || storeLoading}>
          {(isLoading || storeLoading) && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isEditing ? "Guardar Cambios" : "Crear Servicio"}
        </Button>
      </div>
    </form>
  );
}

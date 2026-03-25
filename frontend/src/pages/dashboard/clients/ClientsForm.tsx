import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useClientStore } from "../../../stores/clientStore";
import type { Client, ClientFormData } from "../../../types/client";
import { IDENTIFICATION_TYPES } from "../../../types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientsFormProps {
  client?: Client | null;
  onClose: () => void;
}

export default function ClientsForm({ client, onClose }: ClientsFormProps) {
  const {
    isLoading: storeLoading,
    createClient,
    updateClient,
  } = useClientStore();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>();

  useEffect(() => {
    if (isEditing && client) {
      reset({
        name: client.name,
        identification_type: client.identification_type,
        identification: client.identification || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
    } else {
      reset({
        name: "",
        identification_type: "05",
        identification: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [isEditing, client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && client) {
        await updateClient(client.id, data);
        toast.success("Cliente actualizado correctamente");
      } else {
        await createClient(data);
        toast.success("Cliente creado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} cliente`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre / Razón Social</Label>
        <Input
          id="name"
          placeholder="Juan Pérez o Empresa S.A."
          {...register("name", {
            required: "El nombre es requerido",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Identification Type */}
        <div className="space-y-2">
          <Label htmlFor="identification_type">Tipo de Identificación</Label>
          <select
            id="identification_type"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("identification_type", {
              required: "Tipo de identificación es requerido",
            })}
          >
            {IDENTIFICATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.identification_type && (
            <p className="text-sm text-destructive">
              {errors.identification_type.message}
            </p>
          )}
        </div>

        {/* Identification */}
        <div className="space-y-2">
          <Label htmlFor="identification">Número de Identificación</Label>
          <Input
            id="identification"
            placeholder="0912345678"
            {...register("identification")}
          />
          {errors.identification && (
            <p className="text-sm text-destructive">
              {errors.identification.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="cliente@ejemplo.com"
            {...register("email", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido",
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" placeholder="0991234567" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea
          id="address"
          placeholder="Dirección del cliente"
          {...register("address")}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
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
          {isEditing ? "Guardar Cambios" : "Crear Cliente"}
        </Button>
      </div>
    </form>
  );
}

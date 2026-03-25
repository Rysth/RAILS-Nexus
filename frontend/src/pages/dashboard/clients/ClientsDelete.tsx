import toast from "react-hot-toast";
import { useClientStore } from "../../../stores/clientStore";
import { useAuthStore } from "../../../stores/authStore";
import type { Client } from "../../../types/client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ClientsDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientsDelete({
  isOpen,
  onClose,
  client,
}: ClientsDeleteProps) {
  const { isLoading, deleteClient } = useClientStore();
  const { hasPermission } = useAuthStore();
  const [confirmText, setConfirmText] = useState("");

  if (!client) return null;

  const canDelete = hasPermission("delete_clients");
  const isConfirmValid = confirmText === client.name;
  const hasProjects = (client.projects_count ?? 0) > 0;

  const handleDelete = async () => {
    if (!client) return;

    if (!canDelete) {
      toast.error("No tienes permisos para eliminar este cliente");
      onClose();
      return;
    }

    if (!isConfirmValid) {
      toast.error("El nombre no coincide");
      return;
    }

    try {
      await deleteClient(client.id);

      const { currentFilters, clients, pagination } = useClientStore.getState();
      const hasActiveFilters = Boolean(
        currentFilters?.search || currentFilters?.identification_type,
      );

      if (clients.length === 1 && pagination.current_page > 1) {
        toast.success(
          `Cliente ${client.name} eliminado. Mostrando página anterior.`,
        );
      } else if (hasActiveFilters) {
        toast.success(`Cliente ${client.name} eliminado con filtros activos.`);
      } else {
        toast.success(`Cliente ${client.name} eliminado correctamente.`);
      }

      setConfirmText("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el cliente");
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Eliminar Cliente
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {hasProjects && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <div className="text-destructive mt-0.5">⚠️</div>
                    <div>
                      <h4 className="font-semibold text-destructive">
                        Cliente con proyectos asociados
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Este cliente tiene {client.projects_count} proyecto(s)
                        asociado(s). No se puede eliminar hasta que se eliminen
                        o reasignen sus proyectos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!hasProjects && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <div className="text-destructive mt-0.5">⚠️</div>
                    <div>
                      <h4 className="font-semibold text-destructive">
                        ¡Advertencia!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Esta acción no se puede deshacer. Se eliminarán todos
                        los datos asociados a este cliente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium mb-2">Cliente a eliminar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Nombre:</span> {client.name}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    {client.email || "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Identificación:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {client.identification_type_label}
                    </Badge>{" "}
                    {client.identification || "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Proyectos:</span>{" "}
                    <Badge variant="secondary" className="ml-1">
                      {client.projects_count ?? 0}
                    </Badge>
                  </div>
                </div>
              </div>

              {!hasProjects && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-name">
                    Para confirmar, escribe el nombre del cliente:
                    <span className="ml-1 font-semibold">{client.name}</span>
                  </Label>
                  <Input
                    id="confirm-name"
                    type="text"
                    placeholder={client.name}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    disabled={isLoading}
                  />
                  {!isConfirmValid && confirmText.length > 0 && (
                    <p className="text-xs text-destructive">
                      El nombre no coincide con "{client.name}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || hasProjects || !isConfirmValid || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Eliminando...
              </>
            ) : (
              "Eliminar Cliente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import toast from "react-hot-toast";
import { useRecurringServiceStore } from "../../../stores/recurringServiceStore";
import { useAuthStore } from "../../../stores/authStore";
import type { RecurringService } from "../../../types/recurringService";
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

interface RecurringServicesDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  service: RecurringService | null;
}

const cycleLabels: Record<string, string> = {
  monthly: "Mensual",
  yearly: "Anual",
  unique: "Único",
};

const statusLabels: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
};

export default function RecurringServicesDelete({
  isOpen,
  onClose,
  service,
}: RecurringServicesDeleteProps) {
  const { isLoading, deleteService } = useRecurringServiceStore();
  const { hasPermission } = useAuthStore();
  const [confirmText, setConfirmText] = useState("");

  if (!service) return null;

  const canDelete = hasPermission("delete_recurring_services");
  const isConfirmValid = confirmText === service.name;

  const handleDelete = async () => {
    if (!service) return;

    if (!canDelete) {
      toast.error("No tienes permisos para eliminar este servicio");
      onClose();
      return;
    }

    if (!isConfirmValid) {
      toast.error("El nombre no coincide");
      return;
    }

    try {
      await deleteService(service.id);
      toast.success(`Servicio ${service.name} eliminado correctamente.`);
      setConfirmText("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el servicio");
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
            Eliminar Servicio Recurrente
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-start space-x-2">
                  <div className="text-destructive mt-0.5">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-destructive">
                      ¡Advertencia!
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Esta acción no se puede deshacer. Se eliminará
                      permanentemente este servicio recurrente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium mb-2">Servicio a eliminar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {service.name}
                  </div>
                  <div>
                    <span className="font-semibold">Proyecto:</span>{" "}
                    {service.project_name}
                  </div>
                  <div>
                    <span className="font-semibold">Monto:</span> $
                    {service.amount.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Ciclo:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {cycleLabels[service.billing_cycle] ||
                        service.billing_cycle}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold">Estado:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {statusLabels[service.status] || service.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-name">
                  Para confirmar, escribe el nombre del servicio:
                  <span className="ml-1 font-semibold">{service.name}</span>
                </Label>
                <Input
                  id="confirm-name"
                  type="text"
                  placeholder={service.name}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isLoading}
                />
                {!isConfirmValid && confirmText.length > 0 && (
                  <p className="text-xs text-destructive">
                    El nombre no coincide con "{service.name}"
                  </p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || !isConfirmValid || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Eliminando...
              </>
            ) : (
              "Eliminar Servicio"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

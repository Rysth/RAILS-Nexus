import toast from "react-hot-toast";
import { useQuoteStore } from "../../../stores/quoteStore";
import { useAuthStore } from "../../../stores/authStore";
import type { Quote } from "../../../types/quote";
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

interface QuotesDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export default function QuotesDelete({
  isOpen,
  onClose,
  quote,
}: QuotesDeleteProps) {
  const { isLoading, deleteQuote } = useQuoteStore();
  const { hasPermission } = useAuthStore();
  const [confirmText, setConfirmText] = useState("");

  if (!quote) return null;

  const canDelete = hasPermission("delete_quotes");
  const quoteLabel = `COT-${String(quote.id).padStart(4, "0")}`;
  const isConfirmValid = confirmText === quoteLabel;

  const handleDelete = async () => {
    if (!quote) return;

    if (!canDelete) {
      toast.error("No tienes permisos para eliminar esta cotización");
      onClose();
      return;
    }

    if (!isConfirmValid) {
      toast.error("El código no coincide");
      return;
    }

    try {
      await deleteQuote(quote.id);
      toast.success(`Cotización ${quoteLabel} eliminada correctamente.`);
      setConfirmText("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la cotización");
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
            Eliminar Cotización
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
                      permanentemente esta cotización y todos sus ítems.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium mb-2">Cotización a eliminar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Código:</span> {quoteLabel}
                  </div>
                  <div>
                    <span className="font-semibold">Proyecto:</span>{" "}
                    {quote.project_name}
                  </div>
                  <div>
                    <span className="font-semibold">Cliente:</span>{" "}
                    {quote.client_name}
                  </div>
                  <div>
                    <span className="font-semibold">Total:</span> $
                    {quote.total.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Ítems:</span>{" "}
                    {quote.items_count}
                  </div>
                  <div>
                    <span className="font-semibold">Estado:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {statusLabels[quote.status] || quote.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-code">
                  Para confirmar, escribe el código de la cotización:
                  <span className="ml-1 font-semibold">{quoteLabel}</span>
                </Label>
                <Input
                  id="confirm-code"
                  type="text"
                  placeholder={quoteLabel}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isLoading}
                />
                {!isConfirmValid && confirmText.length > 0 && (
                  <p className="text-xs text-destructive">
                    El código no coincide con "{quoteLabel}"
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
              "Eliminar Cotización"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

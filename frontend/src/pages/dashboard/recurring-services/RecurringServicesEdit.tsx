import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RecurringService } from "../../../types/recurringService";
import RecurringServicesForm from "./RecurringServicesForm";

interface RecurringServicesEditProps {
  isOpen: boolean;
  onClose: () => void;
  service: RecurringService | null;
}

export default function RecurringServicesEdit({
  isOpen,
  onClose,
  service,
}: RecurringServicesEditProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Servicio Recurrente</DialogTitle>
        </DialogHeader>
        <RecurringServicesForm service={service} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RecurringServicesForm from "./RecurringServicesForm";

interface RecurringServicesCreateProps {
  isOpen: boolean;
  defaultProjectId?: number;
  onClose: () => void;
}

export default function RecurringServicesCreate({
  isOpen,
  defaultProjectId,
  onClose,
}: RecurringServicesCreateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Servicio Recurrente</DialogTitle>
        </DialogHeader>
        <RecurringServicesForm
          defaultProjectId={defaultProjectId}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

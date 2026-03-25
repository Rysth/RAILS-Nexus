import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuotesForm from "./QuotesForm";

interface QuotesCreateProps {
  isOpen: boolean;
  defaultProjectId?: number;
  onClose: () => void;
}

export default function QuotesCreate({
  isOpen,
  defaultProjectId,
  onClose,
}: QuotesCreateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Cotización</DialogTitle>
        </DialogHeader>
        <QuotesForm defaultProjectId={defaultProjectId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

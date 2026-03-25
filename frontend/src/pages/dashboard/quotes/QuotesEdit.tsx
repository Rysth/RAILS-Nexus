import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Quote } from "../../../types/quote";
import QuotesForm from "./QuotesForm";

interface QuotesEditProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
}

export default function QuotesEdit({
  isOpen,
  onClose,
  quote,
}: QuotesEditProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cotización</DialogTitle>
        </DialogHeader>
        <QuotesForm quote={quote} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

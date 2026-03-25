import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientsForm from "./ClientsForm";

interface ClientsCreateProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientsCreate({ isOpen, onClose }: ClientsCreateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <ClientsForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

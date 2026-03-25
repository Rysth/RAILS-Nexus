import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Client } from "../../../types/client";
import ClientsForm from "./ClientsForm";

interface ClientsEditProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientsEdit({
  isOpen,
  onClose,
  client,
}: ClientsEditProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <ClientsForm client={client} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

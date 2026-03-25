import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectsForm from "./ProjectsForm";

interface ProjectsCreateProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectsCreate({
  isOpen,
  onClose,
}: ProjectsCreateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Proyecto</DialogTitle>
        </DialogHeader>
        <ProjectsForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

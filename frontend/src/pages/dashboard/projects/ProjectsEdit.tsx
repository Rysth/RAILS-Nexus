import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "../../../types/project";
import ProjectsForm from "./ProjectsForm";

interface ProjectsEditProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function ProjectsEdit({
  isOpen,
  onClose,
  project,
}: ProjectsEditProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proyecto</DialogTitle>
        </DialogHeader>
        <ProjectsForm project={project} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

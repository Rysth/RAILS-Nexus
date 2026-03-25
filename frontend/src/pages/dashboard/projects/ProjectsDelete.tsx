import toast from "react-hot-toast";
import { useProjectStore } from "../../../stores/projectStore";
import { useAuthStore } from "../../../stores/authStore";
import type { Project } from "../../../types/project";
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

interface ProjectsDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const statusLabels: Record<string, string> = {
  active: "Activo",
  maintenance: "Mantenimiento",
  canceled: "Cancelado",
};

export default function ProjectsDelete({
  isOpen,
  onClose,
  project,
}: ProjectsDeleteProps) {
  const { isLoading, deleteProject } = useProjectStore();
  const { hasPermission } = useAuthStore();
  const [confirmText, setConfirmText] = useState("");

  if (!project) return null;

  const canDelete = hasPermission("delete_projects");
  const isConfirmValid = confirmText === project.name;

  const handleDelete = async () => {
    if (!project) return;

    if (!canDelete) {
      toast.error("No tienes permisos para eliminar este proyecto");
      onClose();
      return;
    }

    if (!isConfirmValid) {
      toast.error("El nombre no coincide");
      return;
    }

    try {
      await deleteProject(project.id);

      const { currentFilters, projects, pagination } =
        useProjectStore.getState();
      const hasActiveFilters = Boolean(
        currentFilters?.search ||
        currentFilters?.status ||
        currentFilters?.client_id,
      );

      if (projects.length === 1 && pagination.current_page > 1) {
        toast.success(
          `Proyecto ${project.name} eliminado. Mostrando página anterior.`,
        );
      } else if (hasActiveFilters) {
        toast.success(
          `Proyecto ${project.name} eliminado con filtros activos.`,
        );
      } else {
        toast.success(`Proyecto ${project.name} eliminado correctamente.`);
      }

      setConfirmText("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el proyecto");
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
            Eliminar Proyecto
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
                      Esta acción no se puede deshacer. Se eliminarán todos los
                      datos asociados a este proyecto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium mb-2">Proyecto a eliminar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {project.name}
                  </div>
                  <div>
                    <span className="font-semibold">Cliente:</span>{" "}
                    {project.client_name}
                  </div>
                  <div>
                    <span className="font-semibold">Estado:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {statusLabels[project.status] || project.status}
                    </Badge>
                  </div>
                  {project.start_date && (
                    <div>
                      <span className="font-semibold">Inicio:</span>{" "}
                      {new Date(project.start_date).toLocaleDateString("es-EC")}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-name">
                  Para confirmar, escribe el nombre del proyecto:
                  <span className="ml-1 font-semibold">{project.name}</span>
                </Label>
                <Input
                  id="confirm-name"
                  type="text"
                  placeholder={project.name}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isLoading}
                />
                {!isConfirmValid && confirmText.length > 0 && (
                  <p className="text-xs text-destructive">
                    El nombre no coincide con "{project.name}"
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
              "Eliminar Proyecto"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

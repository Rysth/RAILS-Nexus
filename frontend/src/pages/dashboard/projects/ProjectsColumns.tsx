import { ColumnDef } from "@tanstack/react-table";
import type { Project } from "../../../types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";

interface ColumnsOptions {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  active: { label: "Activo", variant: "default" },
  maintenance: { label: "Mantenimiento", variant: "secondary" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

export function createProjectsColumns({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<Project>[] {
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Proyecto",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div>
            <p className="font-medium">{project.name}</p>
            {project.production_url && (
              <a
                href={project.production_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ExternalLink className="size-3" />
                {project.production_url}
              </a>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "client_name",
      header: "Cliente",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.client_name}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || {
          label: status,
          variant: "outline" as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: "start_date",
      header: "Fecha Inicio",
      cell: ({ row }) => {
        const date = row.original.start_date;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString("es-EC")}
          </span>
        );
      },
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(project)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
}

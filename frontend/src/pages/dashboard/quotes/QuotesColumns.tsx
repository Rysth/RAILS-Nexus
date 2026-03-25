import { ColumnDef } from "@tanstack/react-table";
import type { Quote } from "../../../types/quote";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface ColumnsOptions {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Borrador", variant: "secondary" },
  sent: { label: "Enviada", variant: "outline" },
  approved: { label: "Aprobada", variant: "default" },
  rejected: { label: "Rechazada", variant: "destructive" },
};

export function createQuotesColumns({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<Quote>[] {
  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <span className="font-medium text-muted-foreground">
          COT-{String(row.original.id).padStart(4, "0")}
        </span>
      ),
    },
    {
      accessorKey: "project_name",
      header: "Proyecto",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.project_name}</p>
          <span className="text-xs text-muted-foreground">
            {row.original.client_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Fecha Emisión",
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.issue_date).toLocaleDateString("es-EC")}
        </span>
      ),
    },
    {
      accessorKey: "valid_until",
      header: "Válida Hasta",
      cell: ({ row }) => {
        const date = row.original.valid_until;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString("es-EC")}
          </span>
        );
      },
    },
    {
      accessorKey: "items_count",
      header: "Ítems",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.items_count}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          ${row.original.total.toFixed(2)}
        </span>
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
  ];

  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const quote = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(quote)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(quote)}
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

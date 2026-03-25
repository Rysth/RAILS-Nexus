import { ColumnDef } from "@tanstack/react-table";
import type { RecurringService } from "../../../types/recurringService";
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
  onEdit: (service: RecurringService) => void;
  onDelete: (service: RecurringService) => void;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  active: { label: "Activo", variant: "default" },
  paused: { label: "Pausado", variant: "secondary" },
};

const cycleConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  monthly: { label: "Mensual", variant: "outline" },
  yearly: { label: "Anual", variant: "secondary" },
  unique: { label: "Único", variant: "default" },
};

export function createRecurringServicesColumns({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<RecurringService>[] {
  const columns: ColumnDef<RecurringService>[] = [
    {
      accessorKey: "name",
      header: "Servicio",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <span className="text-xs text-muted-foreground">
            {row.original.project_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Cliente",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.client_name}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          ${row.original.amount.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "billing_cycle",
      header: "Ciclo",
      cell: ({ row }) => {
        const cycle = row.original.billing_cycle;
        const config = cycleConfig[cycle] || {
          label: cycle,
          variant: "outline" as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: "next_billing_date",
      header: "Próximo Cobro",
      cell: ({ row }) => {
        const date = row.original.next_billing_date;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString("es-EC")}
          </span>
        );
      },
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
        const service = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(service)}
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

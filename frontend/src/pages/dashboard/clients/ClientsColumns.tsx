"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Client } from "../../../types/client";

interface ColumnsProps {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  canManageClients: boolean;
  canDeleteClients: boolean;
}

const getIdTypeConfig = (type: string) => {
  const config: Record<string, { label: string; variant: string }> = {
    "04": { label: "RUC", variant: "default" },
    "05": { label: "Cédula", variant: "secondary" },
    "06": { label: "Pasaporte", variant: "outline" },
  };
  return config[type] || { label: type, variant: "outline" };
};

export const createClientsColumns = ({
  onEdit,
  onDelete,
  canManageClients,
  canDeleteClients,
}: ColumnsProps): ColumnDef<Client>[] => [
  {
    accessorKey: "name",
    header: "Cliente",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{client.name}</span>
          {client.email && (
            <span className="text-xs text-muted-foreground">
              {client.email}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "identification",
    header: "Identificación",
    cell: ({ row }) => {
      const client = row.original;
      const idType = getIdTypeConfig(client.identification_type);
      return (
        <div className="flex items-center gap-2">
          <Badge variant={idType.variant as any} className="text-xs">
            {idType.label}
          </Badge>
          <span className="text-sm">{client.identification || "—"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("phone") || "—"}</span>
    ),
  },
  {
    accessorKey: "projects_count",
    header: "Proyectos",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("projects_count")}</Badge>
    ),
  },
  ...(canManageClients || canDeleteClients
    ? [
        {
          id: "actions",
          header: "Acciones",
          cell: ({ row }: { row: any }) => {
            const client = row.original;
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
                  {canManageClients && (
                    <DropdownMenuItem onClick={() => onEdit(client)}>
                      Editar cliente
                    </DropdownMenuItem>
                  )}
                  {canDeleteClients && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(client)}
                        disabled={client.projects_count > 0}
                        className="text-red-600"
                      >
                        Eliminar cliente
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        } as ColumnDef<Client>,
      ]
    : []),
];

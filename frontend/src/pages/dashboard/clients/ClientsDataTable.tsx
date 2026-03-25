"use client";

import * as React from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Plus, X, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";
import { IDENTIFICATION_TYPES } from "../../../types/client";

interface ClientsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onCreateClient?: () => void;
  onFilterChange?: (filters: any) => void;
  onSearchChange?: (term: string) => void;
  onPageChange?: (selectedItem: { selected: number }) => void;
  canManageClients: boolean;
  isLoading: boolean;
  pagination?: {
    currentPage: number;
    pageCount: number;
    totalCount: number;
    perPage: number;
  };
}

export function ClientsDataTable<TData, TValue>({
  columns,
  data,
  onCreateClient,
  onFilterChange,
  onSearchChange,
  onPageChange,
  canManageClients,
  isLoading,
  pagination,
}: ClientsDataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedIdType, setSelectedIdType] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualSorting: true,
    manualFiltering: true,
    state: {
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center flex-1 gap-2 space-x-2">
          <SearchBar
            placeholder="Buscar clientes..."
            value={searchValue}
            onSearch={(term) => {
              setSearchValue(term);
              onSearchChange?.(term);
            }}
            className="max-w-sm"
          />

          {onFilterChange && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {selectedIdType === ""
                      ? "Tipo de ID"
                      : IDENTIFICATION_TYPES.find(
                          (t) => t.value === selectedIdType,
                        )?.label || "Filtrar"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuCheckboxItem
                    checked={selectedIdType === ""}
                    onCheckedChange={() => {
                      setSelectedIdType("");
                      onFilterChange({ identification_type: "" });
                    }}
                  >
                    Todos los tipos
                  </DropdownMenuCheckboxItem>
                  {IDENTIFICATION_TYPES.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type.value}
                      checked={selectedIdType === type.value}
                      onCheckedChange={() => {
                        setSelectedIdType(type.value);
                        onFilterChange({ identification_type: type.value });
                      }}
                    >
                      {type.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchValue !== "" || selectedIdType !== "") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchValue("");
                    setSelectedIdType("");
                    onSearchChange?.("");
                    onFilterChange({ identification_type: "" });
                  }}
                  className="h-8 px-2 lg:px-3"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columnas <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {canManageClients && onCreateClient && (
            <Button onClick={onCreateClient} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Listado de Clientes</CardTitle>
                <CardDescription>
                  {pagination
                    ? `Mostrando ${data.length} de ${pagination.totalCount} resultados`
                    : `${data.length} clientes`}
                </CardDescription>
              </div>
            </div>
            {pagination && (
              <Badge variant="secondary" className="tabular-nums">
                Página {pagination.currentPage + 1} de {pagination.pageCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 rounded bg-muted animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="size-8 opacity-40" />
                        <p className="font-medium">
                          No se encontraron clientes
                        </p>
                        <p className="text-sm">
                          Intenta ajustar los filtros de búsqueda.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.pageCount > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          pageCount={pagination.pageCount}
          perPage={pagination.perPage}
          totalCount={pagination.totalCount}
          onPageChange={onPageChange || (() => {})}
        />
      )}
    </div>
  );
}

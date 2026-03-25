import { useEffect, useRef, useReducer, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useClientStore } from "../../../stores/clientStore";
import { toast } from "react-hot-toast";
import { ClientsDataTable } from "./ClientsDataTable";
import { createClientsColumns } from "./ClientsColumns";
import ClientsDelete from "./ClientsDelete";
import ClientsCreate from "./ClientsCreate";
import ClientsEdit from "./ClientsEdit";
import { StatsCard } from "@/components/ui/stats-card";
import { Users, FolderKanban, FileText, CreditCard } from "lucide-react";
import type { Client } from "../../../types/client";

// ── State & Reducer ─────────────────────────────────────────

interface ClientsState {
  searchTerm: string;
  perPage: number;
  filters: Record<string, unknown>;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  editModalOpen: boolean;
  clientToDelete: Client | null;
  clientToEdit: Client | null;
}

type ClientsAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Record<string, unknown> }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "OPEN_DELETE"; payload: Client }
  | { type: "CLOSE_DELETE" }
  | { type: "OPEN_EDIT"; payload: Client }
  | { type: "CLOSE_EDIT" };

const initialState: ClientsState = {
  searchTerm: "",
  perPage: 12,
  filters: {},
  createModalOpen: false,
  deleteModalOpen: false,
  editModalOpen: false,
  clientToDelete: null,
  clientToEdit: null,
};

function clientsReducer(
  state: ClientsState,
  action: ClientsAction,
): ClientsState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: action.payload };
    case "OPEN_CREATE":
      return { ...state, createModalOpen: true };
    case "CLOSE_CREATE":
      return { ...state, createModalOpen: false };
    case "OPEN_DELETE":
      return {
        ...state,
        deleteModalOpen: true,
        clientToDelete: action.payload,
      };
    case "CLOSE_DELETE":
      return { ...state, deleteModalOpen: false, clientToDelete: null };
    case "OPEN_EDIT":
      return { ...state, editModalOpen: true, clientToEdit: action.payload };
    case "CLOSE_EDIT":
      return { ...state, editModalOpen: false, clientToEdit: null };
    default:
      return state;
  }
}

// ── Component ───────────────────────────────────────────────

export default function ClientsIndex() {
  const { hasPermission } = useAuthStore();
  const { clients, isLoading, fetchClients, pagination } = useClientStore();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(clientsReducer, initialState);
  const isMounted = useRef(false);
  const canManageClients = hasPermission("edit_clients");
  const canDeleteClients = hasPermission("delete_clients");

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const loadClients = async () => {
      try {
        const allFilters = { ...state.filters, search: state.searchTerm };
        await fetchClients(1, state.perPage, allFilters);
      } catch (fetchError: any) {
        if (isMounted.current) {
          toast.error(fetchError.message || "Error al cargar clientes");
        }
      }
    };

    loadClients();
  }, [fetchClients, state.perPage, state.searchTerm, state.filters]);

  const handleViewClick = (client: Client) => {
    navigate(`/dashboard/clients/${client.id}`);
  };

  const handleDeleteClick = (client: Client) => {
    if (client.projects_count > 0) {
      toast.error("No se puede eliminar un cliente con proyectos asociados");
      return;
    }
    dispatch({ type: "OPEN_DELETE", payload: client });
  };

  const handleEditClick = (client: Client) => {
    dispatch({ type: "OPEN_EDIT", payload: client });
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  };

  const handleSearchChange = (term: string) => {
    dispatch({ type: "SET_SEARCH", payload: term });
  };

  const handlePageChange = (selectedItem: { selected: number }) => {
    const page = selectedItem.selected + 1;
    const allFilters = { ...state.filters, search: state.searchTerm };
    fetchClients(page, state.perPage, allFilters);
  };

  const columns = createClientsColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onView: handleViewClick,
    canManageClients: !!canManageClients,
    canDeleteClients: !!canDeleteClients,
  });

  const stats = useMemo(() => {
    const total = pagination?.total_count ?? clients.length;
    const withProjects = clients.filter((c) => c.projects_count > 0).length;
    const totalProjects = clients.reduce((sum, c) => sum + c.projects_count, 0);
    const idTypes = clients.reduce<Record<string, number>>((acc, c) => {
      const label =
        c.identification_type === "04"
          ? "RUC"
          : c.identification_type === "05"
            ? "Cédula"
            : "Pasaporte";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    const topIdType =
      Object.entries(idTypes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { total, withProjects, totalProjects, topIdType };
  }, [clients, pagination]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona tu cartera de clientes y sus proyectos asociados.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clientes"
          value={stats.total}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Con Proyectos"
          value={stats.withProjects}
          description={`de ${clients.length} clientes visibles`}
          icon={FolderKanban}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          title="Total Proyectos"
          value={stats.totalProjects}
          description="asociados a estos clientes"
          icon={FileText}
          iconColor="text-violet-600"
          iconBgColor="bg-violet-100"
        />
        <StatsCard
          title="Tipo Más Frecuente"
          value={stats.topIdType}
          description="tipo de identificación"
          icon={CreditCard}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
      </div>

      {/* Data Table */}
      <ClientsDataTable
        columns={columns}
        data={clients}
        onCreateClient={() => dispatch({ type: "OPEN_CREATE" })}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        canManageClients={!!canManageClients}
        isLoading={isLoading}
        pagination={
          pagination
            ? {
                currentPage: pagination.current_page - 1,
                pageCount: pagination.total_pages,
                totalCount: pagination.total_count,
                perPage: pagination.per_page,
              }
            : undefined
        }
      />

      <ClientsCreate
        isOpen={state.createModalOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      />

      <ClientsEdit
        isOpen={state.editModalOpen}
        onClose={() => dispatch({ type: "CLOSE_EDIT" })}
        client={state.clientToEdit}
      />

      <ClientsDelete
        isOpen={state.deleteModalOpen}
        onClose={() => dispatch({ type: "CLOSE_DELETE" })}
        client={state.clientToDelete}
      />
    </div>
  );
}

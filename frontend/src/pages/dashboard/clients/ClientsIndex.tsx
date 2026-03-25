import { useEffect, useRef, useReducer } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useClientStore } from "../../../stores/clientStore";
import { toast } from "react-hot-toast";
import { ClientsDataTable } from "./ClientsDataTable";
import { createClientsColumns } from "./ClientsColumns";
import ClientsDelete from "./ClientsDelete";
import ClientsCreate from "./ClientsCreate";
import ClientsEdit from "./ClientsEdit";
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
    canManageClients: !!canManageClients,
    canDeleteClients: !!canDeleteClients,
  });

  return (
    <div className="space-y-6">
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

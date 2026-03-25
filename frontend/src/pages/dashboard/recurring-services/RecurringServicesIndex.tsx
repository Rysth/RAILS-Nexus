import { useEffect, useRef, useReducer, useMemo } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useRecurringServiceStore } from "../../../stores/recurringServiceStore";
import { useProjectStore } from "../../../stores/projectStore";
import { toast } from "react-hot-toast";
import { RecurringServicesDataTable } from "./RecurringServicesDataTable";
import { createRecurringServicesColumns } from "./RecurringServicesColumns";
import RecurringServicesDelete from "./RecurringServicesDelete";
import RecurringServicesCreate from "./RecurringServicesCreate";
import RecurringServicesEdit from "./RecurringServicesEdit";
import { StatsCard } from "@/components/ui/stats-card";
import { RefreshCw, DollarSign, Play, Pause } from "lucide-react";
import type { RecurringService } from "../../../types/recurringService";

// ── State & Reducer ─────────────────────────────────────────

interface ServicesState {
  searchTerm: string;
  perPage: number;
  filters: Record<string, unknown>;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  editModalOpen: boolean;
  serviceToDelete: RecurringService | null;
  serviceToEdit: RecurringService | null;
}

type ServicesAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Record<string, unknown> }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "OPEN_DELETE"; payload: RecurringService }
  | { type: "CLOSE_DELETE" }
  | { type: "OPEN_EDIT"; payload: RecurringService }
  | { type: "CLOSE_EDIT" };

const initialState: ServicesState = {
  searchTerm: "",
  perPage: 12,
  filters: {},
  createModalOpen: false,
  deleteModalOpen: false,
  editModalOpen: false,
  serviceToDelete: null,
  serviceToEdit: null,
};

function servicesReducer(
  state: ServicesState,
  action: ServicesAction,
): ServicesState {
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
        serviceToDelete: action.payload,
      };
    case "CLOSE_DELETE":
      return { ...state, deleteModalOpen: false, serviceToDelete: null };
    case "OPEN_EDIT":
      return { ...state, editModalOpen: true, serviceToEdit: action.payload };
    case "CLOSE_EDIT":
      return { ...state, editModalOpen: false, serviceToEdit: null };
    default:
      return state;
  }
}

// ── Component ───────────────────────────────────────────────

export default function RecurringServicesIndex() {
  const { hasPermission } = useAuthStore();
  const { services, isLoading, fetchServices, pagination } =
    useRecurringServiceStore();
  const { fetchProjects } = useProjectStore();

  const [state, dispatch] = useReducer(servicesReducer, initialState);
  const isMounted = useRef(false);
  const canCreate = hasPermission("create_recurring_services");
  const canEdit = hasPermission("edit_recurring_services");
  const canDelete = hasPermission("delete_recurring_services");

  useEffect(() => {
    isMounted.current = true;
    // Pre-fetch projects for the form dropdown
    fetchProjects(1, 100).catch(() => {});
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const loadServices = async () => {
      try {
        const allFilters = { ...state.filters, search: state.searchTerm };
        await fetchServices(1, state.perPage, allFilters);
      } catch (fetchError: any) {
        if (isMounted.current) {
          toast.error(
            fetchError.message || "Error al cargar servicios recurrentes",
          );
        }
      }
    };

    loadServices();
  }, [fetchServices, state.perPage, state.searchTerm, state.filters]);

  const handleDeleteClick = (service: RecurringService) => {
    dispatch({ type: "OPEN_DELETE", payload: service });
  };

  const handleEditClick = (service: RecurringService) => {
    dispatch({ type: "OPEN_EDIT", payload: service });
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
    fetchServices(page, state.perPage, allFilters);
  };

  const columns = createRecurringServicesColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    canEdit: !!canEdit,
    canDelete: !!canDelete,
  });

  const stats = useMemo(() => {
    const total = pagination?.total_count ?? services.length;
    const active = services.filter((s) => s.status === "active").length;
    const paused = services.filter((s) => s.status === "paused").length;
    const totalRevenue = services
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.amount, 0);
    return { total, active, paused, totalRevenue };
  }, [services, pagination]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Servicios Recurrentes
        </h1>
        <p className="text-muted-foreground">
          Gestiona los servicios recurrentes asociados a tus proyectos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Servicios"
          value={stats.total}
          icon={RefreshCw}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Activos"
          value={stats.active}
          description="generando cobros"
          icon={Play}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          title="Pausados"
          value={stats.paused}
          description="sin cobro activo"
          icon={Pause}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <StatsCard
          title="Ingreso Activo"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          description="servicios activos"
          icon={DollarSign}
          iconColor="text-violet-600"
          iconBgColor="bg-violet-100"
        />
      </div>

      {/* Data Table */}
      <RecurringServicesDataTable
        columns={columns}
        data={services}
        onCreateService={() => dispatch({ type: "OPEN_CREATE" })}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        canCreate={!!canCreate}
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

      <RecurringServicesCreate
        isOpen={state.createModalOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      />

      <RecurringServicesEdit
        isOpen={state.editModalOpen}
        onClose={() => dispatch({ type: "CLOSE_EDIT" })}
        service={state.serviceToEdit}
      />

      <RecurringServicesDelete
        isOpen={state.deleteModalOpen}
        onClose={() => dispatch({ type: "CLOSE_DELETE" })}
        service={state.serviceToDelete}
      />
    </div>
  );
}

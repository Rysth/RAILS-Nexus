import { useEffect, useRef, useReducer, useMemo } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useQuoteStore } from "../../../stores/quoteStore";
import { useProjectStore } from "../../../stores/projectStore";
import { toast } from "react-hot-toast";
import { QuotesDataTable } from "./QuotesDataTable";
import { createQuotesColumns } from "./QuotesColumns";
import QuotesDelete from "./QuotesDelete";
import QuotesCreate from "./QuotesCreate";
import QuotesEdit from "./QuotesEdit";
import { StatsCard } from "@/components/ui/stats-card";
import { FileText, DollarSign, CheckCircle, Clock } from "lucide-react";
import type { Quote } from "../../../types/quote";

// ── State & Reducer ─────────────────────────────────────────

interface QuotesState {
  searchTerm: string;
  perPage: number;
  filters: Record<string, unknown>;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  editModalOpen: boolean;
  quoteToDelete: Quote | null;
  quoteToEdit: Quote | null;
}

type QuotesAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Record<string, unknown> }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "OPEN_DELETE"; payload: Quote }
  | { type: "CLOSE_DELETE" }
  | { type: "OPEN_EDIT"; payload: Quote }
  | { type: "CLOSE_EDIT" };

const initialState: QuotesState = {
  searchTerm: "",
  perPage: 12,
  filters: {},
  createModalOpen: false,
  deleteModalOpen: false,
  editModalOpen: false,
  quoteToDelete: null,
  quoteToEdit: null,
};

function quotesReducer(state: QuotesState, action: QuotesAction): QuotesState {
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
      return { ...state, deleteModalOpen: true, quoteToDelete: action.payload };
    case "CLOSE_DELETE":
      return { ...state, deleteModalOpen: false, quoteToDelete: null };
    case "OPEN_EDIT":
      return { ...state, editModalOpen: true, quoteToEdit: action.payload };
    case "CLOSE_EDIT":
      return { ...state, editModalOpen: false, quoteToEdit: null };
    default:
      return state;
  }
}

// ── Component ───────────────────────────────────────────────

export default function QuotesIndex() {
  const { hasPermission } = useAuthStore();
  const { quotes, isLoading, fetchQuotes, pagination } = useQuoteStore();
  const { fetchProjects } = useProjectStore();

  const [state, dispatch] = useReducer(quotesReducer, initialState);
  const isMounted = useRef(false);
  const canCreate = hasPermission("create_quotes");
  const canEdit = hasPermission("edit_quotes");
  const canDelete = hasPermission("delete_quotes");

  useEffect(() => {
    isMounted.current = true;
    fetchProjects(1, 100).catch(() => {});
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const loadQuotes = async () => {
      try {
        const allFilters = { ...state.filters, search: state.searchTerm };
        await fetchQuotes(1, state.perPage, allFilters);
      } catch (fetchError: any) {
        if (isMounted.current) {
          toast.error(fetchError.message || "Error al cargar cotizaciones");
        }
      }
    };

    loadQuotes();
  }, [fetchQuotes, state.perPage, state.searchTerm, state.filters]);

  const handleDeleteClick = (quote: Quote) => {
    dispatch({ type: "OPEN_DELETE", payload: quote });
  };

  const handleEditClick = (quote: Quote) => {
    dispatch({ type: "OPEN_EDIT", payload: quote });
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
    fetchQuotes(page, state.perPage, allFilters);
  };

  const columns = createQuotesColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    canEdit: !!canEdit,
    canDelete: !!canDelete,
  });

  const stats = useMemo(() => {
    const total = pagination?.total_count ?? quotes.length;
    const approved = quotes.filter((q) => q.status === "approved").length;
    const pending = quotes.filter(
      (q) => q.status === "draft" || q.status === "sent",
    ).length;
    const totalValue = quotes
      .filter((q) => q.status === "approved")
      .reduce((sum, q) => sum + q.total, 0);
    return { total, approved, pending, totalValue };
  }, [quotes, pagination]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
        <p className="text-muted-foreground">
          Gestiona las cotizaciones de tus proyectos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Cotizaciones"
          value={stats.total}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Aprobadas"
          value={stats.approved}
          description="cotizaciones aceptadas"
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pending}
          description="borrador o enviadas"
          icon={Clock}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <StatsCard
          title="Valor Aprobado"
          value={`$${stats.totalValue.toFixed(2)}`}
          description="cotizaciones aprobadas"
          icon={DollarSign}
          iconColor="text-violet-600"
          iconBgColor="bg-violet-100"
        />
      </div>

      {/* Data Table */}
      <QuotesDataTable
        columns={columns}
        data={quotes}
        onCreateQuote={() => dispatch({ type: "OPEN_CREATE" })}
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

      <QuotesCreate
        isOpen={state.createModalOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      />

      <QuotesEdit
        isOpen={state.editModalOpen}
        onClose={() => dispatch({ type: "CLOSE_EDIT" })}
        quote={state.quoteToEdit}
      />

      <QuotesDelete
        isOpen={state.deleteModalOpen}
        onClose={() => dispatch({ type: "CLOSE_DELETE" })}
        quote={state.quoteToDelete}
      />
    </div>
  );
}

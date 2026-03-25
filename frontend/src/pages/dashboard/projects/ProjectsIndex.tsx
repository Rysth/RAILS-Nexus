import { useEffect, useRef, useReducer, useMemo } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useProjectStore } from "../../../stores/projectStore";
import { useClientStore } from "../../../stores/clientStore";
import { toast } from "react-hot-toast";
import { ProjectsDataTable } from "./ProjectsDataTable";
import { createProjectsColumns } from "./ProjectsColumns";
import ProjectsDelete from "./ProjectsDelete";
import ProjectsCreate from "./ProjectsCreate";
import ProjectsEdit from "./ProjectsEdit";
import { StatsCard } from "@/components/ui/stats-card";
import { FolderKanban, Activity, Wrench, XCircle } from "lucide-react";
import type { Project } from "../../../types/project";

// ── State & Reducer ─────────────────────────────────────────

interface ProjectsState {
  searchTerm: string;
  perPage: number;
  filters: Record<string, unknown>;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  editModalOpen: boolean;
  projectToDelete: Project | null;
  projectToEdit: Project | null;
}

type ProjectsAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Record<string, unknown> }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "OPEN_DELETE"; payload: Project }
  | { type: "CLOSE_DELETE" }
  | { type: "OPEN_EDIT"; payload: Project }
  | { type: "CLOSE_EDIT" };

const initialState: ProjectsState = {
  searchTerm: "",
  perPage: 12,
  filters: {},
  createModalOpen: false,
  deleteModalOpen: false,
  editModalOpen: false,
  projectToDelete: null,
  projectToEdit: null,
};

function projectsReducer(
  state: ProjectsState,
  action: ProjectsAction,
): ProjectsState {
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
        projectToDelete: action.payload,
      };
    case "CLOSE_DELETE":
      return { ...state, deleteModalOpen: false, projectToDelete: null };
    case "OPEN_EDIT":
      return { ...state, editModalOpen: true, projectToEdit: action.payload };
    case "CLOSE_EDIT":
      return { ...state, editModalOpen: false, projectToEdit: null };
    default:
      return state;
  }
}

// ── Component ───────────────────────────────────────────────

export default function ProjectsIndex() {
  const { hasPermission } = useAuthStore();
  const { projects, isLoading, fetchProjects, pagination } = useProjectStore();
  const { fetchClients } = useClientStore();

  const [state, dispatch] = useReducer(projectsReducer, initialState);
  const isMounted = useRef(false);
  const canManageProjects = hasPermission("edit_projects");
  const canDeleteProjects = hasPermission("delete_projects");

  useEffect(() => {
    isMounted.current = true;
    // Pre-fetch clients for the form dropdown
    fetchClients(1, 100).catch(() => {});
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const loadProjects = async () => {
      try {
        const allFilters = { ...state.filters, search: state.searchTerm };
        await fetchProjects(1, state.perPage, allFilters);
      } catch (fetchError: any) {
        if (isMounted.current) {
          toast.error(fetchError.message || "Error al cargar proyectos");
        }
      }
    };

    loadProjects();
  }, [fetchProjects, state.perPage, state.searchTerm, state.filters]);

  const handleDeleteClick = (project: Project) => {
    dispatch({ type: "OPEN_DELETE", payload: project });
  };

  const handleEditClick = (project: Project) => {
    dispatch({ type: "OPEN_EDIT", payload: project });
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
    fetchProjects(page, state.perPage, allFilters);
  };

  const columns = createProjectsColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    canEdit: !!canManageProjects,
    canDelete: !!canDeleteProjects,
  });

  const stats = useMemo(() => {
    const total = pagination?.total_count ?? projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const maintenance = projects.filter(
      (p) => p.status === "maintenance",
    ).length;
    const canceled = projects.filter((p) => p.status === "canceled").length;
    return { total, active, maintenance, canceled };
  }, [projects, pagination]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proyectos</h1>
        <p className="text-muted-foreground">
          Visualiza y administra todos los proyectos de tus clientes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Proyectos"
          value={stats.total}
          icon={FolderKanban}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Activos"
          value={stats.active}
          description="en producción"
          icon={Activity}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          title="Mantenimiento"
          value={stats.maintenance}
          description="en soporte"
          icon={Wrench}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <StatsCard
          title="Cancelados"
          value={stats.canceled}
          description="dados de baja"
          icon={XCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Data Table */}
      <ProjectsDataTable
        columns={columns}
        data={projects}
        onCreateProject={() => dispatch({ type: "OPEN_CREATE" })}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        canManageProjects={!!canManageProjects}
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

      <ProjectsCreate
        isOpen={state.createModalOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      />

      <ProjectsEdit
        isOpen={state.editModalOpen}
        onClose={() => dispatch({ type: "CLOSE_EDIT" })}
        project={state.projectToEdit}
      />

      <ProjectsDelete
        isOpen={state.deleteModalOpen}
        onClose={() => dispatch({ type: "CLOSE_DELETE" })}
        project={state.projectToDelete}
      />
    </div>
  );
}

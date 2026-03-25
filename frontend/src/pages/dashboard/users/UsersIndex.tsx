import { useEffect, useRef, useReducer } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useUserStore, User } from "../../../stores/userStore";
import { toast } from "react-hot-toast";
import { UsersDataTable } from "./UsersDataTable";
import { createUsersColumns } from "./UsersColumns";
import UsersDelete from "./UsersDelete";
import UsersCreate from "./UsersCreate";
import UsersEdit from "./UsersEdit";
import UsersUpdatePassword from "./UsersUpdatePassword";

// ── State & Reducer ─────────────────────────────────────────

interface UsersState {
  searchTerm: string;
  perPage: number;
  filters: Record<string, unknown>;
  createModalOpen: boolean;
  deleteModalOpen: boolean;
  editModalOpen: boolean;
  passwordModalOpen: boolean;
  userToDelete: User | null;
  userToEdit: User | null;
  userToUpdatePassword: User | null;
  confirmingUserId: number | null;
}

type UsersAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Record<string, unknown> }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "OPEN_DELETE"; payload: User }
  | { type: "CLOSE_DELETE" }
  | { type: "OPEN_EDIT"; payload: User }
  | { type: "CLOSE_EDIT" }
  | { type: "OPEN_PASSWORD"; payload: User }
  | { type: "CLOSE_PASSWORD" }
  | { type: "SET_CONFIRMING"; payload: number | null };

const initialState: UsersState = {
  searchTerm: "",
  perPage: 12,
  filters: {},
  createModalOpen: false,
  deleteModalOpen: false,
  editModalOpen: false,
  passwordModalOpen: false,
  userToDelete: null,
  userToEdit: null,
  userToUpdatePassword: null,
  confirmingUserId: null,
};

function usersReducer(state: UsersState, action: UsersAction): UsersState {
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
      return { ...state, deleteModalOpen: true, userToDelete: action.payload };
    case "CLOSE_DELETE":
      return { ...state, deleteModalOpen: false, userToDelete: null };
    case "OPEN_EDIT":
      return { ...state, editModalOpen: true, userToEdit: action.payload };
    case "CLOSE_EDIT":
      return { ...state, editModalOpen: false, userToEdit: null };
    case "OPEN_PASSWORD":
      return { ...state, passwordModalOpen: true, userToUpdatePassword: action.payload };
    case "CLOSE_PASSWORD":
      return { ...state, passwordModalOpen: false, userToUpdatePassword: null };
    case "SET_CONFIRMING":
      return { ...state, confirmingUserId: action.payload };
    default:
      return state;
  }
}

// ── Component ───────────────────────────────────────────────

export default function UsersIndex() {
  const { user: currentUser, hasPermission, hasRole } = useAuthStore();
  const {
    users,
    isLoading,
    isExporting,
    fetchUsers,
    toggleUserConfirmation,
    exportUsers,
    pagination,
  } = useUserStore();

  const [state, dispatch] = useReducer(usersReducer, initialState);
  const isMounted = useRef(false);
  const canManageUsers = hasPermission("edit_users");

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const loadUsers = async () => {
      try {
        const allFilters = {
          ...state.filters,
          search: state.searchTerm,
        };
        await fetchUsers(1, state.perPage, allFilters);
      } catch (fetchError: any) {
        if (isMounted.current) {
          toast.error(fetchError.message || "Error al cargar usuarios");
        }
      }
    };

    loadUsers();
  }, [fetchUsers, state.perPage, state.searchTerm, state.filters]);

  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("No puedes eliminar tu propio usuario");
      return;
    }
    if (user.roles.includes("admin") && !hasRole("admin")) {
      toast.error("No tienes permiso para eliminar usuarios administradores");
      return;
    }
    if (
      user.roles.includes("manager") &&
      hasRole("manager") &&
      !hasRole("admin")
    ) {
      toast.error("Solo los administradores pueden eliminar usuarios gerentes");
      return;
    }
    dispatch({ type: "OPEN_DELETE", payload: user });
  };

  const handleEditClick = (user: User) => {
    dispatch({ type: "OPEN_EDIT", payload: user });
  };

  const handlePasswordUpdateClick = (user: User) => {
    dispatch({ type: "OPEN_PASSWORD", payload: user });
  };

  const handleConfirmationToggle = async (user: User) => {
    if (!canManageUsers) {
      toast.error("No tienes permisos para cambiar el estado de confirmación");
      return;
    }
    if (user.roles.includes("admin")) {
      toast.error(
        "No puedes cambiar la confirmación de usuarios administradores",
      );
      return;
    }
    dispatch({ type: "SET_CONFIRMING", payload: user.id });
    try {
      const newConfirmationState = !user.verified;
      await toggleUserConfirmation(user.id, newConfirmationState);
      const action = newConfirmationState ? "confirmado" : "desconfirmado";
      toast.success(`Usuario ${user.fullname} ${action} correctamente`);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la confirmación");
    } finally {
      if (isMounted.current) {
        dispatch({ type: "SET_CONFIRMING", payload: null });
      }
    }
  };

  const handleExportUsers = async () => {
    try {
      const allFilters = { ...state.filters, search: state.searchTerm };
      await exportUsers(allFilters);
      toast.success("Usuarios exportados correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al exportar usuarios");
    }
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  };

  const handleSearchChange = (term: string) => {
    dispatch({ type: "SET_SEARCH", payload: term });
  };

  const handlePageChange = (selectedItem: { selected: number }) => {
    const page = selectedItem.selected + 1;
    const allFilters = {
      ...state.filters,
      search: state.searchTerm,
    };
    fetchUsers(page, state.perPage, allFilters);
  };

  // Filter users based on current user's role
  const filteredUsers = users.filter((user) => {
    if (hasRole("admin")) {
      return true;
    }
    return !user.roles.includes("admin");
  });

  const columns = createUsersColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onToggleConfirmation: handleConfirmationToggle,
    onUpdatePassword: handlePasswordUpdateClick,
    canManageUsers: !!canManageUsers,
    currentUserId: currentUser?.id,
    confirmingUserId: state.confirmingUserId,
  });

  return (
    <div className="space-y-6">
      <UsersDataTable
        columns={columns}
        data={filteredUsers}
        onCreateUser={() => dispatch({ type: "OPEN_CREATE" })}
        onExportUsers={handleExportUsers}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        canManageUsers={!!canManageUsers}
        isLoading={isLoading}
        isExporting={isExporting || false}
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

      {/* Modals */}
      <UsersCreate
        isOpen={state.createModalOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      />

      <UsersEdit
        isOpen={state.editModalOpen}
        onClose={() => dispatch({ type: "CLOSE_EDIT" })}
        user={state.userToEdit}
      />

      <UsersDelete
        isOpen={state.deleteModalOpen}
        onClose={() => dispatch({ type: "CLOSE_DELETE" })}
        user={state.userToDelete}
      />

      <UsersUpdatePassword
        isOpen={state.passwordModalOpen}
        onClose={() => dispatch({ type: "CLOSE_PASSWORD" })}
        user={state.userToUpdatePassword}
      />
    </div>
  );
}

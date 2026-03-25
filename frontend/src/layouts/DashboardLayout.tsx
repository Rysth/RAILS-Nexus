import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import LogoutModal from "../components/shared/LogoutModal";
import AppSidebar from "../components/navigation/AppSidebar";
import { Permissions } from "../types/auth";

export default function DashboardLayout() {
  const { user, hasPermission, hasAnyPermission } = useAuthStore();
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // User needs at least view_dashboard permission to access the layout
  const hasAccess = hasAnyPermission(
    Permissions.VIEW_DASHBOARD,
    Permissions.VIEW_USERS,
    Permissions.VIEW_BUSINESS,
    Permissions.EDIT_PROFILE,
  );
  const canManageUsers = hasPermission(Permissions.VIEW_USERS);
  const canViewClients = hasPermission(Permissions.VIEW_CLIENTS);
  const canViewProjects = hasPermission(Permissions.VIEW_PROJECTS);
  const canViewRecurringServices = hasPermission(
    Permissions.VIEW_RECURRING_SERVICES,
  );

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/dashboard") {
      return { section: "Dashboard", page: "Panel de Control" };
    } else if (path === "/dashboard/users") {
      return { section: "Dashboard", page: "Usuarios" };
    } else if (path === "/dashboard/settings") {
      return { section: "Dashboard", page: "Configuración" };
    } else if (path === "/dashboard/clients") {
      return { section: "Dashboard", page: "Clientes" };
    } else if (path.startsWith("/dashboard/clients/")) {
      return { section: "Clientes", page: "Detalle del Cliente" };
    } else if (path === "/dashboard/projects") {
      return { section: "Dashboard", page: "Proyectos" };
    } else if (path === "/dashboard/recurring-services") {
      return { section: "Dashboard", page: "Servicios Recurrentes" };
    }
    return { section: "Dashboard", page: "Panel de Control" };
  };

  const breadcrumbs = getBreadcrumbs();

  if (!user) {
    return <Navigate to="/auth/signin" />;
  }

  if (!hasAccess) {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-theme">
      <SidebarProvider>
        <AppSidebar
          user={user}
          canManageUsers={canManageUsers}
          canViewClients={canViewClients}
          canViewProjects={canViewProjects}
          canViewRecurringServices={canViewRecurringServices}
          setLogoutModalOpen={setLogoutModalOpen}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href={
                        breadcrumbs.section === "Clientes"
                          ? "/dashboard/clients"
                          : "/dashboard"
                      }
                    >
                      {breadcrumbs.section}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbs.page}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
        {/* Logout Modal */}
        <LogoutModal
          isOpen={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
        />
      </SidebarProvider>
    </div>
  );
}

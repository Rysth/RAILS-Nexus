import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClientStore } from "../../../stores/clientStore";
import { useAuthStore } from "../../../stores/authStore";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Pencil,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClientProject } from "../../../types/client";

// ── Helpers ─────────────────────────────────────────────────

const getIdTypeBadge = (type: string) => {
  const config: Record<string, { label: string; variant: string }> = {
    "04": { label: "RUC", variant: "default" },
    "05": { label: "Cédula", variant: "secondary" },
    "06": { label: "Pasaporte", variant: "outline" },
  };
  return config[type] || { label: type, variant: "outline" };
};

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  active: { label: "Activo", variant: "default" },
  maintenance: { label: "Mantenimiento", variant: "secondary" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ── Component ───────────────────────────────────────────────

export default function ClientsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentClient, isLoading, fetchClient } = useClientStore();
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission("edit_clients");

  useEffect(() => {
    if (!id) return;
    const clientId = Number(id);
    if (Number.isNaN(clientId)) {
      toast.error("ID de cliente inválido");
      navigate("/dashboard/clients", { replace: true });
      return;
    }
    fetchClient(clientId).catch(() => {
      toast.error("No se pudo cargar el cliente");
      navigate("/dashboard/clients", { replace: true });
    });
  }, [id, fetchClient, navigate]);

  // ── Loading skeleton ──────────────────────────────────────

  if (isLoading || !currentClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  const idType = getIdTypeBadge(currentClient.identification_type);
  const projects: ClientProject[] = currentClient.projects ?? [];

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/clients")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentClient.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Cliente registrado el {formatDate(currentClient.created_at)}
            </p>
          </div>
        </div>

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate("/dashboard/clients", {
                state: { editId: currentClient.id },
              })
            }
          >
            <Pencil className="mr-2 size-4" />
            Editar cliente
          </Button>
        )}
      </div>

      {/* Body grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column – Client info card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="truncate text-lg">
                  {currentClient.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant={idType.variant as any} className="text-xs">
                    {idType.label}
                  </Badge>
                  <span className="truncate text-xs">
                    {currentClient.identification || "Sin identificación"}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Correo electrónico
                </p>
                {currentClient.email ? (
                  <a
                    href={`mailto:${currentClient.email}`}
                    className="text-sm hover:underline"
                  >
                    {currentClient.email}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Teléfono
                </p>
                <p className="text-sm">{currentClient.phone || "—"}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Dirección
                </p>
                <p className="text-sm">{currentClient.address || "—"}</p>
              </div>
            </div>

            <Separator />

            {/* Stats */}
            <div className="flex items-start gap-3">
              <FolderKanban className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Proyectos asociados
                </p>
                <p className="text-sm font-semibold">{projects.length}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Última actualización
                </p>
                <p className="text-sm">
                  {formatDate(currentClient.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column – Projects table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="size-5" />
              Proyectos
            </CardTitle>
            <CardDescription>
              Proyectos asociados a {currentClient.name}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FolderKanban className="mb-3 size-10 opacity-40" />
                <p className="font-medium">Sin proyectos</p>
                <p className="text-sm">
                  Este cliente aún no tiene proyectos registrados.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead className="text-right">URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => {
                      const status = statusConfig[project.status] || {
                        label: project.status,
                        variant: "outline" as const,
                      };
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.start_date
                              ? new Date(project.start_date).toLocaleDateString(
                                  "es-EC",
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {project.production_url ? (
                              <a
                                href={project.production_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="size-3" />
                                Ver sitio
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

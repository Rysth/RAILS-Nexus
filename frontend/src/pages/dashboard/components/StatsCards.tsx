import { StatsCard } from "@/components/ui/stats-card";
import { Users, ShieldCheck, Percent, CalendarDays } from "lucide-react";

interface Stats {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  users_today: number;
  users_this_week: number;
  users_this_month: number;
  growth_percentage: number;
  verification_rate: number;
  total_roles: number;
  total_permissions: number;
}

interface StatsCardsProps {
  stats: Stats;
  formatNumber: (n: number) => string;
}

export function StatsCards({ stats, formatNumber }: StatsCardsProps) {
  const growthPositive = stats.growth_percentage >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Usuarios"
        value={formatNumber(stats.total_users)}
        icon={Users}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100 dark:bg-blue-900/50"
        variant="colored"
        trend={{
          value: `${growthPositive ? "+" : ""}${stats.growth_percentage}%`,
          isPositive: growthPositive,
          label: "vs. mes anterior",
        }}
        description={`${stats.users_this_month} registros este mes`}
      />

      <StatsCard
        title="Usuarios Verificados"
        value={formatNumber(stats.verified_users)}
        icon={ShieldCheck}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100 dark:bg-emerald-900/50"
        variant="colored"
        trend={{
          value: `${stats.verification_rate}%`,
          isPositive: stats.verification_rate >= 50,
          label: "tasa de verificación",
        }}
        description={`${stats.unverified_users} sin verificar`}
      />

      <StatsCard
        title="Tasa de Verificación"
        value={`${stats.verification_rate}%`}
        icon={Percent}
        iconColor="text-amber-600"
        iconBgColor="bg-amber-100 dark:bg-amber-900/50"
        variant="colored"
        trend={{
          value: `${stats.verified_users}/${stats.total_users}`,
          isPositive: stats.verification_rate >= 70,
          label: "verificados",
        }}
        description={`${stats.total_roles} roles · ${stats.total_permissions} permisos`}
      />

      <StatsCard
        title="Registros Hoy"
        value={stats.users_today}
        icon={CalendarDays}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100 dark:bg-purple-900/50"
        variant="colored"
        trend={{
          value: `${stats.users_this_week} esta semana`,
          isPositive: stats.users_today > 0,
          label: "",
        }}
        description={`${stats.users_this_month} este mes`}
      />
    </div>
  );
}

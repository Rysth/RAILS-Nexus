import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface WelcomeBannerProps {
  fullname: string | undefined;
}

export function WelcomeBanner({ fullname }: WelcomeBannerProps) {
  return (
    <Card className="bg-gradient-to-r from-primary/5 via-card to-card">
      <CardContent className="py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">
              Bienvenido, {fullname ?? "Usuario"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aquí tienes un resumen general del sistema
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Última actualización: ahora
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { RequirePermission } from "../../../../shared/guards/RequirePermission";
import { EventoObjetivosScreen } from "../../../../features/eventos/objetivos/EventoObjetivosScreen";

export default function ObjetivosRoute() {
  return (
    <RequirePermission action="criar" resource="eventos">
      <EventoObjetivosScreen />
    </RequirePermission>
  );
}

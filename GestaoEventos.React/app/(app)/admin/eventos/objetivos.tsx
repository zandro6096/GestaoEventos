import { RequirePermission } from "../../../../shared/guards/RequirePermission";
import { EventoObjetivosScreen } from "../../../../features/eventos/objetivos/EventoObjetivosScreen";

export default function ObjetivosRoute() {
  return (
    <RequirePermission action="gerenciar" resource="configuracoes">
      <EventoObjetivosScreen />
    </RequirePermission>
  );
}

import { EventoTemplatesScreen } from "../../../../features/eventos/modelos/EventoTemplatesScreen";
import { RequirePermission } from "../../../../shared/guards/RequirePermission";

export default function EventTemplatesRoute() {
  return (
    <RequirePermission action="gerenciar" resource="configuracoes">
      <EventoTemplatesScreen />
    </RequirePermission>
  );
}

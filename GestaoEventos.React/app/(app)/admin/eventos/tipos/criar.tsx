import { EventoTemplateFormScreen } from "../../../../../features/eventos/modelos/EventoTemplateFormScreen";
import { RequirePermission } from "../../../../../shared/guards/RequirePermission";

export default function CreateEventTemplateRoute() {
  return (
    <RequirePermission action="criar" resource="eventos">
      <EventoTemplateFormScreen />
    </RequirePermission>
  );
}

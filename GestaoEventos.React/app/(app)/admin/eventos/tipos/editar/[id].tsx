import { EventoTemplateFormScreen } from "../../../../../../features/eventos/modelos/EventoTemplateFormScreen";
import { RequirePermission } from "../../../../../../shared/guards/RequirePermission";

export default function EditEventTemplateRoute() {
  return (
    <RequirePermission action="criar" resource="eventos">
      <EventoTemplateFormScreen />
    </RequirePermission>
  );
}

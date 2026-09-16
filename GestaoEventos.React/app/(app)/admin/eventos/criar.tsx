import { CriarEventoScreen } from "../../../../features/eventos/criar/CriarEventoScreen";
import { RequirePermission } from "../../../../shared/guards/RequirePermission";

export default function CreateEventRoute() {
  return (
    <RequirePermission action="criar" resource="eventos">
      <CriarEventoScreen />
    </RequirePermission>
  );
}

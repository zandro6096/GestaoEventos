import { InicioEventoScreen } from '../../../../features/eventos/iniciar-evento/InicioEventoScreen';
import { RequirePermission } from '../../../../shared/guards/RequirePermission';

export default function StartEventRoute() {
  return (
    <RequirePermission action="criar" resource="eventos">
      <InicioEventoScreen />
    </RequirePermission>
  );
}

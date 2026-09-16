import { MeusEventosScreen } from '../../../features/eventos/meus-eventos/screens/MeusEventosScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function MyEventsRoute() {
  return (
    <RequirePermission action="ler" resource="eventos">
      <MeusEventosScreen />
    </RequirePermission>
  );
}

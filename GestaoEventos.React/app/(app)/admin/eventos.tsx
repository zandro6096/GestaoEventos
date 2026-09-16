import { EventosListScreen } from '../../../features/eventos/screens/EventosListScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function AdminEventsRoute() {
  return (
    <RequirePermission action="ler" resource="eventos">
      <EventosListScreen />
    </RequirePermission>
  );
}

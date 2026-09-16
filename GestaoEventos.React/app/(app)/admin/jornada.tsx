import { JornadaScreen } from '../../../features/jornada/screens/JornadaScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function AdminJourneyRoute() {
  return (
    <RequirePermission action="ler" resource="jornada">
      <JornadaScreen />
    </RequirePermission>
  );
}

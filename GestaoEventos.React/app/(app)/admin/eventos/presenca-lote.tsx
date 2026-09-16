import { PresencaLoteScreen } from '../../../../features/eventos/presenca/PresencaLoteScreen';
import { RequirePermission } from '../../../../shared/guards/RequirePermission';

export default function BulkAttendanceRoute() {
  return (
    <RequirePermission action="gerenciar" resource="eventos">
      <PresencaLoteScreen />
    </RequirePermission>
  );
}

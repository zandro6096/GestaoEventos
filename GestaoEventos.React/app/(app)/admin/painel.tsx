import { PainelScreen } from '../../../features/painel/screens/PainelScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function AdminPanelRoute() {
  return (
    <RequirePermission action="ler" resource="painel">
      <PainelScreen />
    </RequirePermission>
  );
}

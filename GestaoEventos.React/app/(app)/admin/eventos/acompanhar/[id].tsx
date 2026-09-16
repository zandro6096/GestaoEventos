import { AcompanhamentoScreen } from '../../../../../features/eventos/acompanhamento/AcompanhamentoScreen';
import { RequirePermission } from '../../../../../shared/guards/RequirePermission';

export default function FollowEventRoute() {
  return (
    <RequirePermission action="ler" resource="eventos">
      <AcompanhamentoScreen />
    </RequirePermission>
  );
}

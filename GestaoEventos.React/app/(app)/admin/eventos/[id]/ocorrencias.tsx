import { AcompanhamentoScreen } from '../../../../../features/eventos/acompanhamento/AcompanhamentoScreen';
import { RequirePermission } from '../../../../../shared/guards/RequirePermission';

export default function EventOccurrencesRoute() {
  return (
    <RequirePermission action="ler" resource="eventos">
      <AcompanhamentoScreen />
    </RequirePermission>
  );
}

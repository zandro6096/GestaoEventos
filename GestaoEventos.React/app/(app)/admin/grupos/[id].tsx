import { GrupoDetalheScreen } from '../../../../features/grupos/detalhe/GrupoDetalheScreen';
import { RequirePermission } from '../../../../shared/guards/RequirePermission';

export default function GroupDetailRoute() {
  return <RequirePermission action="ler" resource="grupos"><GrupoDetalheScreen /></RequirePermission>;
}

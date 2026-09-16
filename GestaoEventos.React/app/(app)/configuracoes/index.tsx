import { ConfiguracoesScreen } from '../../../features/configuracoes/ConfiguracoesScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfiguracoesRoute() {
  return <RequirePermission action="gerenciar" resource="configuracoes"><ConfiguracoesScreen /></RequirePermission>;
}

import { ConfiguracoesScreen } from '../../../features/configuracoes/ConfiguracoesScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function AdminSettingsRoute() {
  return <RequirePermission action="gerenciar" resource="configuracoes"><ConfiguracoesScreen /></RequirePermission>;
}

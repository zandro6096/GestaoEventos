import { SuporteAdminScreen } from '../../../features/admin/suporte/SuporteAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigSuporteRoute() { return <RequirePermission action="ler" resource="configuracoes"><SuporteAdminScreen /></RequirePermission>; }

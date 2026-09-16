import { SuporteAdminScreen } from '../../../features/admin/suporte/SuporteAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';
export default function SuporteRoute() { return <RequirePermission action="ler" resource="configuracoes"><SuporteAdminScreen /></RequirePermission>; }

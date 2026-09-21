import { TiposAdminScreen } from '../../../features/admin/tipos/TiposAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';
export default function TiposEventoRoute() { return <RequirePermission action="gerenciar" resource="configuracoes"><TiposAdminScreen initialKind="evento" /></RequirePermission>; }

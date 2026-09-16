import { TiposAdminScreen } from '../../../features/admin/tipos/TiposAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigTiposRoute() { return <RequirePermission action="gerenciar" resource="grupos"><TiposAdminScreen /></RequirePermission>; }

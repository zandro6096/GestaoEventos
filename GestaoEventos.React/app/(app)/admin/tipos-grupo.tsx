import { TiposAdminScreen } from '../../../features/admin/tipos/TiposAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';
export default function TiposGrupoRoute() { return <RequirePermission action="gerenciar" resource="grupos"><TiposAdminScreen initialKind="grupo" /></RequirePermission>; }

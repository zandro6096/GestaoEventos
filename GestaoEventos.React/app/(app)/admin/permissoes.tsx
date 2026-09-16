import { PapeisAdminScreen } from '../../../features/admin/papeis-permissoes/PapeisAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';
export default function PermissoesRoute() { return <RequirePermission action="gerenciar" resource="permissoes"><PapeisAdminScreen /></RequirePermission>; }

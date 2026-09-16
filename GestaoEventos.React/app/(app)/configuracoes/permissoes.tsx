import { PapeisAdminScreen } from '../../../features/admin/papeis-permissoes/PapeisAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigPermissoesRoute() { return <RequirePermission action="gerenciar" resource="permissoes"><PapeisAdminScreen /></RequirePermission>; }

import { PapeisAdminScreen } from '../../../features/admin/papeis-permissoes/PapeisAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';
export default function PapeisRoute() { return <RequirePermission action="gerenciar" resource="papeis"><PapeisAdminScreen /></RequirePermission>; }

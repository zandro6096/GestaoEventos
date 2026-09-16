import { PapeisAdminScreen } from '../../../features/admin/papeis-permissoes/PapeisAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigPapeisRoute() { return <RequirePermission action="gerenciar" resource="papeis"><PapeisAdminScreen /></RequirePermission>; }

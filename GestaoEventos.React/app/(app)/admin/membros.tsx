import { MembrosAdminScreen } from '../../../features/admin/membros/MembrosAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';
export default function MembrosRoute() { return <RequirePermission action="gerenciar" resource="usuarios"><MembrosAdminScreen /></RequirePermission>; }

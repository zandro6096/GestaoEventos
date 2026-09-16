import { AuditoriaAdminScreen } from '../../../features/admin/auditoria/AuditoriaAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigAuditoriaRoute() { return <RequirePermission action="ler" resource="auditoria"><AuditoriaAdminScreen /></RequirePermission>; }

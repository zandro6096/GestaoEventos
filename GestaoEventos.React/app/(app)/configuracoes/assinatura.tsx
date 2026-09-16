import { AssinaturaAdminScreen } from '../../../features/admin/assinatura/AssinaturaAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigAssinaturaRoute() { return <RequirePermission action="ler" resource="assinatura"><AssinaturaAdminScreen /></RequirePermission>; }

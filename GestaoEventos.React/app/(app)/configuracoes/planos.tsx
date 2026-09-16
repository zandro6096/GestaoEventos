import { PlanosAdminScreen } from '../../../features/admin/assinatura/AssinaturaAdminScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function ConfigPlanosRoute() { return <RequirePermission action="ler" resource="planos"><PlanosAdminScreen /></RequirePermission>; }

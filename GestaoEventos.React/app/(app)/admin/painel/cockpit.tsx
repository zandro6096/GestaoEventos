import { CockpitScreen } from '../../../../features/painel/cockpit/CockpitScreen';
import { RequirePermission } from '../../../../shared/guards/RequirePermission';

export default function CockpitRoute() { return <RequirePermission action="ler" resource="painel"><CockpitScreen /></RequirePermission>; }

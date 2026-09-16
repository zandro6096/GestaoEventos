import { FilaSemanalScreen } from '../../../../features/painel/cockpit/FilaSemanalScreen';
import { RequirePermission } from '../../../../shared/guards/RequirePermission';

export default function WeeklyQueueRoute() { return <RequirePermission action="ler" resource="painel"><FilaSemanalScreen /></RequirePermission>; }

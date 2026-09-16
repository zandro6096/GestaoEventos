import { FrequenciaReportScreen } from '../../../features/relatorios/frequencia/FrequenciaReportScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function FrequencyReportRoute() { return <RequirePermission action="ler" resource="relatorios"><FrequenciaReportScreen /></RequirePermission>; }

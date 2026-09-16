import { GruposScreen } from '../../../features/grupos/GruposScreen';
import { RequirePermission } from '../../../shared/guards/RequirePermission';

export default function AdminGroupsRoute() {
  return <RequirePermission action="ler" resource="grupos"><GruposScreen /></RequirePermission>;
}

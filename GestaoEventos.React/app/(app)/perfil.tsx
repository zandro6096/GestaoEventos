import { ProfileScreen } from '../../features/session/screens/ProfileScreen';
import { RequirePermission } from '../../shared/guards/RequirePermission';

export default function ProfileRoute() {
  return (
    <RequirePermission action="ler" resource="jornada">
      <ProfileScreen />
    </RequirePermission>
  );
}

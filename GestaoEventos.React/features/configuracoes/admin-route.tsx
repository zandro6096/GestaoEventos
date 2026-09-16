import { AdminAreaPlaceholderScreen } from './AdminAreaPlaceholderScreen';
import { RequirePermission } from '../../shared/guards/RequirePermission';

export function AdminRoute({ title, resource, action = 'gerenciar' }: { title: string; resource: string; action?: 'ler' | 'gerenciar' }) {
  return <RequirePermission action={action} resource={resource}><AdminAreaPlaceholderScreen title={title} description="Esta area esta protegida e sera conectada ao contrato administrativo na proxima historia." /></RequirePermission>;
}

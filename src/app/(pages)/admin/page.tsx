import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/monitoring?tab=system&infra=cloud');
}

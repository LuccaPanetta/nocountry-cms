import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando panel de administración...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}


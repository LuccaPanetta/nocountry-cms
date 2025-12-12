import { Suspense } from 'react'
import { EditorDashboard } from '@/components/dashboard/editor-dashboard'

const Page = () => {
  return (
    <Suspense fallback={<div>Cargando panel del editor...</div>}>
      <EditorDashboard />
    </Suspense>
  )
}

export default Page
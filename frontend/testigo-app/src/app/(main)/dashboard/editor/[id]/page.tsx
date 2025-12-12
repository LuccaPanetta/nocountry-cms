// app/(main)/dashboard/editor/[id]/page.tsx
import { Suspense } from 'react'
import TestimonialEdit from '@/components/dashboard/testimonial-edit'

interface PageProps {
  params: Promise<{
    id: string;
  }>
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Cargando editor...</div>}>
      <TestimonialEdit testimonialId={id} />
    </Suspense>
  )
}

export default page
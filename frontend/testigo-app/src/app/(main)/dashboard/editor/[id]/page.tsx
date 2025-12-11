import React from 'react'
import TestimonialEdit from '@/components/dashboard/testimonial-edit'

interface PageProps {
  params: Promise<{
    id: string;
  }>
}


const page = async ({ params }: PageProps) => {
  const { id } = await params;
  
  return (
    <div>
      <TestimonialEdit testimonialId={id} />
    </div>
  )
}

export default page
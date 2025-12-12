"use client";

import { Suspense } from "react";
import TestimonialEdit from "@/components/dashboard/testimonial-edit";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // asegura que sea string

  if (!id) {
    return <div>No se encontró el ID del testimonio.</div>;
  }

  return (
    <Suspense fallback={<div>Cargando editor...</div>}>
      <TestimonialEdit testimonialId={id} />
    </Suspense>
  );
};

export default Page;
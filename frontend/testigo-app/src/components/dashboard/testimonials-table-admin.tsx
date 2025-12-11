import { useGetTestimonials } from "@/services/use-queries-service/testimonials-query-service";
import { Eye, RotateCw, Trash2 } from "lucide-react";
import { TestimonialsTableBase } from "./testimonial-table-base";
import { TestimonyResType } from "@/types/testimony-type";

export default function TestimonialsTableAdmin() {
  const { data} = useGetTestimonials();

  const testimonials = data?.map(t => t.testimonial) ?? [];

  const actions = [
    {
      label: "Ver detalles",
      icon: <Eye size={16} />,
      onClick: (t: TestimonyResType) => console.log("view", t),
    },
    {
      label: "Cambiar estado",
      icon: <RotateCw size={16} />,
      onClick: (t: TestimonyResType) => console.log("status", t),
    },
    {
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: (t : TestimonyResType) => console.log("delete", t.id),
    },
  ];

  return (
    <TestimonialsTableBase
      title="Moderación de Testimonios"
      subtitle="Gestiona y modera los testimonios enviados por los usuarios y/o editor"
      testimonials={testimonials}
      actions={actions}
    />
  );
}

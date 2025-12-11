import { useGetTestimonials } from "@/services/use-queries-service/testimonials-query-service";
import { TestimonyResType } from "@/types/testimony-type";
import { Eye, RotateCw, SquarePen } from "lucide-react";
import { TestimonialsTableBase } from "./testimonial-table-base";

export default function TestimonialsTableEditor() {
  const { data } = useGetTestimonials();
  const testimonials = data
    ?.map(t => t.testimonial)
    ?.filter(t => t.status === "pending") ?? [];

  const actions = [
    {
      label: "Ver detalles",
      icon: <Eye size={16} />,
      onClick: (t: TestimonyResType) => console.log("view", t),
    },
    {
      label: "Editar",
      icon: <SquarePen size={16} />,
      onClick: (t: TestimonyResType) => console.log("edit", t.id),
    },
    {
      label: "Cambiar estado",
      icon: <RotateCw size={16} />,
      onClick: (t: TestimonyResType) => console.log("status", t),
    },
  ];

  return (
    <TestimonialsTableBase
      title="Modeeración de testimonios pendientes"
      subtitle="Listado de testimonios que requieren revisión y/o edición"
      testimonials={testimonials}
      actions={actions}
    />
  );
}
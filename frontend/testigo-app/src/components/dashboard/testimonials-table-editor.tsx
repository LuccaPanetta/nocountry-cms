import { useGetTestimonials } from "@/services/use-queries-service/testimonials-query-service";
import { TestimonyResType } from "@/types/testimony-type";
import { Eye, RotateCw, SquarePen } from "lucide-react";
import { TestimonialsTableBase } from "./testimonial-table-base";
import { useState } from "react";
import { TestimonialStatusModal } from "./testimonial-status-modal";
import TestimonialView from "./testimonial-view";

export default function TestimonialsTableEditor() {
  const { data, refetch } = useGetTestimonials();
  const testimonials = data
    ?.map(t => t.testimonial)
    ?.filter(t => t.status === "pending") ?? [];

  const [viewingTestimonial, setViewingTestimonial] = useState<TestimonyResType | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonyResType | null>(null);

  const [forceDropdownClose, setForceDropdownClose] = useState(0);

  const closeDropdown = () => setForceDropdownClose(prev => prev + 1);

  const handleView = (id: string) => {
    const testimonial = testimonials.find((t: TestimonyResType) => t.id === id);
    if (testimonial) {
      setViewingTestimonial(testimonial);
      closeDropdown();
    }
  };

  const handleEdit = (id: string) => {
    // Implementar navegación a edición
    console.log('Editar:', id);
    closeDropdown();
  };



  const handleStatus = (testimonial: TestimonyResType) => {
    if (!testimonial) return;
    setSelectedTestimonial(testimonial);
    setStatusModalOpen(true);
    closeDropdown();
  };


  const actions = [
    {
      label: "Ver detalles",
      icon: <Eye size={16} />,
      onClick: (t: TestimonyResType) => handleView(t.id),
    },
    {
      label: "Editar",
      icon: <SquarePen size={16} />,
      onClick: (t: TestimonyResType) => handleEdit(t.id),
    },
    {
      label: "Cambiar estado",
      icon: <RotateCw size={16} />,
      onClick: (t: TestimonyResType) => handleStatus(t),
    },
  ];

  return (
    <>
    <TestimonialsTableBase
      title="Modeeración de testimonios pendientes"
      subtitle="Listado de testimonios que requieren revisión y/o edición"
      testimonials={testimonials}
      actions={actions}
    />
       {viewingTestimonial && (
        <TestimonialView
          testimonialId={viewingTestimonial.id}
          title={viewingTestimonial.titulo || 'Sin título'}
          content={viewingTestimonial.contenido}
          author={viewingTestimonial.autor}
          position={viewingTestimonial.cargo}
          company={viewingTestimonial.empresa || 'Sin empresa'}
          category={viewingTestimonial.category}
          format={viewingTestimonial.multimedia?.tipo || 'TEXTO'}
          mediaUrl={viewingTestimonial.multimedia?.url}
          tags={viewingTestimonial.tags}
          createdAt={viewingTestimonial.creadoEn}
          onClose={() => setViewingTestimonial(null)}
           onEdit={() => {
            handleEdit(viewingTestimonial.id);
            setViewingTestimonial(null);
          }}
  
        />
      )}
      {statusModalOpen && (
        <TestimonialStatusModal
          statusModalOpen={statusModalOpen}
          setStatusModalOpen={setStatusModalOpen}
          selectedTestimonial={selectedTestimonial}
          setSelectedTestimonial={setSelectedTestimonial}
          refetch={refetch}
        />
      )}
      </>
  );
}
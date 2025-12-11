import { useGetTestimonials } from "@/services/use-queries-service/testimonials-query-service";
import { Eye, RotateCw, Trash2 } from "lucide-react";
import { TestimonialsTableBase } from "./testimonial-table-base";
import { TestimonyResType } from "@/types/testimony-type";
import { TestimonialStatusModal } from "./testimonial-status-modal";
import { useState } from "react";
import TestimonialView from "./testimonial-view";
import { useMutation } from "@tanstack/react-query";
import { deleteTestimonyById } from "@/services/use-cases/testimonials.service";

export default function TestimonialsTableAdmin() {
  const { data, refetch } = useGetTestimonials();

  const testimonials = data?.map(t => t.testimonial) ?? [];


  const [viewingTestimonial, setViewingTestimonial] = useState<TestimonyResType | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonyResType | null>(null);
  const [forceDropdownClose, setForceDropdownClose] = useState(0);

  const closeDropdown = () => setForceDropdownClose(prev => prev + 1);

  const mutationDeleteTestimonyById = useMutation({
    mutationFn: (id: string) => deleteTestimonyById(id),
  });

  const handleView = (id: string) => {
    const testimonial = testimonials.find((t: TestimonyResType) => t.id === id);
    if (testimonial) {
      setViewingTestimonial(testimonial);
      closeDropdown();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este testimonio?')) {
      try {
        await mutationDeleteTestimonyById.mutateAsync(id);
        closeDropdown();
        refetch();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el testimonio');
      }
    }
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
      label: "Cambiar estado",
      icon: <RotateCw size={16} />,
      onClick: (t: TestimonyResType) => handleStatus(t),
    },
    {
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: (t: TestimonyResType) => handleDelete(t.id),
    },
  ];



  return (
    <>
      <TestimonialsTableBase
        title="Moderación de Testimonios"
        subtitle="Gestiona y modera los testimonios enviados por los usuarios y/o editor"
        testimonials={testimonials}
        actions={actions}
        onCloseDropdown={closeDropdown}
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
          onDelete={() => {
            handleDelete(viewingTestimonial.id);
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

'use client';

import { useEffect, useState } from 'react';
import { Users, CircleCheckBig, SquareX } from 'lucide-react';
import { TestimonialCard } from './testimonial-card';
import TestimonialsTable  from './testimonial-table';
import Container from '../ui/Container';
import { useRouter, useSearchParams } from 'next/navigation';
import { MetricsSummary } from './metrics-dashboard';
import { useGetTestimonials } from '@/services/use-queries-service/testimonials-query-service';

type ActiveSection = 'moderacion' | 'usuarios' | 'configuraciones' | 'metricas';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('moderacion');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [totalTestimonials, setTotalTestimonials] = useState<number>(0)
  const [totalApprovedTestimonials, setTotalApprovedTestimonials] = useState<number>(0)
  const [totalInReviewTestimonials, setTotalInReviewTestimonials] = useState<number>(0)
  const [totalPendingTestimonials, setTotalPendingTestimonials] = useState<number>(0)

    const { data, isLoading, isError, refetch } = useGetTestimonials();
    const testimonials = data?.map(item => item.testimonial) || [];

  // Inicializa la sección según la URL
  useEffect(() => {
    const section = searchParams.get('section') as ActiveSection | null;
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Cambia la sección y actualiza la URL
  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    router.replace(`?section=${section}`);
  };

useEffect(() => {
  if (!data) return;

  const testimonials = data.map(item => item.testimonial);

  setTotalTestimonials(testimonials.length);
  setTotalApprovedTestimonials(
    testimonials.filter(t => t.status === "approved").length
  );
  setTotalInReviewTestimonials(
    testimonials.filter(t => t.status === "in_review").length
  );
  setTotalPendingTestimonials(
    testimonials.filter(t => t.status === "pending").length
  );
}, [data]);

  return (
    <div className="w-full bg-gray-50 m-auto min-h-screen"> 
      <Container>
        <div className="mb-8 grid md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <TestimonialCard
            label="Total de Testimonios"
            icon={Users}
            value={totalTestimonials}
            color='text-Secondary'
          />
          <TestimonialCard
            label="Testimonios publicados"
            icon={CircleCheckBig}
            value={totalApprovedTestimonials}
            color='text-Primary'
          />
          <TestimonialCard
            label="Testimonios en revisión"
            icon={CircleCheckBig}
            value={totalInReviewTestimonials}
            color='text-Accent'
          />
          <TestimonialCard
            label="Testimonios pendientes"
            icon={SquareX}
            value={totalPendingTestimonials}
            color='text-Neutro-1'
          />
        </div>

        <div className="mb-6 grid md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <button
            onClick={() => handleSectionChange('moderacion')}
            className={`text-center rounded-sm py-2 font-medium transition-colors ${activeSection === 'moderacion'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
              }`}
          >
            Moderación
          </button>
          <button
            onClick={() => handleSectionChange('usuarios')}
            className={`text-center rounded-sm py-2 font-medium transition-colors ${activeSection === 'usuarios'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
              }`}
          >
            Gestión de usuarios
          </button>
          <button
            onClick={() => handleSectionChange('configuraciones')}
            className={`text-center rounded-sm  py-2 font-medium transition-colors ${activeSection === 'configuraciones'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
              }`}
          >
            Configuraciones
          </button>
          <button
            onClick={() => handleSectionChange('metricas')}
            className={`text-center rounded-sm py-2 font-medium transition-colors ${activeSection === 'metricas'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
              }`}
          >
            Métricas
          </button>
        </div>

        <div>
          {activeSection === 'moderacion' && <TestimonialsTable />}
          {activeSection === 'usuarios' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">Gestión de usuarios - Próximamente</p>
            </div>
          )}
          {activeSection === 'configuraciones' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">Configuraciones - Próximamente</p>
            </div>
          )}
          {activeSection === 'metricas' && <MetricsSummary />}
        </div>
      </Container>
    </div>
  );

}
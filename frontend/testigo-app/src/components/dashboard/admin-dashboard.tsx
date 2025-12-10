'use client';

import { useState } from 'react';
import { Users, CircleCheckBig, SquareX } from 'lucide-react';
import { TestimonialCard } from './testimonial-card';
import TestimonialsTable  from './testimonial-table';
import Container from '../ui/Container';

type ActiveSection = 'moderacion' | 'usuarios' | 'configuraciones' | 'metricas';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('moderacion');

  return (
    <div className="w-full bg-gray-50 m-auto min-h-screen"> 
      <Container>
        <div className="mb-8 grid md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <TestimonialCard
            label="Total de Testimonios"
            icon={Users}
            value={24}
            color='text-Secondary'
          />
          <TestimonialCard
            label="Testimonios publicados"
            icon={CircleCheckBig}
            value={156}
            color='text-Primary'
          />
          <TestimonialCard
            label="Testimonios Pendientes"
            icon={CircleCheckBig}
            value={1243}
            color='text-Accent'
          />
          <TestimonialCard
            label="Testimonios Rechazados"
            icon={SquareX}
            value={89}
            color='text-Neutro-1'
          />
        </div>

        <div className="mb-6 grid md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <button
            onClick={() => setActiveSection('moderacion')}
            className={`text-center rounded-sm  py-2 font-medium transition-colors ${
              activeSection === 'moderacion'
                ? 'bg-Primary text-white'
                : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
            }`}
          >
            Moderación
          </button>
          <button
            onClick={() => setActiveSection('usuarios')}
            className={`text-center rounded-sm  py-2 font-medium transition-colors ${
              activeSection === 'usuarios'
                ? 'bg-Primary text-white'
                : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
            }`}
          >
            Gestión de usuarios
          </button>
          <button
            onClick={() => setActiveSection('configuraciones')}
            className={`text-center rounded-sm   py-2 font-medium transition-colors ${
              activeSection === 'configuraciones'
                ? 'bg-Primary text-white'
                : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
            }`}
          >
            Configuraciones
          </button>
          <button
            onClick={() => setActiveSection('metricas')}
            className={`text-center rounded-sm  py-2 font-medium transition-colors ${
              activeSection === 'metricas'
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
          {activeSection === 'metricas' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">Métricas - Próximamente</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
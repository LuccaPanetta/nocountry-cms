'use client';

import { useState } from 'react';
import { Users, CircleCheckBig, SquareX } from 'lucide-react';
import { TestimonialCard } from './testimonial-card';
import TestimonialsTable  from './testimonial-table';

type ActiveSection = 'moderacion'; //| 'usuarios' | 'configuraciones' | 'metricas';

const AdminDashboard = ()  => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('moderacion');

  return (
    <div className="max-w-2xl md:max-w-5xl bg-gray-50 p-8">

      <div className="mb-8 grid grid-cols-4 gap-6">
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

      <div className="mb-6 grid grid-cols-4 gap-x-4">
        <button
          onClick={() => setActiveSection('moderacion')}
          className={`text-center rounded-sm gap-2 py-2 font-medium transition-colors ${
            activeSection === 'moderacion'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
          }`}
        >
          Moderación
        </button>
        {/*<button
          onClick={() => setActiveSection('usuarios')}
          className={`text-center rounded-sm gap-2 py-2 font-medium transition-colors ${
            activeSection === 'usuarios'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
          }`}
        >
          Gestión de usuarios
        </button>
        <button
          onClick={() => setActiveSection('configuraciones')}
          className={`text-center rounded-sm gap-2  py-2 font-medium transition-colors ${
            activeSection === 'configuraciones'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
          }`}
        >
          Configuraciones
        </button>
        <button
          onClick={() => setActiveSection('metricas')}
          className={`text-center rounded-sm gap-2 py-2 font-medium transition-colors ${
            activeSection === 'metricas'
              ? 'bg-Primary text-white'
              : 'border border-Primary bg-white text-Primary hover:bg-gray-50'
          }`}
        >
          Métricas
        </button>*/}
      </div>

      <div className='block' > {/*{activeSection === 'moderacion' ? 'block' : 'hidden'*/}
        <TestimonialsTable />
      </div>
    {/*  <div className={activeSection === 'usuarios' ? 'block' : 'hidden'}>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Gestión de usuarios - Próximamente</p>
        </div>
      </div>
      <div className={activeSection === 'configuraciones' ? 'block' : 'hidden'}>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Configuraciones - Próximamente</p>
        </div>
      </div>
      <div className={activeSection === 'metricas' ? 'block' : 'hidden'}>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Métricas - Próximamente</p>
        </div>
      </div> */}
    </div>
  );
}
export default AdminDashboard
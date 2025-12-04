'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface Testimonial {
  id: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  title: string;
  author: string;
  category: string;
  format: 'Texto' | 'Imagen' | 'Video';
  createdDate: string;
  updatedDate: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    status: 'Pendiente',
    title: 'Excelente servicio',
    author: 'Juan García',
    category: 'Servicio',
    format: 'Texto',
    createdDate: '2024-11-20',
    updatedDate: '2024-11-20',
  },
  {
    id: '2',
    status: 'Aprobado',
    title: 'Recomiendo totalmente',
    author: 'María López',
    category: 'Producto',
    format: 'Imagen',
    createdDate: '2024-11-19',
    updatedDate: '2024-11-19',
  },
  {
    id: '3',
    status: 'Pendiente',
    title: 'Muy buena experiencia',
    author: 'Carlos Rodríguez',
    category: 'Experiencia',
    format: 'Texto',
    createdDate: '2024-11-18',
    updatedDate: '2024-11-18',
  },
  {
    id: '4',
    status: 'Rechazado',
    title: 'Problema con la entrega',
    author: 'Ana Martínez',
    category: 'Logística',
    format: 'Video',
    createdDate: '2024-11-17',
    updatedDate: '2024-11-17',
  },
  {
    id: '5',
    status: 'Aprobado',
    title: 'Perfecta atención al cliente',
    author: 'Pedro Sánchez',
    category: 'Servicio',
    format: 'Texto',
    createdDate: '2024-11-16',
    updatedDate: '2024-11-16',
  },
  {
    id: '6',
    status: 'Pendiente',
    title: 'Producto de calidad',
    author: 'Laura Fernández',
    category: 'Producto',
    format: 'Imagen',
    createdDate: '2024-11-15',
    updatedDate: '2024-11-15',
  },
  {
    id: '7',
    status: 'Aprobado',
    title: 'Entrega rápida',
    author: 'Diego Torres',
    category: 'Logística',
    format: 'Texto',
    createdDate: '2024-11-14',
    updatedDate: '2024-11-14',
  },
  {
    id: '8',
    status: 'Pendiente',
    title: 'Muy satisfecho',
    author: 'Sofia Moreno',
    category: 'Experiencia',
    format: 'Video',
    createdDate: '2024-11-13',
    updatedDate: '2024-11-13',
  },
  {
    id: '9',
    status: 'Rechazado',
    title: 'No cumple expectativas',
    author: 'Miguel Jiménez',
    category: 'Producto',
    format: 'Texto',
    createdDate: '2024-11-12',
    updatedDate: '2024-11-12',
  },
  {
    id: '10',
    status: 'Aprobado',
    title: 'Excelentes precios',
    author: 'Elena Ruiz',
    category: 'Precio',
    format: 'Imagen',
    createdDate: '2024-11-11',
    updatedDate: '2024-11-11',
  },
];

export function TestimonialTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(TESTIMONIALS_DATA.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const paginatedData = TESTIMONIALS_DATA.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'text-Accent';
      case 'Aprobado':
        return 'text-Success';
      case 'Rechazado':
        return 'text-Error';
      default:
        return 'text-Neutro-1';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200  bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-Secondary">Testimonios</h1>
      <p className="mb-6 text-sm text-Neutro-1">Gestión y revisión de testimonios</p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Titulo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Autor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Formato</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Creado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Actualizado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-Neutro-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((testimonial) => (
              <tr key={testimonial.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                    {testimonial.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{testimonial.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{testimonial.author}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{testimonial.category}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{testimonial.format}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{testimonial.createdDate}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{testimonial.updatedDate}</td>
                <td className="px-4 py-3">
                  <button className="rounded-md p-1 transition-colors hover:bg-gray-100">
                    <MoreVertical size={18} className="text-Neutro-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="flex items-center text-sm text-gray-600">
          Página {currentPage + 1} de {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

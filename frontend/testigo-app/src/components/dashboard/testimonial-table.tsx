"use client"
import React from 'react';
import { MoreHorizontal, Eye, SquarePen, Trash2 } from 'lucide-react';

type TestimonialStatus = 'pending' | 'approved' | 'rejected';
type TestimonialFormat = 'text' | 'image' | 'video';

interface Testimonial {
  id: string;
  status: TestimonialStatus;
  title: string;
  author: string;
  category: string;
  format: TestimonialFormat;
  createdAt: Date;
  updatedAt: Date;
}

// Datos de ejemplo
const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    status: 'pending',
    title: 'Excelente servicio al cliente',
    author: 'María González',
    category: 'Soporte',
    format: 'text',
    createdAt: new Date('2024-11-28'),
    updatedAt: new Date('2024-11-28'),
  },
  {
    id: '2',
    status: 'approved',
    title: 'Producto de alta calidad',
    author: 'Juan Pérez',
    category: 'Producto',
    format: 'video',
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-11-27'),
  },
  {
    id: '3',
    status: 'rejected',
    title: 'Muy satisfecho con la compra',
    author: 'Ana Martínez',
    category: 'Compras',
    format: 'image',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-26'),
  },
  {
    id: '4',
    status: 'pending',
    title: 'Rápida entrega',
    author: 'Carlos Ruiz',
    category: 'Envío',
    format: 'text',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-20'),
  },
  {
    id: '5',
    status: 'approved',
    title: 'Increíble experiencia',
    author: 'Laura Torres',
    category: 'Experiencia',
    format: 'video',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: '6',
    status: 'approved',
    title: 'Increíble experiencia',
    author: 'Laura Torres',
    category: 'Experiencia',
    format: 'video',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: '8',
    status: 'approved',
    title: 'Increíble experiencia',
    author: 'Laura Torres',
    category: 'Experiencia',
    format: 'video',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: '9',
    status: 'approved',
    title: 'Increíble experiencia',
    author: 'Laura Torres',
    category: 'Experiencia',
    format: 'video',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: '10',
    status: 'approved',
    title: 'Increíble experiencia',
    author: 'Laura Torres',
    category: 'Experiencia',
    format: 'video',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: '11',
    status: 'approved',
    title: 'Increíble experiencia',
    author: 'Laura Torres',
    category: 'Experiencia',
    format: 'video',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-18'),
  },
];

const TestimonialsTable = () => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;


  const getStatusBadge = (status: TestimonialStatus) => {
    const styles: Record<TestimonialStatus, string> = {
      pending: 'text-Accent',
      approved: 'text-Success',
      rejected: 'text-Error',
    };

    const labels: Record<TestimonialStatus, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getFormatBadge = (format: TestimonialFormat) => {
    const styles: Record<TestimonialFormat, string> = {
      text: 'text-Primary',
      video: 'text-Secondary',
      image: 'text-Accent',
    };

    const labels: Record<TestimonialFormat, string> = {
      text: 'Texto',
      video: 'Video',
      image: 'Imagen',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[format]}`}>
        {labels[format]}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const totalPages = Math.ceil(mockTestimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestimonials = mockTestimonials.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="w-full p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Moderación de Testimonios
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona y modera los testimonios enviados por los usuarios
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actualizado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTestimonials.map((testimonial, index) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(testimonial.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {testimonial.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {testimonial.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {testimonial.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getFormatBadge(testimonial.format)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(testimonial.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(testimonial.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(testimonial.id)}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >

                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      
                      
                        {openDropdown === testimonial.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200 ${
                                index >= currentTestimonials.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                              <button className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-Accent">
                                <Eye className='text-Neutro-1 h-4 w-4' />
                                <p>Ver detalles</p>
                              </button>
                              <button className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-Accent">
                                <SquarePen className='text-Neutro-1 h-4 w-4' />
                                <p>Editar</p>
                              </button>
                              <button className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-Accent">
                                <Trash2 className='text-Neutro-1 h-4 w-4'/>
                                <p>Eliminar</p>
                              </button>
                            </div>
                        </>
                      )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button className='bg-white border-2 border-Primary text-Primary text-center px-4 py-2' onClick={goToPreviousPage}>Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button className='bg-white border-2 border-Primary text-Primary text-center px-4 py-2' onClick={goToNextPage}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsTable;

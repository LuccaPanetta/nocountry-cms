"use client"
import React from 'react';
import { MoreHorizontal, Eye, SquarePen, Trash2, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { deleteTestimonyById, updateStatusOfTestimonyById } from '@/services/use-cases/testimonials.service';
import { useGetTestimonials } from '@/services/use-queries-service/testimonials-query-service';
import TestimonialView from './testimonial-view';

type TestimonialStatus = 'pending' | 'approved' | 'rejected';

interface Testimonial {
  id: string;
  titulo: string;
  autor: string;
  empresa?: string;
  cargo?: string;
  contenido: string;
  status: TestimonialStatus;
  category: string;
  tags: string[];
  multimedia?: {
    id: string;
    tipo: 'IMAGEN' | 'VIDEO' | 'TEXTO';
    url: string;
    descripcion?: string;
  };
  creadoEn: string;
  actualizadoEn: string;
}

interface TestimonialResponse {
  testimonial: Testimonial;
}

const TestimonialsTable = () => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;
  const [viewingTestimonial, setViewingTestimonial] = React.useState<Testimonial | null>(null);

  // ✅ 2. HOOKS DE QUERIES
  const { data, isLoading, isError, refetch } = useGetTestimonials();
const mutationDeleteTestimonyById = useMutation({
  mutationFn: (id: string) => deleteTestimonyById(id),
});
const mutationUpdateStatusTestimonyById = useMutation({
  mutationFn: ({ id, data }: { id: string; data: any }) => updateStatusOfTestimonyById(id, data),
});
  // ✅ 3. USEMEMO Y CÁLCULOS
  const testimonials = React.useMemo(() => {
    if (!data) return [];
    return data.map((item: any) => item.testimonial || item);
  }, [data]);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

  // ✅ 4. TODAS LAS FUNCIONES (getStatusBadge, getFormatBadge, formatDate, toggleDropdown, handleDelete, handleView, handleEdit, goToNextPage, goToPreviousPage)


  const getStatusBadge = (status: TestimonialStatus) => {
    const styles: Record<TestimonialStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
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

  const getFormatBadge = (multimedia?: Testimonial['multimedia']) => {
    if (!multimedia) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Texto
        </span>
      );
    }

    const styles: Record<string, string> = {
      TEXTO: 'bg-blue-100 text-blue-800',
      VIDEO: 'bg-purple-100 text-purple-800',
      IMAGEN: 'bg-pink-100 text-pink-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[multimedia.tipo] || 'bg-gray-100 text-gray-800'}`}>
        {multimedia.tipo}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este testimonio?')) {
      try {
        await mutationDeleteTestimonyById.mutateAsync(id);
        refetch();
        setOpenDropdown(null);
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el testimonio');
      }
    }
  };

  const handleView = (id: string) => {
  const testimonial = testimonials.find((t: Testimonial) => t.id === id);
  if (testimonial) {
    setViewingTestimonial(testimonial);
  }
  setOpenDropdown(null);
};

  const handleEdit = (id: string) => {
    // Implementar navegación a edición
    console.log('Editar:', id);
    setOpenDropdown(null);
  };


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

  if (isLoading) {
    return (
      <div className="w-full p-8 bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Cargando testimonios...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-8 bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar testimonios</h2>
          <p className="text-gray-600 mb-4">No se pudieron cargar los testimonios. Por favor, intenta nuevamente.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          <p className="text-sm text-gray-500 mt-1">
            Total: {testimonials.length} testimonios
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
                {currentTestimonials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No hay testimonios disponibles
                    </td>
                  </tr>
                ) : (
                  currentTestimonials.map((testimonial: Testimonial, index: number) => (
                    <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(testimonial.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.titulo || 'Sin título'}
                        </div>
                        {testimonial.empresa && (
                          <div className="text-xs text-gray-500">{testimonial.empresa}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {testimonial.autor}
                        </div>
                        {testimonial.cargo && (
                          <div className="text-xs text-gray-500">{testimonial.cargo}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {testimonial.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getFormatBadge(testimonial.multimedia)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(testimonial.creadoEn)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(testimonial.actualizadoEn)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
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
                              <div 
                                className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200 ${
                                  index >= currentTestimonials.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleView(testimonial.id)}
                                >
                                  <Eye className='text-gray-600 h-4 w-4' />
                                  <span>Ver detalles</span>
                                </button>
                                <button 
                                  className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleEdit(testimonial.id)}
                                >
                                  <SquarePen className='text-gray-600 h-4 w-4' />
                                  <span>Editar</span>
                                </button>
                                <button 
                                  className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  onClick={() => handleDelete(testimonial.id)}
                                  disabled={mutationDeleteTestimonyById.isPending}
                                >
                                  {mutationDeleteTestimonyById.isPending ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                  ) : (
                                    <Trash2 className='text-red-600 h-4 w-4'/>
                                  )}
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {testimonials.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

      </div>
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
          onDelete={() => {
            handleDelete(viewingTestimonial.id);
            setViewingTestimonial(null);
          }}
        />
      )}
    </div>
  );
};

export default TestimonialsTable;
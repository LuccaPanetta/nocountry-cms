
import { TestimonyResType } from "@/types/testimony-type";
import { MoreHorizontal } from "lucide-react";
import { getStatusBadge } from "./getStatusBagde";
import { getFormatBadge } from "./getFormatBadge";
import { formatDate } from "./formatDate";
import { useTestimonialsTable } from "@/hooks/useTestimonials-table";



type ActionButton = {
    label: string;
    icon: React.ReactNode;
    onClick: (t: TestimonyResType) => void;
    danger?: boolean;
};

interface TestimonialsTableBaseProps {
    title: string;
    subtitle: string;
    testimonials: TestimonyResType[];
    actions: ActionButton[];
    onCloseDropdown?: () => void;
}

export function TestimonialsTableBase({
    title,
    subtitle,
    testimonials,
    actions,
    onCloseDropdown
}: TestimonialsTableBaseProps) {

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        currentTestimonials,
        openDropdown,
        toggleDropdown,
        setOpenDropdown,
        nextPage,
        prevPage
    } = useTestimonialsTable(testimonials)



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
        <div className="w-full pt-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-600 mt-2">{subtitle}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Total: {testimonials.length}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-visible">
                    <div className="overflow-x-auto">

                        <table className="w-full">
                            <thead>
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

                            <tbody>
                                {currentTestimonials.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No hay testimonios disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    currentTestimonials.map((testimonial, idx) => (
                                        <tr key={testimonial.id} className="hover:bg-gray-50">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => toggleDropdown(testimonial.id)}
                                                        className="w-8 h-8 text-gray-500 hover:bg-gray-100 rounded-md"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>

                                                    {openDropdown === testimonial.id && (
                                                        <>
                                                            <div className="fixed inset-0" onClick={() => { 
                                                                setOpenDropdown(null);
                                                                 onCloseDropdown?.(); }} />
                                                            <div className="absolute right-0 w-48 bg-white rounded-md shadow z-20">
                                                                {actions.map((action) => (
                                                                    <button
                                                                        key={action.label}
                                                                        onClick={() => {
                                                                            action.onClick(testimonial);
                                                                            setOpenDropdown(null);
                                                                            onCloseDropdown?.();
                                                                        }}
                                                                        className={`flex justify-between px-4 py-2 text-sm w-full hover:bg-gray-100 
                                      ${action.danger ? "text-red-600" : "text-gray-700"}`}
                                                                    >
                                                                        {action.icon} <span>{action.label}</span>
                                                                    </button>
                                                                ))}
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
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 1
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
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === totalPages
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
        </div>
    );
}

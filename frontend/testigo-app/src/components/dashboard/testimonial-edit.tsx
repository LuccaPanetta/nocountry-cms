'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGetCategories } from '@/services/use-queries-service/categories-query-service';
import { useGetTags } from '@/services/use-queries-service/tags-query-service';
import { TagsInput } from '@/components/testimonials/TagsInput';
import { useGetTestimonyByIdForEdit } from '@/services/use-queries-service/testimonials-query-service';
import { TestimonialsMutationsService } from '@/services/use-mutations-service/testimonials-mutation-service';

type ContentType = 'TEXTO' | 'IMAGEN' | 'VIDEO';


interface TestimonialEditData {
  title: string;
  content: string;
  author: string;
  position?: string;
  company: string;
  category: string;
  imageDescription?: string;
  videoUrl?: string;
  videoDescription?: string;
}

interface TestimonialEditProps {
  testimonialId: string;
  onClose?: () => void;
}

const TestimonialEdit = ({ testimonialId, onClose }: TestimonialEditProps) => {
  const router = useRouter();
  const token = useUserStore((state) => state.token);
  
  // Queries y Mutations
  const { data: testimonialData, isLoading: loadingTestimony } = useGetTestimonyByIdForEdit(testimonialId);
  const { data: categories, isLoading: loadingCategories } = useGetCategories();
  const { data: availableTags, isLoading: loadingTags } = useGetTags();
  const { mutationUpdateTestimonyById, mutationDeleteTestimonyById } = TestimonialsMutationsService();

  // Estados locales
  const [contentType, setContentType] = useState<ContentType>('TEXTO');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Archivos nuevos (opcional)
  const imageFileRef = useRef<File | null>(null);
  const videoFileRef = useRef<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [selectedVideoName, setSelectedVideoName] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TestimonialEditData>();


  const watchedVideoUrl = watch('videoUrl');

  // Cargar datos del testimonio cuando llegan
  useEffect(() => {
    console.log('📊 testimonialData:', testimonialData);
    console.log('📊 testimonialData tipo:', typeof testimonialData);
    console.log('📊 testimonialData es array?:', Array.isArray(testimonialData));

    
    if (testimonialData) {     //&& testimonialData.length > 0
      const testimony = testimonialData.testimonial;
    
      console.log('📝 testimony procesado:', testimony);

      if (!testimony) {
      console.error('❌ No hay testimony después de procesar');
      return;
    }
      
      
      // Setear valores en el formulario
      console.log('✅ Seteando valores...');
      setValue('title', testimony.titulo || '');
      setValue('content', testimony.contenido || '');
      setValue('author', testimony.autor || '');
      setValue('position', testimony.cargo || '');
      setValue('company', testimony.empresa || '');
     
      
      
      if (categories) {
        const categoryObj = categories.find(cat => cat.name === testimony.category);
        if (categoryObj) {
          setValue('category', categoryObj.id);
        }
      }
      // Multimedia
      if (testimony.multimedia) {
        setContentType((testimony.multimedia.tipo || 'TEXTO') as ContentType);
        
        if (testimony.multimedia.tipo === 'VIDEO') {
          setValue('videoUrl', testimony.multimedia.url || '');
          setValue('videoDescription', testimony.multimedia.descripcion || '');
        } else if (testimony.multimedia.tipo === 'IMAGEN') {
          setValue('imageDescription', testimony.multimedia.descripcion || '');
        }
        else {
          console.log('⚠️ testimonialData es null/undefined');
        }
      }
      
      // Tags
      if (testimony.tags && testimony.tags.length > 0) {
        setSelectedTags(testimony.tags);
      }
    }
  }, [testimonialData, setValue, categories]);

  
  // Submit - Actualizar testimonio
  const onSubmit = async (data: TestimonialEditData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('Debes iniciar sesión');
      }

      const formData = new FormData();

      // Campos básicos
      formData.append('contenido', data.content.trim());
      if (data.title?.trim()) formData.append('titulo', data.title.trim());
      if (data.author?.trim()) formData.append('autorNombre', data.author.trim());
      if (data.company?.trim()) formData.append('empresa', data.company.trim());
      if (data.position?.trim()) formData.append('cargo', data.position.trim());
      formData.append('categoryId', data.category);

      // Tags
      if (selectedTags.length > 0 && availableTags) {
        const tagIds = selectedTags
          .map(tagName => availableTags.find(t => t.name === tagName)?.id)
          .filter(Boolean) as string[];
        if (tagIds.length > 0) {
          formData.append('tagIds', JSON.stringify(tagIds));
        }
      }

      // Multimedia - Solo si hay cambios
      if (contentType === 'IMAGEN' && imageFileRef.current) {
        formData.append('file', imageFileRef.current);
        formData.append('tipo', 'IMAGEN');
        if (data.imageDescription?.trim()) {
          formData.append('descripcion', data.imageDescription.trim());
        }
      } else if (contentType === 'VIDEO') {
        if (videoFileRef.current) {
          formData.append('file', videoFileRef.current);
          formData.append('tipo', 'VIDEO');
          if (data.videoDescription?.trim()) {
            formData.append('descripcion', data.videoDescription.trim());
          }
        } else if (data.videoUrl?.trim()) {
          formData.append('multimediaUrl', data.videoUrl.trim());
          formData.append('tipo', 'VIDEO');
          if (data.videoDescription?.trim()) {
            formData.append('descripcion', data.videoDescription.trim());
          }
        }
      }

      console.log('📤 Actualizando testimonio:', testimonialId);

      await mutationUpdateTestimonyById.mutateAsync({
        id: testimonialId,
        data: formData,
      });

      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
        else router.push('/dashboard/editor');
      }, 1500);

    } catch (error) {
      console.error('💥 Error al actualizar:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el testimonio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else router.back();
  };

  if (loadingTestimony) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-Primary" />
          <p className="text-gray-600">Cargando testimonio...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-green-800 mb-2">✅ Testimonio actualizado</h2>
          <p className="text-green-700">Los cambios se guardaron correctamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <button 
        onClick={handleCancel}
        className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver</span>
      </button>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Editar Testimonio
        </h1>
        <p className="text-gray-600">
          Actualiza el contenido y los metadatos de este testimonio
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm font-medium">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-1"></div>

          {/* Columna principal */}
          <div className="col-span-7 space-y-8">
            {/* Información básica */}
            <section className="space-y-4 bg-gray-100 py-3 px-6 border border-gray-300 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900">Información básica</h2>

              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: 'El título es obligatorio' })}
                  className={`w-full bg-white rounded-md border px-3 py-2 text-sm ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-900">
                  Contenido <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  {...register('content', { required: 'El contenido es obligatorio' })}
                  rows={5}
                  className={`w-full bg-white rounded-md border px-3 py-2 text-sm ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="author" className="block text-sm font-medium text-gray-900">
                  Autor <span className="text-red-500">*</span>
                </label>
                <input
                  id="author"
                  type="text"
                  {...register('author', { required: 'El autor es obligatorio' })}
                  className={`w-full bg-white rounded-md border px-3 py-2 text-sm ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="position" className="block text-sm font-medium text-gray-900">
                  Cargo
                </label>
                <input
                  id="position"
                  type="text"
                  {...register('position')}
                  className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="block text-sm font-medium text-gray-900">
                  Empresa / Institución <span className="text-red-500">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  {...register('company', { required: 'La empresa es obligatoria' })}
                  className={`w-full bg-white rounded-md border px-3 py-2 text-sm ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
              </div>
            </section>

           
            {/* Metadata */}
            <section className="space-y-4 bg-gray-100 py-3 px-6 border border-gray-300 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                  Categoría
                </label>
                <select
                  id="category"
                  {...register('category')}
                  disabled={loadingCategories}
                  className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
          

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Tags
                </label>

                <TagsInput
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  isLoading={loadingTags}
                  maxTags={5}
                />
                
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedTags.length}/5 tags seleccionados
              </p>
            </section>
          </div>

          {/* Columna de acciones */}
          <div className="col-span-3 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-Primary px-8 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-Primary bg-white px-8 py-3 font-medium text-Primary transition-opacity hover:opacity-90"
            >
              Cancelar
            </button>
          
          </div>
        </div>
      </form>
    </div>
  );
};

export default TestimonialEdit;
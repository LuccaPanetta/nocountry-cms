'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { useGetCategories } from '@/services/use-queries-service/categories-query-service';
import { useGetTags } from '@/services/use-queries-service/tags-query-service';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { X, Upload, ChevronsUpDown, MessageCircle, CirclePlay, Image } from 'lucide-react';

type ContentType = 'text' | 'image' | 'video';

interface TestimonialFormData {
  title: string;
  category: string;
  author: string;
  company: string;
  position?: string;
  contentType: ContentType;
  testimonialContent: string;
  imageDescription?: string;
  videoUrl?: string;
  videoDescription?: string;
}

export function TestimonialForm() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [videoSource, setVideoSource] = useState<'url' | 'file' | null>(null);
  const [open, setOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ MANEJAR ARCHIVOS CON useRef
  const imageFileRef = useRef<File | null>(null);
  const videoFileRef = useRef<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [selectedVideoName, setSelectedVideoName] = useState<string>('');
  
  const router = useRouter();
  const { data: categories, isLoading: loadingCategories } = useGetCategories();
  const { data: availableTags, isLoading: loadingTags } = useGetTags();
  const token = useUserStore((state) => state.token);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    defaultValues: { contentType: 'text' },
  });

  const contentType = watch('contentType');
  const videoUrlValue = watch('videoUrl');

  // ✅ MANEJAR IMAGEN
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      imageFileRef.current = file;
      setSelectedImageName(file.name);
      console.log('📸 Imagen seleccionada:', file.name);
    }
  };

  // ✅ MANEJAR VIDEO FILE
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      videoFileRef.current = file;
      setSelectedVideoName(file.name);
      setVideoSource('file');
      setValue('videoUrl', '');
      console.log('🎬 Video seleccionado:', file.name);
    }
  };

  // ✅ LIMPIAR SELECCIONES
  const clearImageSelection = () => {
    imageFileRef.current = null;
    setSelectedImageName('');
  };

  const clearVideoFileSelection = () => {
    videoFileRef.current = null;
    setSelectedVideoName('');
    setVideoSource(null);
  };

  // ✅ ONSUBMIT CORREGIDO
  const onSubmit = async (data: TestimonialFormData) => {
    console.log('🚀 onSubmit INICIADO');
    setIsSubmitting(true);
    setError(null);

    try {
      // ✅ VALIDACIONES
      if (!data.testimonialContent || data.testimonialContent.trim().length < 10) {
        throw new Error('El contenido debe tener al menos 10 caracteres');
      }
      if (!data.category) throw new Error('Selecciona una categoría');
      if (!data.author?.trim()) throw new Error('El autor es requerido');
      if (!data.company?.trim()) throw new Error('La empresa es requerida');

      // ✅ VALIDAR IMAGEN SI ES TIPO IMAGEN
      if (contentType === 'image' && !imageFileRef.current) {
        throw new Error('Debes seleccionar una imagen');
      }

      // ✅ VALIDAR VIDEO SI ES TIPO VIDEO
      if (contentType === 'video') {
        if (videoSource === 'file' && !videoFileRef.current) {
          throw new Error('Debes seleccionar un archivo de video');
        }
        if (videoSource === 'url' && !data.videoUrl?.trim()) {
          throw new Error('Debes ingresar una URL de video');
        }
        if (!videoSource) {
          throw new Error('Debes seleccionar un archivo o ingresar una URL');
        }
      }

      const formData = new FormData();

      // ✅ CAMPOS DE TEXTO
      formData.append('contenido', data.testimonialContent.trim());
      if (data.title?.trim()) formData.append('titulo', data.title.trim());
      if (data.author?.trim()) formData.append('autorNombre', data.author.trim());
      if (data.company?.trim()) formData.append('empresa', data.company.trim());
      if (data.position?.trim()) formData.append('cargo', data.position.trim());
      formData.append('categoryId', data.category);

      // ✅ TAGS
      if (tags.length > 0 && availableTags) {
        const tagIds = tags
          .map(tagName => availableTags.find(t => t.name === tagName)?.id)
          .filter(Boolean) as string[];
        if (tagIds.length > 0) {
          formData.append('tagIds', JSON.stringify(tagIds));
        }
      }

      // ✅ MULTIMEDIA - USANDO LOS REFS
      if (contentType === 'image' && imageFileRef.current) {
        formData.append('file', imageFileRef.current);
        formData.append('tipo', 'IMAGEN');
        if (data.imageDescription?.trim()) {
          formData.append('descripcion', data.imageDescription.trim());
        }
        console.log('📸 Enviando imagen:', imageFileRef.current.name);
      }
      else if (contentType === 'video' && videoFileRef.current) {
        formData.append('file', videoFileRef.current);
        formData.append('tipo', 'VIDEO');
        if (data.videoDescription?.trim()) {
          formData.append('descripcion', data.videoDescription.trim());
        }
        console.log('🎬 Enviando video file:', videoFileRef.current.name);
      }
      else if (contentType === 'video' && data.videoUrl?.trim()) {
        formData.append('multimediaUrl', data.videoUrl.trim());
        if (data.videoDescription?.trim()) {
          formData.append('descripcion', data.videoDescription.trim());
        }
        console.log('🔗 Enviando URL de video:', data.videoUrl);
      }

      console.log('🔍 FormData creado, campos:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[0] === 'file' ? '[ARCHIVO]' : pair[1]);
      }

      // ✅ ENVIAR
      const API_URL = process.env.NEXT_PUBLIC_URL_BASE || 'https://nocountry-cms.onrender.com/api/v1';
      console.log('📤 Enviando a:', `${API_URL}/testimonials`);
      console.log('🔑 Token:', token ? 'PRESENTE' : 'AUSENTE');

      const response = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(errorText || `Error ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Éxito:', result);

      // Éxito
      setShowNotification(true);
      setTimeout(() => router.push('/testimonials'), 2000);

    } catch (error) {
      console.error('💥 Error completo:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl md:min-w-3xl p-6">
      <h1 className="mb-4 text-Accent text-3xl text-center font-bold">Creá tu testimonio</h1>
      <p className='text-center mb-8'>Compartí tu experiencia y ayudanos a darle voz</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm font-medium">❌ {error}</p>
        </div>
      )}


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* TÍTULO */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-900">
            Título <span className="text-Error">*</span>
          </label>
          <input
            id="title"
            {...register('title', { required: 'El título es obligatorio' })}
            placeholder='Ej: Transformación digital exitosa'
            className={`w-full rounded-md border px-3 py-2 text-sm ${errors.title ? 'border-Error' : 'border-gray-300'}`}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* CONTENIDO */}
        <div className="space-y-2">
          <label htmlFor="testimonialContent" className="block text-sm font-medium text-gray-900">
            Contenido <span className="text-red-500">*</span>
          </label>
          <textarea
            id="testimonialContent"
            {...register('testimonialContent', {
              required: 'El contenido es obligatorio',
              minLength: { value: 10, message: 'Mínimo 10 caracteres' }
            })}
            placeholder="Escribe aquí tu testimonio..."
            rows={6}
            className={`w-full rounded-md border px-3 py-2 text-sm ${errors.testimonialContent ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.testimonialContent && <p className="text-sm text-red-500">{errors.testimonialContent.message}</p>}
        </div>

        {/* CATEGORÍA */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-900">
            Categoría <span className="text-Error">*</span>
          </label>
          <select
            id="category"
            disabled={loadingCategories}
            {...register('category', { required: 'Selecciona una categoría' })}
            className={`w-full rounded-md border px-3 py-2 text-sm ${errors.category ? 'border-Error' : 'border-gray-300'}`}
          >
            <option value="">{loadingCategories ? 'Cargando...' : 'Selecciona'}</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
        </div>

        {/* AUTOR */}
        <div className="space-y-2">
          <label htmlFor="author" className="block text-sm font-medium text-gray-900">
            Autor <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            {...register('author', { required: 'El autor es obligatorio' })}
            placeholder='Nombre completo'
            className={`w-full rounded-md border px-3 py-2 text-sm ${errors.author ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
        </div>

        {/* EMPRESA */}
        <div className="space-y-2">
          <label htmlFor="company" className="block text-sm font-medium text-gray-900">
            Empresa / Institución <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            {...register('company', { required: 'La empresa es obligatoria' })}
            placeholder='Nombre de la organización'
            className={`w-full rounded-md border px-3 py-2 text-sm ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
        </div>

        {/* CARGO */}
        <div className="space-y-2">
          <label htmlFor="position" className="block text-sm font-medium text-gray-900">
            Cargo (opcional)
          </label>
          <input
            id="position"
            {...register('position')}
            placeholder='Director, Profesor, etc'
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

         {/* TIPO DE CONTENIDO */}
        <div className="space-y-2">
          <p className="block text-sm font-medium text-gray-900">Tipo de contenido</p>
          <div className="flex gap-3">
            {(['text', 'image', 'video'] as ContentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setValue('contentType', type);
                  if (type !== 'image') clearImageSelection();
                  if (type !== 'video') clearVideoFileSelection();
                  if (type !== 'video') setVideoSource(null);
                }}
                className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm ${
                  contentType === type ? 'bg-Primary text-white' : 'border border-gray-300'
                }`}
              >
                {type === 'text' && <MessageCircle className='h-4 w-4' />}
                {type === 'image' && <Image className='h-4 w-4' />}
                {type === 'video' && <CirclePlay className='h-4 w-4' />}
                <p>{type === 'text' ? 'Texto' : type === 'image' ? 'Imagen' : 'Video'}</p>
              </button>
            ))}
          </div>
        </div>

        {/* IMAGEN */}
        {contentType === 'image' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Imagen <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="imageFile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8 text-center hover:border-blue-500">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    {selectedImageName || 'Selecciona una imagen'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB</p>
                </div>
              </div>
              {selectedImageName && (
                <div className="mt-2 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ {selectedImageName}
                  </p>
                </div>
              )}
            </div>

            {/* DESCRIPCIÓN DE IMAGEN */}
            <div className="space-y-2">
              <label htmlFor="imageDescription" className="block text-sm font-medium text-gray-900">
                Descripción de la imagen <span className="text-red-500">*</span>
              </label>
              <textarea
                id="imageDescription"
                {...register('imageDescription', { 
                  required: 'La descripción es obligatoria' 
                })}
                placeholder="Describe qué se muestra en la imagen..."
                rows={4}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  errors.imageDescription ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.imageDescription && (
                <p className="text-sm text-red-500">{errors.imageDescription.message}</p>
              )}
            </div>
          </div>
        )}

        {/* BOTÓN SUBMIT */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push("/testimonials")}
            disabled={isSubmitting}
            className="flex-1 border border-Primary bg-white px-4 py-3 text-sm font-medium text-Primary rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-Primary px-4 py-3 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Crear testimonio'}
          </button>
        </div>
      </form>
    </div>
  );
}
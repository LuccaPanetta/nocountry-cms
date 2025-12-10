'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useGetCategories } from '@/services/use-queries-service/categories-query-service'; // ← AGREGAR
import { useGetTags } from '@/services/use-queries-service/tags-query-service';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import TestimonialNotification from './notification';
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
  imageFile?: FileList;         
  imageDescription?: string;    
  videoUrl?: string;  
  videoFile?: FileList;          
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
  const router = useRouter();
  const { data: categories, isLoading: loadingCategories } = useGetCategories();
  const { data: availableTags, isLoading: loadingTags } = useGetTags();
  const token = useUserStore((state) => state.token);


const TAG_MAP: Record<string, string> = {
  'tecnologia': '4b798ee0-a5e7-48e1-a349-c728e1fd4c87', // tecnología
  'soporte': 'e0e50624-89e7-4e41-bfa3-b6598140a04f', // soporte-técnico
  'facilidad-uso': '39f4c8cd-0f8d-44f8-af32-4ac444637ee6',
  'recomendacion': '2bfd27d4-6984-4184-b3ff-0e595e031f05', // recomendación
  'empresa': 'a5dbcc02-0631-484b-aefd-d8a62899dcee',
  'innovacion': '38ba3a8f-bca6-46df-8315-82fcb7b8e71f' // innovación
};

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    defaultValues: {
      contentType: 'text',
    },
  });

  const contentType = watch('contentType');

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setTagInput('');
      setOpen(false); // Cerrar el popover después de agregar
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TestimonialFormData) => {
  setIsSubmitting(true);
  setError(null);
  
  if (!token) {
    setError('No estás autenticado. Por favor, inicia sesión primero.');
    setIsSubmitting(false);
    return;
  }
  
  try {
    const formData = new FormData();
    
    // ✅ CAMPOS CORRECTOS SEGÚN LA DOCUMENTACIÓN
    
    // Campo REQUERIDO
    formData.append('contenido', data.testimonialContent || '');
    
    // Campos OPCIONALES
    if (data.title) formData.append('titulo', data.title);
    if (data.author) formData.append('autorNombre', data.author);  // ← CORRECTO
    if (data.company) formData.append('empresa', data.company);
    if (data.position) formData.append('cargo', data.position);
    
    // ✅ categoryId es REQUERIDO (UUID)
    const categoryId = data.category;

    if (!categoryId) {
      throw new Error(`Por favor selecciona una categoría`);
    }
    formData.append('categoryId', categoryId);
    
    // ✅ tagIds es OPCIONAL (UUIDs separados por comas)
    if (tags.length > 0 && availableTags) {
      const tagIds = tags
        .map(tagName => {
          const foundTag = availableTags.find(t => t.name === tagName);
          return foundTag?.id;
        })
        .filter(Boolean);
      
      if (tagIds.length > 0) {
        formData.append('tagIds', tagIds.join(','));
      }
    }
    
    // ✅ MULTIMEDIA
    // Si es imagen o video con archivo
    if (data.contentType === 'image' && data.imageFile?.[0]) {
      formData.append('file', data.imageFile[0]);
      formData.append('tipo', 'IMAGEN');  // ← DEBE SER "IMAGEN", NO "IMAGE"
      if (data.imageDescription) {
        formData.append('descripcion', data.imageDescription);
      }
    } else if (data.contentType === 'video' && data.videoFile?.[0]) {
      formData.append('file', data.videoFile[0]);
      formData.append('tipo', 'VIDEO');  // ← CORRECTO
      if (data.videoDescription) {
        formData.append('descripcion', data.videoDescription);
      }
    } else if (data.contentType === 'video' && data.videoUrl) {
      // Si es URL de video (YouTube/Vimeo)
      formData.append('multimediaUrl', data.videoUrl);
      if (data.videoDescription) {
        formData.append('descripcion', data.videoDescription);
      }
    }
    // Si es tipo "text", no agregamos nada de multimedia
    
    const API_URL = process.env.NEXT_PUBLIC_URL_BASE || 'https://nocountry-cms.onrender.com/api/v1';
    
    console.log('🚀 Enviando a:', `${API_URL}/testimonials`);
    console.log('🔑 Token presente:', token ? 'SÍ' : 'NO');
    console.log('📦 Datos a enviar:');
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
    
    const response = await fetch(`${API_URL}/testimonials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO agregar Content-Type, FormData lo maneja automáticamente
      },
      body: formData,
    });
    
    console.log('📡 Response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType?.includes('text/html')) {
        throw new Error(`Error ${response.status}: El servidor devolvió HTML en vez de JSON`);
      }
      
      const errorData = await response.json();
      console.error('❌ Error del servidor COMPLETO:', errorData);
      
      if (errorData.errors && Array.isArray(errorData.errors)) {
        console.error('📋 Errores de validación:');
        errorData.errors.forEach((error: any, index: number) => {
          console.error(`  ${index + 1}.`, JSON.stringify(error, null, 2));
        });
        
        const errorMessages = errorData.errors.map((e: any) => {
          if (typeof e === 'string') return e;
          if (e.errors && e.errors[0]?.message) return `${e.field}: ${e.errors[0].message}`;
          if (e.message) return e.message;
          return JSON.stringify(e);
        }).join(' | ');
        
        throw new Error(`Errores de validación: ${errorMessages}`);
      }
      
      throw new Error(errorData.message || `Error ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Testimonio creado exitosamente:', result);
    
    setTimeout(() => {
      setShowNotification(true);
    }, 300);
    
    setVideoSource(null);
    setTags([]);
    
  } catch (error) {
    console.error('💥 Error completo:', error);
    setError(
      error instanceof Error 
        ? error.message 
        : 'Error al enviar el testimonio'
    );
  } finally {
    setIsSubmitting(false);
  }
};


  const handleCancel = () => {
    console.log('Form cancelled');
    router.push("/testimonials")
  };

  return (
    <div className="mx-auto max-w-2xl md:min-w-3xl p-6">
      <h1 className="mb-4 text-Accent text-3xl text-center font-bold">Creá tu testimonio</h1>
      <p className='text-center mb-8 '>Compartí tu experiencia y ayudanos a darle voz</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-900">
            Titulo <span className="text-Error">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'El título es obligatorio' })}
            placeholder='Ej: Transfromación digital exitosa'
            className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.title
                ? 'border-Error focus:ring-Error'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-900">
            Categoria <span className="text-Error">*</span>
          </label>
          <select
            id="category"
            defaultValue=""
            disabled={loadingCategories}
            {...register('category', { required: 'Seleccione una categoria'})}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 ${
              errors.category
                ? 'border-Error focus:ring-Error'
                : 'border-gray-300 focus:ring-blue-500'
            } ${loadingCategories ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}
            </option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="block text-sm font-medium text-gray-900">
            Autor <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            {...register('author', { required: 'El autor es obligatorio' })}
            placeholder='Nombre completo'
            className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.author
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.author && (
            <p className="text-sm text-red-500">{errors.author.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="block text-sm font-medium text-gray-900">
            Empresa/Institucion <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            type="text"
            {...register('company', {
              required: 'La empresa/institución es obligatoria',
            })}
            placeholder='Nombre de la organización'
            className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.company
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.company && (
            <p className="text-sm text-red-500">{errors.company.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="position" className="block text-sm font-medium text-gray-900">
            Cargo
          </label>
          <input
            id="position"
            type="text"
            {...register('position')}
            placeholder='Director, Profesor, etc'
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <p className="block text-sm font-medium text-gray-900">Tipo de contenido</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('contentType', 'text')}
              className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contentType === 'text'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageCircle 
              className='h-4 w-4'
              />
              <p>Texto</p>
            </button>
            <button
              type="button"
              onClick={() => setValue('contentType', 'image')}
              className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contentType === 'image'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Image 
              className='h-4 w-4'
              />
              <p>Imagen</p>
            </button>
            <button
              type="button"
              onClick={() => setValue('contentType', 'video')}
              className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contentType === 'video'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CirclePlay  
              className='h-4 w-4'
              />
              <p>Video</p>
            </button>
          </div>
        </div>

        {contentType === 'text' && (
          <div className="space-y-2">
            <label htmlFor="testimonialContent" className="block text-sm font-medium text-gray-900">
              Contenido del testimonio <span className="text-red-500">*</span>
            </label>
            <textarea
              id="testimonialContent"
              {...register('testimonialContent', {
                required: contentType === 'text' ? 'El contenido del testimonio es obligatorio' : false,
              })}
              placeholder="Escribe el contenido del testimonio aquí..."
              rows={6}
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.testimonialContent
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.testimonialContent && (
              <p className="text-sm text-red-500">{errors.testimonialContent.message}</p>
            )}
          </div>
        )}
        
        {contentType === 'image' && (
          <div className="space-y-4">
            {/* Campo de archivo de imagen con diseño personalizado */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Imagen de testimonio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="imageFile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  {...register('imageFile', {
                    required: contentType === 'image' ? 'La imagen es obligatoria' : false,
                  })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-md px-6 py-8 text-center transition-colors ${
                  errors.imageFile
                    ? 'border-red-500'
                    : 'border-gray-300 hover:border-blue-500'
                }`}>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    Seleccione o arrastre aquí su imagen
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG Máximo 10MB
                  </p>
                </div>
              </div>
              {errors.imageFile && (
                <p className="text-sm text-red-500">{errors.imageFile.message}</p>
              )}
            </div>

            {/* Campo de descripción de imagen */}
            <div className="space-y-2">
              <label htmlFor="imageDescription" className="block text-sm font-medium text-gray-900">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="imageDescription"
                {...register('imageDescription', {
                  required: contentType === 'image' ? 'La descripción es obligatoria' : false,
                })}
                placeholder="Escribe una descripción para la imagen..."
                rows={4}
                className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.imageDescription
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.imageDescription && (
                <p className="text-sm text-red-500">{errors.imageDescription.message}</p>
              )}
            </div>
          </div>
        )}

        {contentType === 'video' && (
  <div className="space-y-4">
    {/* Campo de URL de video */}
    <div className="space-y-2">
      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-900">
        URL del video {!videoSource || videoSource === 'url' ? <span className="text-red-500">*</span> : ''}
      </label>
      <input
        id="videoUrl"
        type="text"
        disabled={videoSource === 'file'}
        {...register('videoUrl', {
          required: contentType === 'video' && videoSource !== 'file' ? 'La URL del video es obligatoria' : false,
        })}
        onChange={(e) => {
          if (e.target.value.trim()) {
            setVideoSource('url');
            setValue('videoFile', undefined); // Limpiar el archivo
          } else if (!e.target.value.trim() && videoSource === 'url') {
            setVideoSource(null);
          }
        }}
        placeholder="https://youtube.com/watch?v=..."
        className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          videoSource === 'file' 
            ? 'bg-gray-100 cursor-not-allowed' 
            : errors.videoUrl
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {errors.videoUrl && (
        <p className="text-sm text-red-500">{errors.videoUrl.message}</p>
      )}
    </div>

    {/* Separador visual */}
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-gray-300"></div>
      <span className="text-sm text-gray-500">O</span>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>

    {/* Campo de archivo de video */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Archivo de video {videoSource === 'file' ? <span className="text-red-500">*</span> : ''}
      </label>
      <div className="relative">
        <input
          id="videoFile"
          type="file"
          accept="video/mp4,video/quicktime"
          disabled={videoSource === 'url'}
          {...register('videoFile')}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setVideoSource('file');
              setValue('videoUrl', ''); // Limpiar la URL
            } else if (!e.target.files?.length && videoSource === 'file') {
              setVideoSource(null);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed rounded-md px-6 py-8 text-center transition-colors ${
          videoSource === 'url'
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-500'
        }`}>
          <Upload className={`mx-auto h-12 w-12 mb-3 ${
            videoSource === 'url' ? 'text-gray-300' : 'text-gray-400'
          }`} />
          <p className={`text-sm ${
            videoSource === 'url' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {videoSource === 'url' 
              ? 'Deshabilitado (usando URL)' 
              : 'Arrastra un video o haz click para seleccionar'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            MP4, MOV hasta 100MB
          </p>
        </div>
      </div>
   {/*    {videoSource === 'file' && watch('videoFile') && watch('videoFile').length > 0 && (  //Aviso, esto lo detecta como error, pero hasta donde lo probe funciona bien
        <p className="text-sm text-green-600">
          Archivo seleccionado: {watch('videoFile')[0].name}
        </p>
      )} */}
    </div>

    {/* Campo de descripción de video */}
    <div className="space-y-2">
      <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-900">
        Descripción <span className="text-red-500">*</span>
      </label>
      <textarea
        id="videoDescription"
        {...register('videoDescription', {
          required: contentType === 'video' ? 'La descripción es obligatoria' : false,
        })}
        placeholder="Escribe una descripción para el video..."
        rows={4}
        className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          errors.videoDescription
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {errors.videoDescription && (
        <p className="text-sm text-red-500">{errors.videoDescription.message}</p>
      )}
    </div>
  </div>
)}

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-900">
      Tags
    </label>
  
  <Popover open={open} onOpenChange={setOpen} >
    <PopoverTrigger asChild>
      <button
        type="button"
        className="w-full flex items-center justify-between z-10 rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-gray-600">
          {tagInput || "Selecciona o escribe un tag..."}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
      </button>
    </PopoverTrigger>
    
    <PopoverContent className="w-[400px] z-10 bg-white p-0" align="start">
      <Command>
        <CommandInput 
          placeholder="Buscar o agregar tag..." 
          value={tagInput}
          onValueChange={setTagInput}
        />
        <CommandEmpty>
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="w-full p-2 text-sm text-blue-600 hover:bg-blue-50 text-left"
          >
            Agregar "{tagInput}"
          </button>
        </CommandEmpty>
        <CommandGroup>
          {availableTags
            ?.filter(tag => !tags.includes(tag.name))
            .map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => handleAddTag(tag.name)}
                className="cursor-pointer"
              >
                {tag.name}
              </CommandItem>
            ))}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
  
  {tags.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="gap-1 bg-blue-100 text-blue-900 hover:bg-blue-200"
        >
          {tag}
          <button
            type="button"
            onClick={() => handleRemoveTag(index)}
            className="ml-1 hover:text-red-600 focus:outline-none"
          >
            <X size={14} />
          </button>
        </Badge>
      ))}
    </div>
  )}
</div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 border border-Primary bg-white px-4 py-2 text-sm font-medium text-Primary transition-colors hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-Primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 duration-300"
          >
            Crear
          </button>
        </div>
      </form>
     {/*  {showNotification && (
      <TestimonialNotification onClose={() => setShowNotification(false)} />
      )} */}
    </div>
  );
}

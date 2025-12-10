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
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { useGetCategories } from '@/services/use-queries-service/categories-query-service';
import { useGetTags } from '@/services/use-queries-service/tags-query-service';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import TestimonialNotification from './notification';
import { X, Upload, ChevronsUpDown, MessageCircle, CirclePlay, Image, Trash2 } from 'lucide-react';

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
  
  // ✅ NUEVOS STATES PARA PREVIEW
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImageFileName, setSelectedImageFileName] = useState<string>('');
  const [selectedVideoFileName, setSelectedVideoFileName] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  
  const router = useRouter();
  const { data: categories, isLoading: loadingCategories } = useGetCategories();
  const { data: availableTags, isLoading: loadingTags } = useGetTags();
  const token = useUserStore((state) => state.token);
  const user = useUserStore((state) => state.setUserData);
  
  // ✅ REFS PARA LIMPIAR INPUTS DE ARCHIVOS
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    resetField,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    defaultValues: {
      contentType: 'text',
    },
  });

  const contentType = watch('contentType');
  const videoUrlValue = watch('videoUrl');

  // ✅ DEBUG: Verificar token al cargar
  useEffect(() => {
  if (categories) {
    console.log('📂 Categorías disponibles:', categories.map(c => ({ 
      id: c.id, 
      name: c.name 
    })));
    
    // Selecciona automáticamente la primera categoría para pruebas
    if (categories.length > 0 && !watch('category')) {
      setValue('category', categories[0].id);
      console.log('✅ Categoría auto-seleccionada:', categories[0].name);
    }
  }
}, [categories, setValue, watch]);

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setTagInput('');
      setOpen(false);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // ✅ FUNCIÓN PARA MANEJAR IMAGEN
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFileName(file.name);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log('📸 Imagen seleccionada:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });
    }
  };

  // ✅ FUNCIÓN PARA LIMPIAR IMAGEN
  const clearImageSelection = () => {
    setSelectedImagePreview(null);
    setSelectedImageFileName('');
    setValue('imageFile', undefined);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
    resetField('imageFile');
  };

  // ✅ FUNCIÓN PARA MANEJAR VIDEO FILE
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFileName(file.name);
      setVideoSource('file');
      setValue('videoUrl', '');
      
      console.log('🎬 Video seleccionado:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });
    }
  };

  // ✅ FUNCIÓN PARA LIMPIAR VIDEO FILE
  const clearVideoFileSelection = () => {
    setSelectedVideoFileName('');
    setVideoSource(null);
    setValue('videoFile', undefined);
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
    resetField('videoFile');
  };

  const onSubmit = async (data: TestimonialFormData) => {
  setIsSubmitting(true);
  setError(null);

  console.log('🚀 Iniciando envío del formulario...');
  console.log('📋 contenido value:', data.testimonialContent);
  console.log('📋 contenido trimmed length:', data.testimonialContent?.trim().length);
  
  // ✅ VALIDACIÓN CRÍTICA: contenido no puede estar vacío
  if (!data.testimonialContent || data.testimonialContent.trim().length < 10) {
    const errorMsg = 'El contenido del testimonio es requerido y debe tener al menos 10 caracteres';
    console.error('❌', errorMsg);
    setError(errorMsg);
    setIsSubmitting(false);
    return;
  }
    
    if (!token) {
      const errorMsg = 'No estás autenticado. Por favor, inicia sesión primero.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setIsSubmitting(false);
      router.push('/login');
      return;
    }

    try {
      const formData = new FormData();

      // ✅ CAMPOS REQUERIDOS Y OPCIONALES
      formData.append('contenido', data.testimonialContent || '');
      
     // ✅ 2. CAMPOS OPCIONALES (solo si tienen valor)
    if (data.title && data.title.trim()) {
      formData.append('titulo', data.title.trim());
    }
    
    if (data.author && data.author.trim()) {
      formData.append('autorNombre', data.author.trim());
    }
    
    if (data.company && data.company.trim()) {
      formData.append('empresa', data.company.trim());
    }
    
    if (data.position && data.position.trim()) {
      formData.append('cargo', data.position.trim());
    }

    // ✅ 3. CATEGORÍA (UUID REQUERIDO)
    if (!data.category) {
      throw new Error('Por favor selecciona una categoría');
    }
    formData.append('categoryId', data.category);

    // ✅ 4. TAGS - ENVIAR COMO STRING JSON ARRAY según DTO
    if (tags.length > 0 && availableTags) {
      const tagIds = tags
        .map(tagName => {
          const foundTag = availableTags.find(t => t.name === tagName);
          return foundTag?.id;
        })
        .filter(Boolean);
      
      if (tagIds.length > 0) {
        // El DTO espera string JSON array: ["id1", "id2"] o string separado por comas
        formData.append('tagIds', JSON.stringify(tagIds)); // ← ENVIAR COMO JSON STRING
        console.log('🏷️ Tags enviados como JSON:', JSON.stringify(tagIds));
      }
    }

      // ✅ MULTIMEDIA: MANEJAR 3 CASOS
      
      // CASO B: VIDEO CON ARCHIVO
    else if (data.contentType === 'video' && data.videoFile?.[0]) {
      const file = data.videoFile[0];
      formData.append('file', file);
      formData.append('tipo', 'VIDEO'); // ← ENUM correcto
      
      if (data.videoDescription && data.videoDescription.trim()) {
        formData.append('descripcion', data.videoDescription.trim());
      }
      
      console.log('🎬 Enviando video file:', file.name);
    }
    
    // CASO C: VIDEO CON URL
    else if (data.contentType === 'video' && data.videoUrl) {
      // El DTO usa 'multimediaUrl' no 'videoUrl'
      formData.append('multimediaUrl', data.videoUrl.trim());
      
      if (data.videoDescription && data.videoDescription.trim()) {
        formData.append('descripcion', data.videoDescription.trim());
      }
      
      console.log('🔗 Enviando URL de video:', data.videoUrl);
    }

      const API_URL = process.env.NEXT_PUBLIC_URL_BASE || 'https://nocountry-cms.onrender.com/api/v1';
      
     console.log('🔍 DEBUG FINAL - FormData a enviar:');
    for (let pair of formData.entries()) {
      const value = pair[0] === 'file' ? `[FILE: ${(pair[1] as File).name}]` : pair[1];
      console.log(`  ${pair[0]}: ${value}`);
    }

       // ✅ 6. ENVIAR CON FETCH
    const response = await fetch(`${API_URL}/testimonials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

      console.log('📡 Response status:', response.status);
    console.log('📡 Response OK?', response.ok);
      
     // ✅ 7. MANEJO DE RESPUESTA MEJORADO
    const contentType = response.headers.get('content-type');
    console.log('📡 Response Content-Type:', contentType);
    
    if (!response.ok) {
      let errorText = '';
      let errorJson = null;
      
      try {
        errorText = await response.text();
        console.log('❌ Raw error response:', errorText);
        
        if (errorText.trim()) {
          try {
            errorJson = JSON.parse(errorText);
            console.log('❌ Parsed error JSON:', errorJson);
          } catch {
            // No es JSON válido
          }
        }
      } catch (readError) {
        console.error('❌ Error reading response:', readError);
      }
      
      // Mensajes de error específicos
      if (response.status === 400) {
        if (errorJson?.message) {
          throw new Error(`Error de validación: ${errorJson.message}`);
        } else if (errorJson?.errors) {
          const errorMessages = errorJson.errors
            .map((err: any) => err.constraints ? Object.values(err.constraints)[0] : err.message || err)
            .filter(Boolean)
            .join(', ');
          throw new Error(`Errores de validación: ${errorMessages}`);
        } else {
          throw new Error('Error 400: Datos inválidos. Revisa que todos los campos sean correctos.');
        }
      } else if (response.status === 401) {
        throw new Error('No autorizado. Tu sesión puede haber expirado.');
      } else {
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
    }

       // ✅ 8. PROCESAR RESPUESTA EXITOSA
    const result = await response.json();
    console.log('✅ ÉXITO - Testimonio creado:', result);

    // Mostrar notificación y redirigir
    setShowNotification(true);
    setTimeout(() => {
      router.push('/testimonials');
    }, 2000);

    // Resetear form
    setVideoSource(null);
    setTags([]);
    setSelectedImagePreview(null);
    setSelectedImageFileName('');
    setSelectedVideoFileName('');

  } catch (error) {
    console.error('💥 Error completo en onSubmit:', error);
    setError(
      error instanceof Error
        ? error.message
        : 'Error inesperado al enviar el testimonio. Por favor, intenta de nuevo.'
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCancel = () => {
    console.log('Form cancelled');
    router.push("/testimonials");
  };

  return (
    <div className="mx-auto max-w-2xl md:min-w-3xl p-6">
      {/* ✅ BOTÓN DEBUG TEMPORAL */}
      <button
        type="button"
        onClick={() => {
          console.log('🔍 Debug completo:', {
            token,
            tokenLength: token?.length,
            tokenValid: token?.startsWith('eyJ'),
            user,
            localStorageToken: localStorage.getItem('token'),
            sessionStorageToken: sessionStorage.getItem('token'),
            isTokenValid
          });
        }}
        className="mb-4 p-2 bg-gray-200 text-sm rounded-md"
      >
        🔍 Debug Token
      </button>

      <h1 className="mb-4 text-Accent text-3xl text-center font-bold">Creá tu testimonio</h1>
      <p className='text-center mb-8 '>Compartí tu experiencia y ayudanos a darle voz</p>

      {/* ✅ MENSAJE DE ERROR DE TOKEN */}
      {!isTokenValid && token && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            ⚠️ Tu token de sesión parece inválido. Por favor, <button 
              type="button" 
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline"
            >
              inicia sesión de nuevo
            </button>.
          </p>
        </div>
      )}

      {/* ✅ MENSAJE DE ERROR GENERAL */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm font-medium">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       <div className="space-y-2">
  <label htmlFor="testimonialContent" className="block text-sm font-medium text-gray-900">
    Contenido del testimonio <span className="text-red-500">*</span>
    <span className="text-xs text-gray-500 ml-2">(requerido para todos los tipos de contenido)</span>
  </label>
  <textarea
    id="testimonialContent"
    {...register('testimonialContent', {
      required: 'El contenido del testimonio es obligatorio',
      minLength: {
        value: 10,
        message: 'El contenido debe tener al menos 10 caracteres'
      }
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
  <p className="text-xs text-gray-500">
    Describe tu experiencia. Mínimo 10 caracteres.
  </p>
</div>
{/* En el return, después del título */}
<button
  type="button"
  onClick={async () => {
    console.log('🧪 TEST: Enviando datos MÍNIMOS para debug...');
    
    const testFormData = new FormData();
    testFormData.append('contenido', 'Este es un contenido de prueba con más de 10 caracteres para pasar la validación');
    testFormData.append('titulo', 'Título de prueba');
    testFormData.append('autorNombre', 'Autor Prueba');
    testFormData.append('empresa', 'Empresa Prueba');
    
    // Usa una categoría que SABES que existe
    const knownCategoryId = categories?.[0]?.id;
    if (!knownCategoryId) {
      console.error('❌ No hay categorías disponibles');
      return;
    }
    testFormData.append('categoryId', knownCategoryId);
    
    console.log('🔍 Test FormData:');
    for (let pair of testFormData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_URL_BASE;
      const response = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: testFormData,
      });
      
      console.log('📡 Test Response Status:', response.status);
      
      const text = await response.text();
      console.log('📄 Test Response Body:', text);
      
      if (response.ok) {
        console.log('✅ TEST EXITOSO');
        alert('✅ Test exitoso! El backend funciona correctamente.');
      } else {
        console.error('❌ TEST FALLIDO');
        alert(`❌ Test fallido (${response.status}): ${text}`);
      }
      
    } catch (error) {
      console.error('💥 Test Error:', error);
      alert('💥 Error de conexión: ' + error);
    }
  }}
  className="mb-4 p-3 bg-green-100 text-green-800 text-sm rounded-md w-full"
>
  🧪 TEST: Enviar datos mínimos (sin multimedia)
</button>
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-900">
            Categoria <span className="text-Error">*</span>
          </label>
          <select
            id="category"
            defaultValue=""
            disabled={loadingCategories}
            {...register('category', { required: 'Seleccione una categoria' })}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 ${errors.category
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
            className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.author
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
            Empresa/Institución <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            type="text"
            {...register('company', {
              required: 'La empresa/institución es obligatoria',
            })}
            placeholder='Nombre de la organización'
            className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.company
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
              onClick={() => {
                setValue('contentType', 'text');
                clearImageSelection();
                clearVideoFileSelection();
                setVideoSource(null);
              }}
              className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${contentType === 'text'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }`}
            >
              <MessageCircle className='h-4 w-4' />
              <p>Texto</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('contentType', 'image');
                clearVideoFileSelection();
                setVideoSource(null);
              }}
              className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${contentType === 'image'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Image className='h-4 w-4' />
              <p>Imagen</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('contentType', 'video');
                clearImageSelection();
              }}
              className={`flex-1 flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${contentType === 'video'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }`}
            >
              <CirclePlay className='h-4 w-4' />
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
    required: 'El contenido del testimonio es obligatorio', // ← SIEMPRE requerido
    minLength: {
      value: 10,
      message: 'El contenido debe tener al menos 10 caracteres'
    },
    validate: (value) => {
      if (!value || value.trim().length < 10) {
        return 'El contenido debe tener al menos 10 caracteres';
      }
      return true;
    }
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
                  ref={(e) => {
                    imageFileInputRef.current = e;
                    register('imageFile').ref(e);
                  }}
                  onChange={(e) => {
                    handleImageChange(e);
                    register('imageFile').onChange(e);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-md px-6 py-8 text-center transition-colors ${
                  errors.imageFile
                    ? 'border-red-500'
                    : 'border-gray-300 hover:border-blue-500'
                }`}>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    {selectedImageFileName || 'Seleccione o arrastre aquí su imagen'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG Máximo 10MB
                  </p>
                </div>
              </div>
              
              {/* PREVIEW DE IMAGEN */}
              {selectedImagePreview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Vista previa de la imagen:</p>
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img 
                      src={selectedImagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">
                        ✅ {selectedImageFileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        La imagen se subirá con tu testimonio
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.imageFile && (
                <p className="text-sm text-red-500">{errors.imageFile.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="imageDescription" className="block text-sm font-medium text-gray-900">
                Descripción de la imagen <span className="text-red-500">*</span>
              </label>
              <textarea
                id="imageDescription"
                {...register('imageDescription', {
                  required: contentType === 'image' ? 'La descripción es obligatoria' : false,
                })}
                placeholder="Describe qué se muestra en la imagen..."
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
                    clearVideoFileSelection();
                  } else if (!e.target.value.trim() && videoSource === 'url') {
                    setVideoSource(null);
                  }
                }}
                placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
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
              
              {videoUrlValue && videoSource === 'url' && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    ✅ Usando URL: {videoUrlValue.length > 50 ? videoUrlValue.substring(0, 50) + '...' : videoUrlValue}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

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
                  ref={(e) => {
                    videoFileInputRef.current = e;
                    register('videoFile').ref(e);
                  }}
                  onChange={(e) => {
                    handleVideoFileChange(e);
                    register('videoFile').onChange(e);
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
                    {selectedVideoFileName || 'Arrastra un video o haz click para seleccionar'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, MOV hasta 100MB
                  </p>
                </div>
              </div>
              
              {selectedVideoFileName && videoSource === 'file' && (
                <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-green-700">
                      ✅ {selectedVideoFileName}
                    </p>
                    <button
                      type="button"
                      onClick={clearVideoFileSelection}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar video"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    El archivo de video se subirá con tu testimonio
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-900">
                Descripción del video <span className="text-red-500">*</span>
              </label>
              <textarea
                id="videoDescription"
                {...register('videoDescription', {
                  required: contentType === 'video' ? 'La descripción es obligatoria' : false,
                })}
                placeholder="Describe el contenido del video..."
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
            Tags (opcional)
          </label>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-600">
                  {tagInput || "Selecciona o escribe un tag..."}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-full sm:w-[400px] bg-white p-0" align="start">
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
                    title="Eliminar tag"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 border border-Primary bg-white px-4 py-3 text-sm font-medium text-Primary rounded-md transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
  type="submit"
  disabled={isSubmitting}
  className="flex-1 bg-Primary px-4 py-3 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : 'Crear testimonio'}
          </button>

          <button
  type="submit"
  disabled={isSubmitting || !isTokenValid}
  className="flex-1 bg-Primary px-4 py-3 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={() => console.log('🚀 Botón clickeado. Estado:', { isSubmitting, isTokenValid, token: token?.substring(0, 30) })}
></button>
        </div>
      </form>
      
      {showNotification && (
        <TestimonialNotification onClose={() => setShowNotification(false)} />
      )}
    </div>
  );
}
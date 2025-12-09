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
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
/* import TestimonialNotification from './pruebas/notification'; */
import { X, Upload, ChevronsUpDown, MessageCircle, CirclePlay, Image } from 'lucide-react';

type ContentType = 'text' | 'image' | 'video';

const CATEGORY_MAP: Record<string, string> = {
  'tecnologia': 'fdee7e93-7051-48a5-850c-101ec2fc9e6f',
  'servicios': 'cc7e2851-0289-4761-b8b2-d30235425d06',
  'productos': 'c74308b1-1cfd-4838-a50a-f680cdfcf169',
  'consultoria': '94cc7563-74e3-499f-a1db-d9e028278fff',
  'educacion': '64091810-b9db-4cf0-a928-d6d550b96fdd',
  'Evento': 'otro-uuid-aqui',
  'Cliente': 'otro-uuid-aqui',
  'Industria': 'otro-uuid-aqui',
};

const TAG_MAP: Record<string, string> = {
  'Educación': 'dbc2cf97-caaa-4a28-a4ee-994a93f7d2d8',
  'Capacitación': 'c3759780-fcb6-4d39-8a29-dc4026bfcd1e',
  'Comunidad': '0142eb68-ea47-4fc2-bcc0-019b5bbbfad8',
  'Calidad': 'e8ca3dc7-e21a-427d-b4ce-3009e7c2bafb',
  'Innovación': '3c536eaa-ec49-433c-b850-b0f75611d696',
  'Flexibilidad': 'f20262ca-02b9-4378-8a79-c3395addb89c',
  'Eficiencia': '75002c9f-abef-4104-99bb-a8df8be76f51',
  'freelancer': '909ec270-e3a6-4073-ae03-6eb8a2ece393'
};

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
  
  try {
    const formData = new FormData();
    
    
    formData.append('titulo', data.title);
    formData.append('autorNombre', data.author);
    formData.append('empresa', data.company);
    formData.append('cargo', data.position || '');
    formData.append('contenido', data.testimonialContent || '');
    
    
    formData.append('tipo', data.contentType.toUpperCase());
    
    
    if (data.contentType === 'image' && data.imageDescription) {
      formData.append('descripcion', data.imageDescription);
    } else if (data.contentType === 'video' && data.videoDescription) {
      formData.append('descripcion', data.videoDescription);
    }
    
    
    if (data.contentType === 'image' && data.imageFile?.[0]) {
      formData.append('file', data.imageFile[0]);
    } else if (data.contentType === 'video' && data.videoFile?.[0]) {
      formData.append('file', data.videoFile[0]);
    }
    
    
    const categoryId = CATEGORY_MAP[data.category];
    if (!categoryId) {
      throw new Error(`Categoría "${data.category}" no encontrada`);
    }
    formData.append('categoryId', categoryId);
    
    
    const tagIds = tags
      .map(tagName => TAG_MAP[tagName])
      .filter(Boolean); 
    
    if (tagIds.length > 0) {
      formData.append('tagIds', tagIds.join(','));
    }
    
    console.log('Enviando testimonio...');
    
    // Enviar al backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error del servidor:', result);
      throw new Error(result.message || `Error ${response.status}`);
    }
    
    console.log('Testimonio creado exitosamente:', result);
    
    setTimeout(() => {
      setShowNotification(true);
    }, 300);
    
    setVideoSource(null);
    setTags([]);
    
  } catch (error) {
    console.error('Error completo:', error);
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
            Categoria
          </label>
          <select
            id="category"
            defaultValue=""
            {...register('category', { required: 'Seleccione una categoria'})}
            className={`...`}
          >
            <option value="">Categoria</option>
            <option value="tecnologia">Tecnología</option>
            <option value="servicios">Servicios</option>
            <option value="productos">Productos</option>
            <option value="consultoria">Consultoría</option>
            <option value="educacion">Educación</option>
          </select>
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
          {['Educación', 'Capacitación', 'Comunidad', 'Calidad', 'Innovación', 
            'Flexibilidad', 'Eficiencia']
            .filter(tag => !tags.includes(tag)) // Ocultar tags ya agregados
            .map((tag) => (
            <CommandItem
              key={tag}
              onSelect={() => handleAddTag(tag)}
              className="cursor-pointer"
            >
              {tag}
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

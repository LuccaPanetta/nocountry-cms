'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload } from 'lucide-react';

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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TestimonialFormData) => {
    const formDataWithTags = {
      ...data,
      tags,
    };
    
    // Manejo especial para imágenes
    if (data.contentType === 'image' && data.imageFile) {
      const imageFile = data.imageFile[0]; // Primer archivo seleccionado
      console.log('Imagen seleccionada:', imageFile);
      console.log('Descripción de imagen:', data.imageDescription);
    }
    
    // Manejo especial para video
    if (data.contentType === 'video') {
      console.log('URL de video:', data.videoUrl);
      if (data.videoFile) {
        const videoFile = data.videoFile[0];
        console.log('Archivo de video:', videoFile);
      }
      console.log('Descripción de video:', data.videoDescription);
    }
    
    console.log('Form data completo:', formDataWithTags);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-8 text-Accent text-3xl text-center font-bold">Creá tu testimonio</h1>
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
            defaultValue="proximamente"
            {...register('category')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
          >
            <option value="proximamente">Proximamente</option>
            <option value="opcion2">Opción 2</option>
            <option value="opcion3">Opción 3</option>
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
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contentType === 'text'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              Texto
            </button>
            <button
              type="button"
              onClick={() => setValue('contentType', 'image')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contentType === 'image'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              Imagen
            </button>
            <button
              type="button"
              onClick={() => setValue('contentType', 'video')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contentType === 'video'
                  ? 'bg-Primary text-white'
                  : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              Video
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
                URL del video <span className="text-red-500">*</span>
              </label>
              <input
                id="videoUrl"
                type="text"
                {...register('videoUrl', {
                  required: contentType === 'video' ? 'La URL del video es obligatoria' : false,
                })}
                placeholder="https://youtube.com/watch?v=..."
                className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.videoUrl
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-500">{errors.videoUrl.message}</p>
              )}
            </div>

            {/* Campo de archivo de video con diseño personalizado */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Archivo de video
              </label>
              <div className="relative">
                <input
                  id="videoFile"
                  type="file"
                  accept="video/mp4,video/quicktime"
                  {...register('videoFile')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    Arrastra un video o haz click para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, MOV hasta 100MB
                  </p>
                </div>
              </div>
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
          <label htmlFor="tags" className="block text-sm font-medium text-gray-900">
            Tags
          </label>
          <div className="flex gap-2"> 
            <select
            id="tags"
            value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0">

            <option value="">Selecciona un Tag...</option>
            <option value="Educación">Educación</option>
            <option value="Capacitación">Capacitación</option>
            <option value="Comunidad">Comunidad</option>
            <option value="Calidad">Calidad</option>
            <option value="Innovación">Innovación</option>
            <option value="Flexibilidad">Flexibilidad</option>
            <option value="Eficiencia">Eficiencia</option>

            </select>
            {/*
            
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Agregar tag"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            /> */}
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Agregar
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1"
                >
                  <span className="text-sm text-blue-900">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="text-blue-600 transition-colors hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 border border-Primary bg-white px-4 py-2 text-sm font-medium text-Primary transition-colors hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            type="submit"
            className="flex-1 bg-Primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  );
}

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { useGetCategories } from '@/services/use-queries-service/categories-query-service'
import { useGetTags } from '@/services/use-queries-service/tags-query-service'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, CirclePlay, Image as ImageIcon } from 'lucide-react'
import { VideoSourceSelector } from '@/components/testimonials/VideoSourceSelector'
import { ImageSourceSelector } from '@/components/testimonials/ImageSourceSelector'
import { TagsInput } from '@/components/testimonials/TagsInput'
import Success from '@/components/ui/success'

type ContentType = 'text' | 'image' | 'video'

interface TestimonialFormData {
  title: string
  category: string
  author: string
  company: string
  position?: string
  contentType: ContentType
  testimonialContent: string
}

interface ValidationErrors {
  imageFile?: string
  imageUrl?: string
  imageDescription?: string
  videoFile?: string
  videoUrl?: string
  videoDescription?: string
}

export default function CreateTestimonialPage() {
  const router = useRouter()
  const [contentType, setContentType] = useState<ContentType>('text')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageDescription, setImageDescription] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const token = useUserStore((state) => state.token)
  const { data: categories, isLoading: loadingCategories } = useGetCategories()
  const { data: availableTags, isLoading: loadingTags } = useGetTags()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    defaultValues: {
      contentType: 'text',
      title: '',
      category: '',
      author: '',
      company: '',
      position: '',
      testimonialContent: ''
    }
  })

  // Observar cambios en los campos del formulario
  const watchedFields = watch()

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Validar contenido principal
    if (!watchedFields.testimonialContent || watchedFields.testimonialContent.trim().length < 10) {
      setError('El contenido debe tener al menos 10 caracteres')
      return false
    }

    // Validar categoría
    if (!watchedFields.category) {
      setError('Selecciona una categoría')
      return false
    }

    // Validar autor y empresa
    if (!watchedFields.author?.trim()) {
      setError('El autor es requerido')
      return false
    }
    if (!watchedFields.company?.trim()) {
      setError('La empresa es requerida')
      return false
    }

    // Validar imagen
    if (contentType === 'image') {
      const hasImageFile = !!imageFile
      const hasImageUrl = !!imageUrl.trim()
      
      if (!hasImageFile && !hasImageUrl) {
        newErrors.imageFile = 'Debes subir una imagen o ingresar una URL'
        newErrors.imageUrl = 'Debes subir una imagen o ingresar una URL'
      }
      
      if (!imageDescription.trim()) {
        newErrors.imageDescription = 'La descripción de la imagen es requerida'
      }
    }

    // Validar video
    if (contentType === 'video') {
      const hasVideoFile = !!videoFile
      const hasVideoUrl = !!videoUrl.trim()
      
      if (!hasVideoFile && !hasVideoUrl) {
        newErrors.videoFile = 'Debes subir un video o ingresar una URL'
        newErrors.videoUrl = 'Debes subir un video o ingresar una URL'
      }
      
      if (!videoDescription.trim()) {
        newErrors.videoDescription = 'La descripción del video es requerida'
      }
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const onSubmit = async (data: TestimonialFormData) => {
    console.log('🚀 Iniciando envío de testimonio...')
    
    if (!validateForm()) {
      return
    }

    if (!token) {
      setError('Debes iniciar sesión para crear un testimonio')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()

      // Campos de texto
      formData.append('contenido', data.testimonialContent.trim())
      if (data.title?.trim()) formData.append('titulo', data.title.trim())
      if (data.author?.trim()) formData.append('autorNombre', data.author.trim())
      if (data.company?.trim()) formData.append('empresa', data.company.trim())
      if (data.position?.trim()) formData.append('cargo', data.position.trim())
      formData.append('categoryId', data.category)

      // Tags
      if (selectedTags.length > 0 && availableTags) {
        const tagIds = selectedTags
          .map(tagName => availableTags.find(t => t.name === tagName)?.id)
          .filter(Boolean) as string[]
        if (tagIds.length > 0) {
          formData.append('tagIds', JSON.stringify(tagIds))
        }
      }

      // Determinar tipo de multimedia y preparar datos
      if (contentType === 'image') {
        if (imageFile) {
          // Subir archivo de imagen
          formData.append('file', imageFile)
          formData.append('tipo', 'IMAGEN')
          if (imageDescription.trim()) {
            formData.append('descripcion', imageDescription.trim())
          }
          console.log('📸 Enviando archivo de imagen:', imageFile.name)
        } else if (imageUrl.trim()) {
          // Usar URL de imagen
          formData.append('multimediaUrl', imageUrl.trim())
          formData.append('tipo', 'IMAGEN')
          if (imageDescription.trim()) {
            formData.append('descripcion', imageDescription.trim())
          }
          console.log('🌐 Enviando URL de imagen:', imageUrl)
        }
      } else if (contentType === 'video') {
        if (videoFile) {
          // Subir archivo de video
          formData.append('file', videoFile)
          formData.append('tipo', 'VIDEO')
          if (videoDescription.trim()) {
            formData.append('descripcion', videoDescription.trim())
          }
          console.log('🎬 Enviando archivo de video:', videoFile.name)
        } else if (videoUrl.trim()) {
          // Usar URL de video
          formData.append('multimediaUrl', videoUrl.trim())
          formData.append('tipo', 'VIDEO')
          if (videoDescription.trim()) {
            formData.append('descripcion', videoDescription.trim())
          }
          console.log('🔗 Enviando URL de video:', videoUrl)
        }
      }

      // Log para debugging
      console.log('🔍 FormData creado:')
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[0] === 'file' ? '[ARCHIVO]' : pair[1])
      }

      // Enviar al backend
      const API_URL = process.env.NEXT_PUBLIC_URL_BASE || 'https://nocountry-cms.onrender.com/api/v1'
      console.log('📤 Enviando a:', `${API_URL}/testimonials`)
      console.log('🔑 Token:', token ? 'PRESENTE' : 'AUSENTE')

      const response = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        
        let errorMessage = `Error ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ Éxito:', result)

      // Mostrar mensaje de éxito
      setShowSuccess(true)

    } catch (error) {
      console.error('💥 Error completo:', error)
      setError(error instanceof Error ? error.message : 'Error al enviar el testimonio')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Limpiar selecciones cuando cambia el tipo de contenido
  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type)
    setValue('contentType', type)
    
    // Limpiar archivos y URLs según el tipo
    if (type !== 'image') {
      setImageFile(null)
      setImageUrl('')
      setImageDescription('')
    }
    if (type !== 'video') {
      setVideoFile(null)
      setVideoUrl('')
      setVideoDescription('')
    }
    
    // Limpiar errores
    setValidationErrors({})
    setError(null)
  }

  // Determinar nombres de archivos seleccionados
  const selectedImageName = imageFile ? imageFile.name : (imageUrl ? 'URL de imagen configurada' : '')
  const selectedVideoName = videoFile ? videoFile.name : (videoUrl ? 'URL de video configurada' : '')

  if (showSuccess) {
    return (
      <Success
        text="¡Testimonio creado exitosamente!"
        buttonText="Volver a testimonios"
        redirect="/testimonials"
      />
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-Primary">
            Creá tu testimonio
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Compartí tu experiencia y ayudanos a darle voz
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* TÍTULO */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title', { required: 'El título es obligatorio' })}
                placeholder="Ej: Transformación digital exitosa"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* CATEGORÍA */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                disabled={loadingCategories}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder={loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* AUTOR */}
            <div className="space-y-2">
              <Label htmlFor="author">
                Autor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                {...register('author', { required: 'El autor es obligatorio' })}
                placeholder="Nombre completo"
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className="text-sm text-red-500">{errors.author.message}</p>
              )}
            </div>

            {/* EMPRESA */}
            <div className="space-y-2">
              <Label htmlFor="company">
                Empresa / Institución <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                {...register('company', { required: 'La empresa es obligatoria' })}
                placeholder="Nombre de la organización"
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>

            {/* CARGO */}
            <div className="space-y-2">
              <Label htmlFor="position">Cargo (opcional)</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="Director, Profesor, etc"
              />
            </div>

            {/* TAGS */}
            <TagsInput
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              isLoading={loadingTags}
              maxTags={5}
            />

            {/* CONTENIDO */}
            <div className="space-y-2">
              <Label htmlFor="testimonialContent">
                Contenido <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="testimonialContent"
                {...register('testimonialContent', {
                  required: 'El contenido es obligatorio',
                  minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                })}
                placeholder="Escribe aquí tu testimonio..."
                rows={6}
                className={errors.testimonialContent ? 'border-red-500' : ''}
              />
              {errors.testimonialContent && (
                <p className="text-sm text-red-500">{errors.testimonialContent.message}</p>
              )}
            </div>

            {/* TIPO DE CONTENIDO */}
            <div className="space-y-2">
              <Label>Tipo de contenido</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  type="button"
                  onClick={() => handleContentTypeChange('text')}
                  variant={contentType === 'text' ? 'default' : 'outline'}
                  className="h-auto py-3 flex gap-2"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Texto</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleContentTypeChange('image')}
                  variant={contentType === 'image' ? 'default' : 'outline'}
                  className="h-auto py-3 flex gap-2"
                >
                  <ImageIcon className="h-6 w-6" />
                  <span>Imagen</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleContentTypeChange('video')}
                  variant={contentType === 'video' ? 'default' : 'outline'}
                  className="h-auto py-3 flex gap-2"
                >
                  <CirclePlay className="h-6 w-6" />
                  <span>Video</span>
                </Button>
              </div>
            </div>

            {/* IMAGEN (archivo o URL) */}
            {contentType === 'image' && (
              <ImageSourceSelector
                onFileChange={setImageFile}
                onUrlChange={setImageUrl}
                selectedFile={imageFile}
                selectedFileName={selectedImageName}
                imageUrl={imageUrl}
                description={imageDescription}
                onDescriptionChange={setImageDescription}
                errors={{
                  file: validationErrors.imageFile,
                  url: validationErrors.imageUrl,
                  description: validationErrors.imageDescription
                }}
                required
              />
            )}

            {/* VIDEO (archivo o URL) */}
            {contentType === 'video' && (
              <VideoSourceSelector
                onFileChange={setVideoFile}
                onUrlChange={setVideoUrl}
                selectedFile={videoFile}
                selectedFileName={selectedVideoName}
                videoUrl={videoUrl}
                description={videoDescription}
                onDescriptionChange={setVideoDescription}
                errors={{
                  file: validationErrors.videoFile,
                  url: validationErrors.videoUrl,
                  description: validationErrors.videoDescription
                }}
                required
              />
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/testimonials')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-Primary hover:bg-Primary/90"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  'Crear testimonio'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

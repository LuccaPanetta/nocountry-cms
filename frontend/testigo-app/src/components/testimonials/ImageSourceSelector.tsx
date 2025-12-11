"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { FileUpload } from './FileUpload'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type ImageSourceSelectorProps = {
  onFileChange: (file: File | null) => void
  onUrlChange: (url: string) => void
  selectedFile: File | null
  selectedFileName: string
  imageUrl: string
  description: string
  onDescriptionChange: (description: string) => void
  errors?: {
    file?: string
    url?: string
    description?: string
  }
  required?: boolean
}

export function ImageSourceSelector({
  onFileChange,
  onUrlChange,
  selectedFile,
  selectedFileName,
  imageUrl,
  description,
  onDescriptionChange,
  errors,
  required = false
}: ImageSourceSelectorProps) {
  const [sourceType, setSourceType] = useState<'file' | 'url'>(selectedFile ? 'file' : imageUrl ? 'url' : 'file')

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-4">
        <Button
          type="button"
          onClick={() => {
            setSourceType('file')
            onUrlChange('')
          }}
          variant={sourceType === 'file' ? 'default' : 'outline'}
          className="flex-1"
        >
          Subir archivo
        </Button>
        <Button
          type="button"
          onClick={() => {
            setSourceType('url')
            onFileChange(null)
          }}
          variant={sourceType === 'url' ? 'default' : 'outline'}
          className="flex-1"
        >
          Usar URL
        </Button>
      </div>

      {sourceType === 'file' ? (
        <FileUpload
          label="Imagen"
          required={required}
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
          selectedFile={selectedFile}
          selectedFileName={selectedFileName}
          onFileChange={onFileChange}
          description="PNG, JPG, WebP, GIF, SVG hasta 10MB"
          error={errors?.file}
        />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">
            URL de la imagen {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className={errors?.url ? 'border-red-500' : ''}
          />
          {errors?.url && (
            <p className="text-sm text-red-500">{errors.url}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Soporta JPG, PNG, WebP, GIF, SVG
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="imageDescription">
          Descripción de la imagen {required && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          id="imageDescription"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe qué se muestra en la imagen..."
          rows={4}
          className={errors?.description ? 'border-red-500' : ''}
        />
        {errors?.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>
    </div>
  )
}
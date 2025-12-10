"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { FileUpload } from './FileUpload'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type VideoSourceSelectorProps = {
  onFileChange: (file: File | null) => void
  onUrlChange: (url: string) => void
  selectedFile: File | null
  selectedFileName: string
  videoUrl: string
  description: string
  onDescriptionChange: (description: string) => void
  errors?: {
    file?: string
    url?: string
    description?: string
  }
  required?: boolean
}

export function VideoSourceSelector({
  onFileChange,
  onUrlChange,
  selectedFile,
  selectedFileName,
  videoUrl,
  description,
  onDescriptionChange,
  errors,
  required = false
}: VideoSourceSelectorProps) {
  const [sourceType, setSourceType] = useState<'file' | 'url'>(selectedFile ? 'file' : videoUrl ? 'url' : 'file')

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
          label="Video"
          required={required}
          accept="video/mp4,video/webm,video/ogg,video/avi,video/mkv,video/mov"
          selectedFile={selectedFile}
          selectedFileName={selectedFileName}
          onFileChange={onFileChange}
          description="MP4, WebM, OGG, AVI, MKV, MOV hasta 100MB"
          error={errors?.file}
        />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">
            URL del video {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
            className={errors?.url ? 'border-red-500' : ''}
          />
          {errors?.url && (
            <p className="text-sm text-red-500">{errors.url}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Soporta YouTube, Vimeo y enlaces directos a videos
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="videoDescription">
          Descripción del video {required && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          id="videoDescription"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe el contenido del video..."
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
"use client"

import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type FileUploadProps = {
  label: string
  required?: boolean
  accept: string
  selectedFile: File | null
  selectedFileName: string
  onFileChange: (file: File | null) => void
  description?: string
  className?: string
  error?: string
}

export function FileUpload({
  label,
  required = false,
  accept,
  selectedFile,
  selectedFileName,
  onFileChange,
  description,
  className,
  error
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onFileChange(file)
  }

  const handleClear = () => {
    onFileChange(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`file-${label}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <input
          id={`file-${label}`}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={cn(
          "border-2 border-dashed rounded-md px-6 py-8 text-center transition-colors",
          selectedFile 
            ? "border-green-500 bg-green-50" 
            : "border-gray-300 hover:border-Primary",
          error && "border-red-500"
        )}>
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            {selectedFileName || `Haz clic para seleccionar ${label.toLowerCase()}`}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-green-700 truncate">
              ✅ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="ml-2 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
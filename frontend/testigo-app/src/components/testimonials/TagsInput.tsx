"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type TagsInputProps = {
  availableTags?: Array<{ id: string; name: string }>
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  isLoading?: boolean
  maxTags?: number
}

export function TagsInput({
  availableTags,
  selectedTags,
  onTagsChange,
  isLoading = false,
  maxTags = 5
}: TagsInputProps) {
  const [tagInput, setTagInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredTags = availableTags?.filter(tag => 
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  ) || []

  const handleAddTag = (tagName: string) => {
    if (selectedTags.length >= maxTags) {
      return
    }
    
    if (tagName.trim() && !selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput.trim())
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">
        Etiquetas (máximo {maxTags})
      </Label>
      
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value)
              setShowDropdown(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar o agregar etiquetas..."
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={() => {
              if (tagInput.trim()) {
                handleAddTag(tagInput.trim())
              }
            }}
            disabled={isLoading || !tagInput.trim() || selectedTags.length >= maxTags}
          >
            <Tag className="h-4 w-4" />
          </Button>
        </div>

        {showDropdown && tagInput && filteredTags.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  handleAddTag(tag.name)
                  setShowDropdown(false)
                }}
              >
                <Tag className="h-3 w-3 text-gray-400" />
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map(tag => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        {selectedTags.length} de {maxTags} etiquetas seleccionadas
      </p>
    </div>
  )
}
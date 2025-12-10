'use client';

import { useState } from 'react';
import { X, Play, ImageIcon, MessageCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVideoPreview } from '@/hooks/usePreviewVideo';
import PreviewModal from '@/components/testimonials/PreviewModal';
import { useNormalizeMultimediaType } from '@/hooks/useNormalizeMultimediaType';

interface ViewTestimonialProps {
  testimonialId: string;
  title: string;
  content: string;
  author: string;
  position?: string;
  company: string;
  category: string;
  format: 'IMAGEN' | 'VIDEO' | 'TEXTO';
  mediaUrl?: string;
  tags?: string[];
  createdAt: string;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TestimonialView = ({
  testimonialId,
  title,
  content,
  author,
  position,
  company,
  category,
  format,
  mediaUrl,
  tags = [],
  createdAt,
  onClose,
  onEdit,
  onDelete,
}: ViewTestimonialProps) => {
  const [openModal, setOpenModal] = useState(false);
  
  // Reutilizando la lógica de CardTestimony
  const { previewType, thumbnail, isYoutube } = useVideoPreview(mediaUrl ?? "");
  
  // Crear un objeto testimonial simulado para usar el hook
  const testimonialForHook = {
    multimedia: { type: format, url: mediaUrl }
  };
  
  const mappedType: "video" | "imagen" = useNormalizeMultimediaType({ 
    isYoutube, 
    testimonial: testimonialForHook as any 
  });

  const getTypeIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'video':
        return <Play className="h-4 w-4 text-primary" />;
      case 'imagen':
        return <ImageIcon className="h-4 w-4 text-primary" />;
      default:
        return <MessageCircle className="h-4 w-4 text-primary" />;
    }
  };

  const handleDateFormat = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header del modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold text-gray-900">
            Detalle del testimonio
          </h1>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido usando el estilo de CardTestimony */}
        <div className="p-6">
          <Card className="overflow-hidden shadow-lg">
            {/* Multimedia - Reutilizando la lógica de CardTestimony */}
            {format.toLowerCase() !== 'texto' && mediaUrl && (
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={() => setOpenModal(true)}
                >
                  {isYoutube && thumbnail && (
                    <img 
                      src={thumbnail} 
                      alt={title}
                      className="w-full h-full object-cover" 
                    />
                  )}

                  {!isYoutube && previewType === "video" && (
                    <video
                      src={mediaUrl}
                      muted
                      playsInline
                      poster={`${mediaUrl}#t=0.1`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {!isYoutube && mappedType === "imagen" && (
                    <img 
                      src={mediaUrl} 
                      alt={title}
                      className="w-full h-full object-cover" 
                    />
                  )}

                  {mappedType === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="bg-white/90 rounded-full p-4 shadow-lg">
                        <Play className="h-10 w-10 text-primary fill-primary" />
                      </div>
                    </div>
                  )}
                </div>

                <PreviewModal
                  open={openModal}
                  onClose={() => setOpenModal(false)}
                  url={mediaUrl}
                  isYoutube={isYoutube}
                  previewType={mappedType}
                />
              </div>
            )}

            {/* Contenido de la card */}
            <CardContent className="p-6">
              {/* Badges y fecha */}
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  {getTypeIcon(format)}
                  {format.toLowerCase()}
                </Badge>
                <Badge>{category}</Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-4">
                {handleDateFormat(createdAt)}
              </p>

              {/* Título */}
              <h3 className="mb-4 text-2xl font-bold text-balance leading-tight">
                {title || 'Sin título'}
              </h3>

              {/* Contenido */}
              <p className="mb-6 text-base text-muted-foreground text-pretty leading-relaxed whitespace-pre-wrap">
                {content}
              </p>

              {/* Información del autor */}
              <div className="mb-4 border-t pt-4">
                <p className="font-semibold text-lg text-gray-900">{author}</p>
                <p className="text-sm text-muted-foreground">
                  {position && `${position} · `}{company || 'Sin empresa'}
                </p>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3 pt-4 border-t">
                <button
                  onClick={onEdit}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Editar Testimonio
                </button>
                <button
                  onClick={onDelete}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Eliminar Testimonio
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestimonialView;
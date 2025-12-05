import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, MessageCircle, Play } from 'lucide-react';
import { TestimonyType } from '@/types/testimony-type';


const CardTestimony = ({ testimonial }: TestimonyType) => {

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Play className="h-4 w-4 text-primary" />
            case 'imagen':
                return <ImageIcon className="h-4 w-4 text-primary" />
            default:
                return <MessageCircle className="h-4 w-4 text-primary" />
        }
    }

    function youtubeToEmbed(url: string) {
        const id = url.split("v=")[1];
        return `https://www.youtube.com/embed/${id}`;
    }

    return (
        <Card key={testimonial.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            {testimonial.multimedia.tipo !== 'text' && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                        src={testimonial.multimedia.url || "/placeholder.svg"}
                        alt={testimonial.multimedia.descripcion}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {testimonial.multimedia.tipo === 'video' && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden">

                            <iframe
                                src={youtubeToEmbed(testimonial.multimedia.url)}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
                                    <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}
            <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        {getTypeIcon(testimonial.multimedia.tipo)}
                        {testimonial.multimedia.tipo}
                    </Badge>
                    <Badge >{testimonial.category}</Badge>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-balance leading-tight">
                    {testimonial.titulo}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground text-pretty line-clamp-3">
                    {testimonial.contenido}
                </p>
                <div className="mb-3 border-t pt-3">
                    <p className="font-medium text-sm">{testimonial.autor}</p>
                    <p className="text-xs text-muted-foreground">
                        {testimonial.cargo} · {testimonial.empresa}
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {testimonial.tags.slice(0, 3).map(tag => (
                        <Badge
                            key={tag}
                            variant="default"
                            className="text-xs hover:bg-primary/30"
                            onClick={() => {
                                if (!selectedTags.includes(tag)) {
                                    setSelectedTags([...selectedTags, tag])
                                    setCurrentPage(1)
                                }
                            }}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default CardTestimony

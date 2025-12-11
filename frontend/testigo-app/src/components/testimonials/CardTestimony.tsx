import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, ImageIcon, MessageCircle, Play, Quote } from 'lucide-react';
import { PublicTestimonyResType } from '@/types/testimony-type';
import { useVideoPreview } from '@/hooks/usePreviewVideo';
import PreviewModal from './PreviewModal';
import { useNormalizeMultimediaType } from '@/hooks/useNormalizeMultimediaType';
import Link from 'next/link';
import { useGetPublicTestimonyById, useGetPublicTestimonyEmbedCodeById } from '@/services/use-queries-service/testimonials-query-service';
import ModalEmbedCode from './ModalEmbedCode';


type CardTestimonyProps = {
    testimonial: PublicTestimonyResType
}


const CardTestimony = ({ testimonial }: CardTestimonyProps) => {


    const { refetch } = useGetPublicTestimonyById(testimonial.id);

    const { refetch: refetchEmbed } = useGetPublicTestimonyEmbedCodeById(testimonial.id);
    const [dataEmbed, setDataEmbed] = useState("")

    const [views, setViews] = useState(testimonial.engagement.views)

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const url = testimonial?.multimedia?.url ?? "";
    const format = testimonial?.mediaType
    const { previewType, thumbnail, isYoutube } = useVideoPreview(url);
    const [openModal, setOpenModal] = useState(false);
    const [openModalEmbed, setOpenModalEmbed] = useState(false);

    const mappedType: "video" | "imagen" = useNormalizeMultimediaType({ isYoutube, testimonial });



    const getTypeIcon = (type: string) => {
        const typeLower = type.toLowerCase();
        switch (typeLower) {
            case 'video':
                return <Play className="h-4 w-4 text-primary" />
            case 'imagen':
                return <ImageIcon className="h-4 w-4 text-primary" />
            default:
                return <MessageCircle className="h-4 w-4 text-primary" />
        }
    }

    const handleDateFormat = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    const handleOpenModal = async () => {

        const key = `viewed-${testimonial.id}`;

        localStorage.removeItem(key);

        if (!localStorage.getItem(key)) {

            const result = await refetch();
            const newViews = result.data?.engagement.views;

            if (newViews !== undefined) {
                setViews(newViews);
            }

            localStorage.setItem(key, "true");
        }
        setOpenModal(true);
    };

   const handleEmbed = async () => {
    try {
        const result = await refetchEmbed(); 
        const embedHtml = result.data;   
        console.log({embedHtml});
        
        if (embedHtml) {
            setDataEmbed(embedHtml);         
        }
        setOpenModalEmbed(true);             
    } catch (error) {
        console.error("Error fetching embed code", error);
    }
};
    return (
        <Card key={testimonial.id} className="overflow-hidden hover:shadow-lg transition-shadow group">

            <div className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer">

                <div
                    className="relative aspect-video cursor-pointer"
                    onClick={handleOpenModal}
                >
                    {testimonial?.hasMultimedia ? (
                        <>
                            {isYoutube && thumbnail && (
                                <img
                                    src={thumbnail}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {!isYoutube && previewType === "video" && (
                                <video
                                    src={testimonial.multimedia?.url ?? ""}
                                    muted
                                    playsInline
                                    poster={`${testimonial.multimedia?.url}#t=0.1`}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {mappedType === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100">
                                    <div className="bg-white/90 rounded-full p-3 shadow-lg">
                                        <Play className="h-8 w-8 text-primary fill-primary group-hover:fill-secondary group-hover:text-secondary transition-colors" />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : <p className='flex items-center mt-auto h-full justify-center text-primary font-semibold relative'><Quote className='text-white w-30 h-30 absolute -top-5 -left-3.5' />VER MÁS</p>}
                </div>

            </div>

            <PreviewModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false)
                }}
                url={testimonial.multimedia?.url ?? ""}
                isYoutube={isYoutube}
                previewType={mappedType}
                content={testimonial.content}
                author={testimonial.author}
            />


            <CardContent className="">
                <div className='flex justify-end gap-2 text-xs pb-4 text-primary items-center' >
                    <span className='flex justify-between'>{views} vistas  | </span>
                    <p className="hover:text-secondary flex items-center gap-2 border border-primary hover:border-secondary px-2 rounded-md cursor-pointer" onClick={handleEmbed}><Code className='w-4' /> Embed</p>
                </div>

                <ModalEmbedCode
                    open={openModalEmbed}
                    onClose={() => {
                        setOpenModalEmbed(false)
                    }}
                    code={dataEmbed}
                />

                <div className="mb-3 flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        {getTypeIcon(format)}
                        {format !== "none" ? format : "texto"}
                    </Badge>
                    <Badge className='bg-muted-foreground/50 text-foreground hover:bg-primary/30'>{testimonial.category}</Badge>
                </div>
                <p className="text-xs py-3">{handleDateFormat(testimonial.createdAt)}</p>
                <h3 className="mb-2 text-lg font-semibold text-balance leading-tight">
                    {testimonial.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground text-pretty line-clamp-3">
                    {testimonial.content}
                </p>
                <div className="mb-3 border-t pt-3">
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                        {testimonial.position} · {testimonial.company}
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {testimonial.tags.slice(0, 3).map(tag => (
                        <Badge
                            key={tag}
                            variant="default"
                            className="text-xs hover:bg-primary/30 bg-muted-foreground/50 text-foreground"
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
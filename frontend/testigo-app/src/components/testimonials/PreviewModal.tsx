import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type PreviewModalProps = {
  open: boolean;
  onClose: () => void;
  url?: string;
  isYoutube?: boolean;
  previewType?: "video" | "imagen";
  content: string;
  author:string
};

const PreviewModal = ({ open, onClose, url, isYoutube, previewType, content, author }: PreviewModalProps) => {

  const getYoutubeEmbed = (url: string) => {
    const params = new URL(url);
    const id =
      params.searchParams.get("v") || params.pathname.split("/").pop();
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  };

  useEffect(() => {
    // Bloquea scroll background cuando modal está abierto
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);


  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose() }}>
      <DialogTitle className="sr-only">{url}</DialogTitle>
      <DialogDescription className="sr-only">Esta es una vista previa del contenido seleccionado.</DialogDescription>
      <DialogContent className="p-0 bg-black/90 max-w-4xl">
        {url && (
          <>
            {/* ---- YouTube ---- */}
            {isYoutube && (
              <iframe
                src={getYoutubeEmbed(url)}
                allow="autoplay"
                className="w-full aspect-video"
              />
            )}

            {/* ---- MP4 / Cloudinary ---- */}
            {!isYoutube && previewType === "video" && (
              <video
                src={url}
                controls
                autoPlay
                className="w-full aspect-video"
              />
            )}

            {/* Imagen  */}
            {!isYoutube && previewType === "imagen" && (
              <img
                src={url}
                className="w-full object-contain max-h-screen"
              />
            )}

          </>
        )
        }
        <div className="p-6 text-white text-sm">
          <p className="pb-3 font-light">{author}</p>
          <p >{content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;

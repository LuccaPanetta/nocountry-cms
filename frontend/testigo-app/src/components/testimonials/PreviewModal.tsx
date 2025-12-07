import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type PreviewModalProps = {
  open: boolean;
  onClose: () => void;
  url: string;
  isYoutube: boolean;
  previewType: "video" | "imagen";
};

const PreviewModal = ({ open, onClose, url, isYoutube, previewType }: PreviewModalProps) => {

  useEffect(() => {
    // Bloquea scroll background cuando modal está abierto
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const getYoutubeEmbed = (url: string) => {
    const params = new URL(url);
    const id =
      params.searchParams.get("v") || params.pathname.split("/").pop();
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-black/90 max-w-4xl">
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
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;

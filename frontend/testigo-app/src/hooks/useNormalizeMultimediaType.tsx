import { PublicTestimonyResType } from "@/types/testimony-type";

interface UseNormalizeMultimediaTypeParams {
  isYoutube: boolean;
  testimonial: PublicTestimonyResType;
}

export const useNormalizeMultimediaType = ({isYoutube, testimonial}: UseNormalizeMultimediaTypeParams): "video" | "imagen" => {

  if (isYoutube) return "video";

  const rawType = testimonial.multimedia.type.toLowerCase();

  if (["image", "imagen", "img", "jpg", "png"].includes(rawType)) {
    return "imagen";
  }
  if (["video", "mp4", "mov", "webm"].includes(rawType)) {
    return "video";
  }

  const ext = testimonial.multimedia.url?.split(".").pop()?.toLowerCase() ?? "";

  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "imagen";


  return "video";
};
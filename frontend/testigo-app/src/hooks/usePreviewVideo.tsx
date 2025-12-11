import { useMemo } from "react";

type PreviewType = "youtube" | "video" | "image" | "none";

export const useVideoPreview = (url: string) => {

  const isYoutubeUrl = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const isImage = (url: string) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  const getYoutubeId = (url: string) => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.searchParams.get("v") ||
        urlObj.pathname.split("/").pop()
      );
    } catch {
      return null;
    }
  };

  const getYoutubeThumbnail = (url: string) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const previewType: PreviewType = useMemo(() => {
    if (!url) return "none";
    if (isYoutubeUrl(url)) return "youtube";
    if (isImage(url)) return "image";
    return "video";
  }, [url]);

  const thumbnail = useMemo(() => {
    return previewType === "youtube" ? getYoutubeThumbnail(url) : null;
  }, [url, previewType]);

  return {
    previewType,
    thumbnail,
    isYoutube: previewType === "youtube",
  };
};

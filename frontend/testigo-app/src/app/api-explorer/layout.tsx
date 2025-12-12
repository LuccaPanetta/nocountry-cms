import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorador de API - Testimonial CMS",
  description: "Explora y prueba la API pública del sistema de testimonios",
};

export default function ApiExplorerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
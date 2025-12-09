'use client'
import { useTypewriter } from "@/hooks/useTypewriter";
import { Button } from "../ui/button"

import Container from "../ui/Container";
import { CheckCircle, FileHeart, Link } from "lucide-react";
import CardBenefit from "./Card-benefit";
import { useRouter } from "next/navigation";

const Index = () => {

  const text = useTypewriter(
    ["impulsan resultados", "humanizan tu marca", "generan confianza"],
    80,
    2000
  );
/*   const typewriterText = (
    <span className="inline-block whitespace-nowrap min-w-[20ch] text-center bg-clip-text text-secondary">
      {text}
    </span>
  );
 */
  const router = useRouter();

  return (
    <Container >
      <div className=" flex flex-col items-center mx-auto">
        <div className="w-full md:max-w-[479px] lg:max-w-[850px]">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mt-20 mb-8">
  Gestiona y publica testimonios que{" "} <br />
  <span className="inline-block text-center bg-clip-text text-secondary">
    {text}
  </span>
</h1>
          <p className="text-md text-center">Sistema CMS especializado en recopilar, organizar y publicar historias de éxito. Perfecto para instituciones y empresas con comunidades activas.</p>
          <div className="w-full flex flex-col gap-2 mt-10 items-center md:flex-row md:justify-center md:gap-4">
            <Button className="w-40 md:w-50" onClick={() => router.push("/testimonials")}>Ver Testimonios</Button>
            <Button className="w-40 md:w-50" variant={"outline"} onClick={() => router.push("/api-explorer")}>Explorar API</Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 my-10 md:w-full md:gap-1 lg:gap-2 lg:flex-row lg:justify-between lg:mt-5">
          <CardBenefit
            key="benefit-1"
            icon={FileHeart}
            title="Gestión completa"
            text="Crea y edita testimonios con texto, imágenes y videos. Sistema de categorías y tags inteligentes" />

          <CardBenefit
            key="benefit-2"
            icon={CheckCircle}
            title="Moderación eficiente"
            text="Sistema de revisión y aprobación antes de publicación. Control total sobre tu contenido" />

          <CardBenefit
            key="benefit-3"
            icon={Link}
            title="Fácil integración"
            text="API REST y embeds para integrar testimonios en cualquier sitio web o aplicación." />
        </div>
      </div>
    </Container>
  )
}

export default Index

import { LucideIcon } from "lucide-react";

interface CardBenefitProps {
  icon: LucideIcon;
  title: string;
  text?: string;
}

const CardBenefit = ({ icon: Icon, title, text }: CardBenefitProps) => {
  return (
    <div className="shadow-lg p-5 rounded-lg bg-background gap-2 flex flex-col md:p-10 md:mt-6 hover:scale-[1.02] transition-transform">
      <div className="flex gap-5">
        <Icon className="inline size-6 mr-2 text-secondary pl-0.5" />
        <span className="text-m font-semibold">{title}</span>
      </div>
      <p className="text-xs">{text}</p>
    </div>
  )
}

export default CardBenefit

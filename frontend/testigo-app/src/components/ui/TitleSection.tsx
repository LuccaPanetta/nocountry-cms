type TitleSectionProps = {
  text: string
}

const TitleSection = ({text}:TitleSectionProps) => {
  return (
     <p className="text-[20px] lg:text-[26px] text-secondary font-bold mb-2">{text}</p>
  )
}

export default TitleSection

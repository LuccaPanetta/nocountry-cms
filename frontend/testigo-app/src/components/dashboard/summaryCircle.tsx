import { useCountUp } from '@/hooks/useCountUp'

function SummaryCircle({ label, value, color }: {
    label: string
    value: number
    color: string
}) {
    const animatedValue = useCountUp(value, 1000)

    return (
        <div className="flex flex-col items-center">
            <div
                className="
    w-30 h-30 md:w-35 md:h-35 lg:w-45 lg:h-45
    rounded-full
    border-4 lg:border-8
    flex flex-col justify-center items-center text-center
  "
                style={{
                    borderColor: `var(--${color})`,
                    color: `var(--${color})`,
                }}
            >
                <div className="text-sm lg:text-lg">{label}</div>
                <div className="text-2xl lg:text-4xl font-bold">{animatedValue}</div>
            </div>
        </div>
    )
}

export default SummaryCircle

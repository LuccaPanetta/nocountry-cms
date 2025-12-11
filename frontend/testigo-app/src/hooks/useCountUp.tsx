import { useState, useEffect } from "react"

// Hook para animar un contador
export function useCountUp(target: number, duration: number = 1000) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!target) return

        let start = 0
        const increment = target / (duration / 16) 
        const interval = setInterval(() => {
            start += increment
            if (start >= target) {
                start = target
                clearInterval(interval)
            }
            setCount(Math.floor(start))
        }, 16)

        return () => clearInterval(interval)
    }, [target, duration])

    return count
}

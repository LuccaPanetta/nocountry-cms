"use client"


import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Container from './Container'

type SuccessProps = {
    text: string
    buttonText: string
    redirect?: string | (() => string)
}

const Success = ({ text, buttonText, redirect }: SuccessProps) => {
    const router = useRouter()

    const handleClick = () => {
        if (!redirect) return

        const url = typeof redirect === "function" ? redirect() : redirect

        router.push(url)
    }

    return (
        <div className='flex flex-col items-center w-80 md:w-100 shadow-lg rounded-2xl p-10 m-auto bg-primary-foreground'>
            <Image
                src="/testiGo_iso.svg"
                alt="Isotipo testiGo"
                width={85}
                height={64}
            />
            <Image
                src="/success.svg"
                alt="success_icon"
                width={63}
                height={63}
                className='pt-6'
            />
            <div className="flex flex-col items-center pt-6 w-full ">
                <p className="text-center text-2xl pb-4 font-semibold">{text}</p>
                <Button
                    onClick={handleClick}
                    className="cursor-pointer mx-4 mt-4 w-1/2"
                    variant="secondary"
                >
                    {buttonText}
                </Button>

            </div>

        </div>
    )
}

export default Success
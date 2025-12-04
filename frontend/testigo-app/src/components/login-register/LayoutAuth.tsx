import React from 'react'
import TitleSection from '../ui/TitleSection'
import Image from 'next/image'

interface LayoutAuthProps {
    title: string,
    subtitle?: string,
    children: React.ReactNode
}

const LayoutAuth = ({ title, subtitle, children }: LayoutAuthProps) => {
    return (
        <div className="grid min-h-screen w-full " >
            <div className="flex flex-col max-w-[300px] justify-center items-center px-4 py-2 bg-primary-foreground shadow-md rounded-lg my-40 mx-auto">
                <Image
                    src='/testiGo_iso.svg'
                    alt="Logo TestiGO"
                    width={85}
                    height={54}
                    priority
                    className="my-6" />
                <TitleSection text={title} />
                <p className="text-sm md:text-base mb-6">{subtitle}</p>
                {children}
            </div>
        </div>
    )
}

export default LayoutAuth

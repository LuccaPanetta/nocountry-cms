import React from 'react'
import TitleSection from '../ui/TitleSection'
import Image from 'next/image'
import Link from 'next/link'

interface LayoutAuthProps {
    title: string,
    subtitle?: string,
    children: React.ReactNode
}

const LayoutAuth = ({ title, subtitle, children }: LayoutAuthProps) => {
    return (
        <div className="grid w-full py-16 min-h-screen" >
            <div className="flex flex-col max-w-[300px] justify-center items-center px-4 lg:px-6 py-8 bg-primary-foreground shadow-md rounded-lg m-auto lg:max-w-[630px]">
                <Link href="/" aria-label="Ir a inicio">
                    <Image
                        src='/testiGo_iso.svg'
                        alt="Logo TestiGO"
                        width={85}
                        height={54}
                        priority
                        className="my-6"
                    />
                </Link>
                <TitleSection text={title} />
                <p className="text-sm md:text-base mb-6 font-light text-center">{subtitle}</p>
                {children}
            </div>
        </div>
    )
}

export default LayoutAuth

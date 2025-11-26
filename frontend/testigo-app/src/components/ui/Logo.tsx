import Image from 'next/image'

const Logo = () => {
    return (
        <Image
            src='/testiGo_isologo-slogan.svg'
            alt="Logo TestiGO"
            width={154}
            height={47}
            priority
            className="w-[154px] h-auto lg:w-[180px]"
        />
    )
}

export default Logo

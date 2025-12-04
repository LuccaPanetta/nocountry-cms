'use client';
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import Logo from "../ui/Logo"

const Header = () => {

  const router = useRouter();

  return (
    <header className="h-25 w-full shadow-md lg:h-30">
        <nav className="h-full flex items-center justify-between p-5 lg:max-w-[1277px] m-auto lg:p-0">
          <Logo />
          <Button onClick={()=>router.push('/login')} className="w-[83] h-auto text-xs md:w-[147]">Iniciar sesión</Button>
        </nav>
      </header>
  )
}

export default Header

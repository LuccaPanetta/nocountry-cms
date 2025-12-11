'use client';
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import Logo from "../ui/Logo"
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import Avatar from "../ui/avatar";
import { useEffect, useState } from "react";
import DrawerMenu from "./DrawerMenu";

const Header = () => {

  const router = useRouter();
  const { token, nombre, apellido, rol } = useUserStore();


  const avatarInitials = (nombre && apellido) ? nombre.charAt(0).toUpperCase() + apellido.charAt(0).toUpperCase() : '';

  const [open, setOpen] = useState(false);

useEffect(() => {
  if (open) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  } else {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  return () => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
}, [open]);

  return (
    <>
      <header className="h-25 w-full shadow-md lg:h-30">
        <nav className="h-full flex items-center justify-between p-5 lg:max-w-[1277px] m-auto lg:p-0">
          <Link href="/"><Logo /></Link>
          {token ?
            <div className="flex justify-end relative items-center gap-2 cursor-pointer">
              {rol !== 'contributor' ? <span className="text-sm">{rol?.toUpperCase()}</span> : ''}
              <Avatar avatarInitials={avatarInitials} onClick={() => setOpen(true)} />
            </div>
            :
            <Button onClick={() => router.push('/login')} className="w-[83] h-auto text-xs md:w-[147]">Iniciar sesión</Button>
          }
        </nav>
      </header>
      {open && (
        <div
          className="fixed inset-0 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}
      <DrawerMenu isOpen={open} setOpen={setOpen} avatarInitials={avatarInitials} />
    </>
  )
}

export default Header

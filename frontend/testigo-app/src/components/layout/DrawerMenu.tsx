import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useRef} from 'react'
import Avatar from '../ui/avatar'
import { LogOut, X } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { usePathname, useRouter } from 'next/navigation'

type DrawerMenuProps = {
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    avatarInitials: string
}

const DrawerMenu = ({ isOpen, setOpen, avatarInitials }: DrawerMenuProps) => {

    const drawerRef = useRef<HTMLDivElement | null>(null);
    const { nombre, apellido, rol, clearUserData } = useUserStore();

    const pathname = usePathname();
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const links = [
        ...(rol === "admin" || rol === "editor"
            ? [
                { href: "/", label: "Inicio" },
                { href: "/dashboard/admin?section=moderacion", label: "Moderación" },
            ]
            : []),
        ...(rol === "admin"
            ? [
                { href: "/dashboard/admin?section=usuarios", label: "Gestión de Usuarios" },
                { href: "/dashboard/admin?section=configuraciones", label: "Configuraciones" },
                { href: "/dashboard/admin?section=metricas", label: "Métricas" },
            ]
            : []),
              ...(rol === "contributor"
            ? [
                { href: "/", label: "Inicio" },
                { href: "/testimonials", label: "Testimonios públicos" },
                { href: "/testimonials/create", label: "Crear testimonio" },
            ]
            : []),
    ];


    const handleLogout = () => {
    clearUserData(); 
    setOpen(false)
    router.push("/"); 
  };

    return (

        <div
            ref={drawerRef}
            className={`
    fixed top-0 right-0 z-10 w-[270px] min-h-screen rounded-bl-[100px]
    flex flex-col
    transition-all duration-300 ease-in-out
    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
  `}
        >
            <div className="bg-primary p-8 text-white flex flex-col flex-1">
                <X onClick={() => setOpen(false)} aria-label="Cerrar menú" className="cursor-pointer" />
                <div className="flex flex-col mt-20 items-end text-right gap-3">
                    <Avatar avatarInitials={avatarInitials} />
                    <div className="flex flex-col">
                        <span>{nombre} <strong>{apellido}</strong></span>
                        <span className="text-xs font-light">{rol?.toUpperCase()}</span>
                    </div>
                </div>

                <hr className="mt-15 border-white" />

                <nav className="flex flex-col gap-3 flex-1 overflow-auto mt-10 text-right mb-auto">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`hover:text-accent ${pathname === link.href ? 'text-accent font-bold' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="h-25 w-full bg-white rounded-bl-[100px] flex flex-row justify-end items-center p-8 gap-2 cursor-pointer text-sm" onClick={() => handleLogout() }>
                <span>CERRAR SESIÓN</span><LogOut className="text-secondary w-6" />
            </div>
        </div>

    )
}

export default DrawerMenu

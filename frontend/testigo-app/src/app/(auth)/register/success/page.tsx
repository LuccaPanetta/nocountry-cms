'use client'
import Success from "@/components/ui/success"
import { useUserStore } from "@/store/userStore";


const page = () => {

    const { nombre, rol } = useUserStore();
    const handleRedirect = () => {

        switch (rol) {
            case
                'admin':
                return "/dashboard/admin?section=moderacion";
            case
                'editor':
                return '/dashboard/editor';
            default:
                return '/testimonials/create';
        }
    }

    return (
        <Success text="Tu cuenta se creó exitosamente" buttonText="Comenzar" redirect={handleRedirect} />
    )
}

export default page
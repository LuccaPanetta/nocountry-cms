'use client'
import Success from "@/components/ui/success"
import { useUserStore } from "@/store/userStore"


const page = () => {

   const {nombre} = useUserStore();    

    const userName = nombre || "Usuario";

    const handleRedirect = () => {
   
        switch (useUserStore.getState().rol) {
            case
                'admin':
                return '/admin/dashboard';  
            case
                'editor':
                return '/dashboard';  
            default:
                return '/testimonials/create';  
        }   
    }

    return (
        <Success text={`Bienvenid@ ${userName}`} buttonText="Comenzar" redirect={handleRedirect} />
    )
}

export default page
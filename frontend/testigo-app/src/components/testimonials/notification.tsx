import {CircleCheckBig} from 'lucide-react';
import Logo from './logo.png';

const TestimonialNotification = () => {

    return (
        <main className="flex flex-col justify-center items-center gap-4 w-auto p-4 border-2 border-Neutro-1 rounded-2xl">
            <picture>
                <img src={Logo} alt="logo de la empresa" />
            </picture>
            <CircleCheckBig className='text-Success text-center h-10 w-10' />
            <span className="text-Primary text-center">
                Tu testimonio se creo exitosamente
            </span>
            <button className="bg-Secondary text-white mx-auto px-8 py-2 rounded ">
                Volver a inicio
            </button>
        </main>
    )
}

export default TestimonialNotification
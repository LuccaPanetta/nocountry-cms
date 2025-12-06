import { CircleCheckBig } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logo from './logo.png';

interface TestimonialNotificationProps {
  onClose?: () => void;
}

const TestimonialNotification = ({ onClose }: TestimonialNotificationProps) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
    onClose?.();
  };

  return (
    <>
      
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal centrado */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <main className="flex flex-col justify-center items-center gap-4 w-auto px-14 py-8 bg-white rounded-2xl shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200">
          <picture>
            <Image src={Logo} alt="logo de la empresa" width={100} height={100} />
          </picture>
          <CircleCheckBig className='text-Success text-center h-10 w-10' />
          <span className="text-Primary font-bold text-center text-lg">
            Tu testimonio se <br /> creó exitosamente
          </span>
          <button 
            onClick={handleGoHome}
            className="bg-Secondary text-white mx-auto px-8 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Volver a inicio
          </button>           
        </main>
      </div>
    </>
  );
};

export default TestimonialNotification;

'use client'
import { TestimonialForm } from '@/components/testimonials/testimonial-form'
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const page = () => {
  const router = useRouter();
  const { token, rol, hasHydrated } = useUserStore();

  useEffect(() => {
    if (!hasHydrated) return; 

    if (!token) {
      router.replace("/login");
      return;
    }

    if (rol !== "contributor") {
      router.replace("/");
      return;
    }
  }, [token, rol, hasHydrated, router]);


  return (
    <TestimonialForm />
  )
}

export default page

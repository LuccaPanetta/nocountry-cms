import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Testimonios</h1>
        <Link href="/testimonials/create">
          <Button className="bg-Primary hover:bg-Primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Crear Testimonio
          </Button>
        </Link>
      </div>
      {/* Resto de tu contenido de testimonios */}
    </div>
  )
}
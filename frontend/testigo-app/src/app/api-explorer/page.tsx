'use client'

import Container from '@/components/ui/Container';
import { ApiExplorer } from '@/components/api-explorer/ApiExplorer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from "@/store/userStore";
import { useRouter } from 'next/navigation';


export default function ApiExplorerPage() {

  const router = useRouter();
  const { token, rol } = useUserStore();

  const handleAccessCMS = () => {
    if (!token) {
      return router.push("/login");
    }

    switch (rol) {
      case "contributor":
        return router.push("/");

      case "editor":
        return router.push("/dashboard/editor");

      case "admin":
        return router.push("/dashboard/admin?section=moderacion");

      default:
        return router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <header className="border-b">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Testimonial CMS</h1>
                <p className="text-sm text-gray-600">API Pública</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleAccessCMS}>
                Acceder al CMS
              </Button>
              <Button asChild>
                <a
                  href={`${process.env.NEXT_PUBLIC_URL_BASE}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver Documentación Completa
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container>
          <ApiExplorer />
        </Container>
      </main>

      <footer className="border-t py-8 mt-12">
        <Container>
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} Testimonial CMS. Todos los derechos reservados.</p>
            <p className="text-sm mt-2">
              Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_URL_BASE}</code>
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
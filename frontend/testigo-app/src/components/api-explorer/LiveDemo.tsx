'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Filter } from 'lucide-react';
import { usePublicTestimonials } from '@/services/use-queries-service/public-queries';
import CardTestimony from '@/components/testimonials/CardTestimony';
import { PublicTestimonyResType } from '@/types/testimony-type';

// Tipo local para el estado (incluye 'all')
type LocalParams = {
  page: number;
  limit: number;
  category: string;
  sort: 'newest' | 'oldest' | 'popular' | 'views';
  hasMultimedia: boolean | undefined;
  mediaType: 'video' | 'image' | 'audio' | 'none' | 'all';
};

export function LiveDemo() {
  const [params, setParams] = useState<LocalParams>({
    page: 1,
    limit: 6,
    category: '',
    sort: 'newest',
    hasMultimedia: undefined,
    mediaType: 'all',
  });

  // Convertir params locales a params para API (remover 'all')
  const apiParams = {
    ...params,
    mediaType: params.mediaType === 'all' ? undefined : params.mediaType,
  };

  const { data, isLoading, error, refetch } = usePublicTestimonials(apiParams);

  const handleParamChange = (key: keyof LocalParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    refetch();
  };

  // Hay un error en tu código: tienes DOS Select para mediaType
  // El primero dice "Ordenar por" pero usa mediaType, el segundo dice "Tipo de multimedia"
  // Parece que el primero debería ser para "sort", no para "mediaType"
  
  // Voy a corregir eso también:

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Demostración en Vivo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              placeholder="tech, education, etc."
              value={params.category}
              onChange={(e) => handleParamChange('category', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sort">Ordenar por</Label>
            <Select
              value={params.sort}
              onValueChange={(value: 'newest' | 'oldest' | 'popular' | 'views') => 
                handleParamChange('sort', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="views">Más vistos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mediaType">Tipo de multimedia</Label>
            <Select
              value={params.mediaType}
              onValueChange={(value: 'video' | 'image' | 'audio' | 'none' | 'all') => 
                handleParamChange('mediaType', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Imagen</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="none">Sin multimedia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasMultimedia"
              checked={params.hasMultimedia === true}
              onChange={(e) => handleParamChange('hasMultimedia', e.target.checked ? true : undefined)}
              className="rounded"
            />
            <Label htmlFor="hasMultimedia">Solo con multimedia</Label>
          </div>
          
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </>
            )}
          </Button>
        </div>

        {/* Resultados */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Resultados ({data?.total || 0} testimonios)</h3>
          
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded">
              Error: {(error as Error).message}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.testimonials?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.testimonials.map((testimonial: PublicTestimonyResType) => (
                <CardTestimony
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron testimonios con los filtros aplicados.
            </div>
          )}
          
          {/* Paginación */}
          {data && data.total > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => handleParamChange('page', params.page - 1)}
                disabled={params.page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {params.page} de {Math.ceil(data.total / params.limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => handleParamChange('page', params.page + 1)}
                disabled={params.page >= Math.ceil(data.total / params.limit)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>

        {/* Información de la request */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="text-sm font-semibold mb-2">Request URL:</h4>
          <code className="text-sm bg-white p-2 rounded block">
            GET {process.env.NEXT_PUBLIC_URL_BASE}/public/testimonials?{new URLSearchParams(
              Object.entries(apiParams)
                .filter(([_, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)])
            ).toString()}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
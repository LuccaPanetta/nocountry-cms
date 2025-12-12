'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getStatistics } from '@/services/use-cases/stats-service';
import { RefreshCw, Eye, Users, Layers, TrendingUp, Video, Image, Type, Music } from 'lucide-react';

interface StatsData {
  totalTestimonials: number;
  totalViews: number;
  totalEmbeds: number;
  testimonialsWithMultimedia: number;
  testimonialsByType: {
    video: number;
    image: number;
    audio: number;
    text: number;
    none: number;
  };
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  lastUpdated: string;
}

function StatisticsContent() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Función para formatear números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  // Función para calcular porcentaje
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 text-center">
                <div className="h-10 bg-gray-200 animate-pulse rounded mb-2 mx-auto w-16"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-4">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500 mt-2">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">⚠️ Error al cargar estadísticas</div>
        <p className="text-gray-600 mb-4">{error || 'No se pudieron cargar los datos'}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  // Calcular métricas derivadas
  const multimediaPercentage = calculatePercentage(stats.testimonialsWithMultimedia, stats.totalTestimonials);
  const viewsPerTestimonial = stats.totalTestimonials > 0 
    ? Math.round(stats.totalViews / stats.totalTestimonials) 
    : 0;
  const embedRate = stats.totalViews > 0 
    ? calculatePercentage(stats.totalEmbeds, stats.totalViews)
    : '0%';

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="text-3xl font-bold text-primary">
                {formatNumber(stats.totalTestimonials)}
              </div>
            </div>
            <p className="text-sm text-gray-600">Testimonios Totales</p>
            <div className="text-xs text-gray-500 mt-1">
              {multimediaPercentage} con multimedia
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(stats.totalViews)}
              </div>
            </div>
            <p className="text-sm text-gray-600">Vistas Totales</p>
            <div className="text-xs text-gray-500 mt-1">
              {viewsPerTestimonial} vistas/testimonio
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">
                {formatNumber(stats.totalEmbeds)}
              </div>
            </div>
            <p className="text-sm text-gray-600">Embeds Activos</p>
            <div className="text-xs text-gray-500 mt-1">
              Tasa de embed: {embedRate}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">
                {stats.topCategories.length}
              </div>
            </div>
            <p className="text-sm text-gray-600">Categorías Activas</p>
            <div className="text-xs text-gray-500 mt-1 capitalize">
              {stats.topCategories[0]?.name || 'N/A'} es la más popular
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Tipo de Multimedia */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Distribución por Tipo de Multimedia</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Video className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold text-gray-800">
                  {stats.testimonialsByType.video}
                </div>
              </div>
              <div className="text-sm text-gray-600">Video</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(stats.testimonialsByType.video, stats.totalTestimonials)}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Image className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold text-gray-800">
                  {stats.testimonialsByType.image}
                </div>
              </div>
              <div className="text-sm text-gray-600">Imagen</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(stats.testimonialsByType.image, stats.totalTestimonials)}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Music className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold text-gray-800">
                  {stats.testimonialsByType.audio}
                </div>
              </div>
              <div className="text-sm text-gray-600">Audio</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(stats.testimonialsByType.audio, stats.totalTestimonials)}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Type className="w-5 h-5 text-orange-600" />
                <div className="text-2xl font-bold text-gray-800">
                  {stats.testimonialsByType.text}
                </div>
              </div>
              <div className="text-sm text-gray-600">Texto</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(stats.testimonialsByType.text, stats.totalTestimonials)}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.testimonialsByType.none}
              </div>
              <div className="text-sm text-gray-600">Sin multimedia</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(stats.testimonialsByType.none, stats.totalTestimonials)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorías Top */}
      {stats.topCategories.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Categorías más Populares</h3>
            <div className="space-y-3">
              {stats.topCategories.map((category, index) => {
                const percentage = calculatePercentage(category.count, stats.totalTestimonials);
                return (
                  <div key={category.name} className="flex items-center">
                    <div className="w-8 text-sm font-semibold text-gray-700">
                      {index + 1}.
                    </div>
                    <div className="w-32 text-sm font-medium text-gray-700 capitalize truncate">
                      {category.name}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: percentage }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="font-semibold">{category.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional y Endpoints */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Actualización</h4>
            <p className="text-sm text-gray-600">
              Última actualización: <span className="font-medium">{formatDate(stats.lastUpdated)}</span>
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Endpoints de Estadísticas:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-xs font-mono">
                  GET /public/stats
                </code>
                <span className="text-xs text-gray-600">→ Estadísticas generales</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-xs font-mono">
                  GET /public/stats/categories
                </code>
                <span className="text-xs text-gray-600">→ Estadísticas por categoría</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de actualización */}
      <div className="text-center">
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar Estadísticas'}
        </button>
      </div>
    </div>
  );
}

export default StatisticsContent;
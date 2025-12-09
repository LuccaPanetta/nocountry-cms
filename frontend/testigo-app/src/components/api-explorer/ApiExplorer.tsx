'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiEndpointCard, ApiEndpointType } from './ApiEndpointCard';
import { LiveDemo } from './LiveDemo';
import { EmbedTester } from './EmbedTester';
import { Code, Database, BarChart3, Link, Terminal } from 'lucide-react';

// Definición de endpoints basada en tu imagen
const apiEndpoints: ApiEndpointType[] = [
  {
    method: 'GET',
    path: '/public/testimonials',
    description: 'Obtener testimonios públicos con paginación y filtros',
    requiresAuth: false,
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Número de página', example: '1' },
      { name: 'limit', type: 'number', required: false, description: 'Límite por página', example: '10' },
      { name: 'category', type: 'string', required: false, description: 'Filtrar por categoría', example: 'tech' },
      { name: 'tags', type: 'string[]', required: false, description: 'Tags separados por coma', example: 'education,success' },
      { name: 'hasMultimedia', type: 'boolean', required: false, description: 'Solo testimonios con multimedia', example: 'true' },
      { name: 'mediaType', type: 'string', required: false, description: 'Tipo de multimedia', example: 'video' },
      { name: 'sort', type: 'string', required: false, description: 'Ordenar resultados', example: 'newest' },
    ],
    exampleResponse: {
      testimonials: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Transformación Digital Exitosa",
          author: "Juan Pérez",
          company: "TechCorp",
          position: "CEO",
          content: "Excelente plataforma...",
          status: "published",
          category: "tech",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          tags: ["digital", "transformation"],
          multimedia: {
            type: "video",
            url: "https://youtube.com/watch?v=abc123",
            description: "Testimonio en video"
          },
          engagement: {
            views: 1500,
            embeds: 45,
            lastUpdated: "2024-01-20T08:00:00Z"
          }
        }
      ],
      total: 1,
      page: 1,
      limit: 10
    }
  },
  {
    method: 'POST',
    path: '/public/testimonials/search',
    description: 'Búsqueda avanzada de testimonios',
    requiresAuth: false,
    parameters: [
      { name: 'q', type: 'string', required: true, description: 'Término de búsqueda', example: 'transformación digital' },
      { name: 'page', type: 'number', required: false, description: 'Número de página', example: '1' },
      { name: 'limit', type: 'number', required: false, description: 'Límite por página', example: '10' },
    ]
  },
  {
    method: 'GET',
    path: '/public/testimonials/{id}',
    description: 'Obtener testimonio público por ID',
    requiresAuth: false,
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
  {
    method: 'GET',
    path: '/public/testimonials/{id}/multimedia',
    description: 'Obtener multimedia del testimonio',
    requiresAuth: false,
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
  {
    method: 'GET',
    path: '/public/testimonials/{id}/related',
    description: 'Obtener testimonios relacionados',
    requiresAuth: false,
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
  {
    method: 'GET',
    path: '/public/embeds/{id}',
    description: 'Obtener código para incrustar testimonio',
    requiresAuth: false,
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
 {
    method: 'GET',
    path: '/public/embeds/{id}/code',
    description: 'Obtener solo código HTML del embed',
    requiresAuth: false,
    responseType: 'html', // ← Agregar esto
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
  {
    method: 'GET',
    path: '/public/embed/{id}.js',
    description: 'JavaScript para incrustación automática',
    requiresAuth: false,
    responseType: 'javascript', // ← Agregar esto
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
    {
    method: 'GET',
    path: '/public/embeds/{id}/preview',
    description: 'Vista previa del embed',
    requiresAuth: false,
    responseType: 'html', // ← Agregar esto
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
  {
    method: 'GET',
    path: '/public/embeds/{id}/oembed',
    description: 'oEmbed para el testimonio (JSON)',
    requiresAuth: false,
    responseType: 'json', // ← Este sí devuelve JSON
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID del testimonio', example: '123e4567-e89b-12d3-a456-426614174000' }
    ]
  },
  {
    method: 'GET',
    path: '/public/stats',
    description: 'Estadísticas públicas',
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/public/stats/categories',
    description: 'Estadísticas por categoría',
    requiresAuth: false
  },
];

interface ApiExplorerProps {
  baseUrl?: string;
}

export function ApiExplorer({ baseUrl = process.env.NEXT_PUBLIC_URL_BASE || '' }: ApiExplorerProps) {
  const [activeTab, setActiveTab] = useState('endpoints');

  // Extraer el path base sin el segmento final si es necesario
  const cleanBaseUrl = baseUrl.endsWith('') 
    ? baseUrl 
    : baseUrl.replace(/\/api\/v1\/?$/, '');

  const apiBaseUrl = `${cleanBaseUrl}`;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Explorador de API</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explora y prueba la API pública de Testimonial CMS. Todos los endpoints están disponibles públicamente
          y puedes usarlos para integrar testimonios en tu aplicación.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Demo en Vivo
          </TabsTrigger>
          <TabsTrigger value="embed-tester" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Probador de Embeds
          </TabsTrigger>
          <TabsTrigger value="embeds" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Documentación Embeds
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
              <CardDescription>
                Todos los endpoints usan esta URL base:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <code className="bg-gray-100 p-3 rounded text-sm font-mono block">
                  {apiBaseUrl}
                </code>
                <p className="text-sm text-gray-600">
                  Nota: La URL base ya incluye <code>/api/v1</code>. Los endpoints se construyen a partir de esta URL.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {apiEndpoints.map((endpoint) => (
              <ApiEndpointCard
                key={`${endpoint.method}-${endpoint.path}`}
                endpoint={endpoint}
                baseUrl={apiBaseUrl}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demo">
          <LiveDemo />
        </TabsContent>

        <TabsContent value="embed-tester">
          <EmbedTester baseUrl={apiBaseUrl} />
        </TabsContent>

        <TabsContent value="embeds">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Embeds</CardTitle>
              <CardDescription>
                Incrusta testimonios en cualquier sitio web con nuestro sistema de embeds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">HTML Embed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs">
{`<!-- Incrustar en tu HTML -->
<div id="testimonial-embed"></div>
<script src="${apiBaseUrl}/public/embed/{id}.js"></script>`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">oEmbed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs">
{`// Obtener datos oEmbed
GET ${apiBaseUrl}/public/embeds/{id}/oembed

// Respuesta JSON típica
{
  "type": "rich",
  "version": "1.0",
  "html": "<div class='testimonial-embed'>...</div>",
  "width": 800,
  "height": 450,
  "title": "Testimonio de Cliente",
  "author_name": "Juan Pérez",
  "provider_name": "Testimonial CMS"
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">JavaScript Embed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs bg-gray-100 p-2 rounded block font-mono">
                      {`<script src="${apiBaseUrl}/public/embed/{id}.js"></script>`}
                    </code>
                    <p className="text-sm text-gray-600 mt-2">
                      Incluye automáticamente el testimonio en tu página.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Iframe Directo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs bg-gray-100 p-2 rounded block font-mono">
                      {`<iframe src="${apiBaseUrl}/public/embeds/{id}"></iframe>`}
                    </code>
                    <p className="text-sm text-gray-600 mt-2">
                      Embeds responsivos con estilos incluidos.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">API Directa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs bg-gray-100 p-2 rounded block font-mono">
                      {`GET ${apiBaseUrl}/public/embeds/{id}/code`}
                    </code>
                    <p className="text-sm text-gray-600 mt-2">
                      Obtén solo el código HTML para integrar manualmente.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Públicas</CardTitle>
              <CardDescription>
                Métricas globales del sistema de testimonios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary">1,234</div>
                    <p className="text-sm text-gray-600">Testimonios Totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600">45K</div>
                    <p className="text-sm text-gray-600">Vistas Totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">890</div>
                    <p className="text-sm text-gray-600">Embeds Activos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">15</div>
                    <p className="text-sm text-gray-600">Categorías</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Endpoints de Estadísticas:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET {apiBaseUrl}/public/stats</code>
                    <span className="text-sm text-gray-600">→ Estadísticas generales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET {apiBaseUrl}/public/stats/categories</code>
                    <span className="text-sm text-gray-600">→ Estadísticas por categoría</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integración Rápida</CardTitle>
          <CardDescription>
            Ejemplos de código para empezar rápidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Para desarrolladores:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Ejemplo usando fetch
fetch('${apiBaseUrl}/public/testimonials?limit=3')
  .then(response => response.json())
  .then(data => {
    // Mostrar testimonios en tu sitio
    console.log(data.testimonials);
  });

// Ejemplo usando axios
import axios from 'axios';

axios.get('${apiBaseUrl}/public/testimonials', {
  params: {
    category: 'tech',
    sort: 'popular'
  }
}).then(response => {
  console.log(response.data);
});`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Para WordPress o CMS:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Shortcode para WordPress
function testimonial_embed_shortcode($atts) {
    $atts = shortcode_atts(['id' => ''], $atts);
    
    if (empty($atts['id'])) {
        return '<!-- Error: ID de testimonio requerido -->';
    }
    
    return '<div class="testimonial-embed-wrapper">
        <script src="${apiBaseUrl}/public/embed/' . esc_attr($atts['id']) . '.js"></script>
    </div>';
}
add_shortcode('testimonial', 'testimonial_embed_shortcode');`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Para React/Next.js:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Componente React para testimonios
import { useEffect, useState } from 'react';

function TestimonialEmbed({ id }) {
  const [testimonial, setTestimonial] = useState(null);
  
  useEffect(() => {
    fetch(\`${apiBaseUrl}/public/testimonials/\${id}\`)
      .then(res => res.json())
      .then(setTestimonial);
  }, [id]);
  
  if (!testimonial) return <div>Cargando...</div>;
  
  return (
    <div className="testimonial-card">
      <h3>{testimonial.title}</h3>
      <p>{testimonial.content}</p>
      <div className="author">{testimonial.author}</div>
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
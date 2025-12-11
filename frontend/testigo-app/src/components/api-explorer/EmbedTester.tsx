'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Code, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmbedTesterProps {
  baseUrl: string;
}

export function EmbedTester({ baseUrl }: EmbedTesterProps) {
  const [testimonialId, setTestimonialId] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

 const fetchEmbedCode = async () => {
  if (!testimonialId.trim()) return;
  
  setIsLoading(true);
  try {
    // Para endpoints HTML, usar text() en lugar de json()
    const response = await fetch(`${baseUrl}/public/embeds/${testimonialId}/code`);
    if (!response.ok) throw new Error('Embed no encontrado');
    
    // Usar text() para HTML, no json()
    const data = await response.text();
    setEmbedCode(data);
    
    // URL para preview
    setPreviewUrl(`${baseUrl}/public/embeds/${testimonialId}/preview`);
    
  } catch (error) {
    setEmbedCode(`<!-- Error: ${error instanceof Error ? error.message : 'Embed no disponible'} -->`);
    setPreviewUrl('');
  } finally {
    setIsLoading(false);
  }
};

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleIds = [
    { id: '123e4567-e89b-12d3-a456-426614174000', label: 'Ejemplo 1' },
    { id: '550e8400-e29b-41d4-a716-446655440000', label: 'Ejemplo 2' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Probador de Embeds
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="testimonialId">ID del Testimonio</Label>
            <div className="flex gap-2">
              <Input
                id="testimonialId"
                placeholder="123e4567-e89b-12d3-a456-426614174000"
                value={testimonialId}
                onChange={(e) => setTestimonialId(e.target.value)}
                className="font-mono"
              />
              <Button 
                onClick={fetchEmbedCode}
                disabled={isLoading || !testimonialId.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Obtener Embed'
                )}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">IDs de ejemplo:</p>
            <div className="flex flex-wrap gap-2">
              {exampleIds.map((example) => (
                <Badge
                  key={example.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setTestimonialId(example.id);
                    if (testimonialId === example.id) {
                      fetchEmbedCode();
                    }
                  }}
                >
                  {example.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {embedCode && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Código HTML del Embed:</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(embedCode)}
                  className="h-8"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
            </div>

            {previewUrl && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Vista previa del Embed:
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                      Abrir en nueva pestaña
                    </a>
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    className="w-full h-64"
                    title="Embed Preview"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-2">JavaScript Embed</h4>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {`<script src="${baseUrl}/public/embed/${testimonialId}.js"></script>`}
                  </code>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-2">oEmbed</h4>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {`GET ${baseUrl}/public/embeds/${testimonialId}/oembed`}
                  </code>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-2">Embed Directo</h4>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {`<iframe src="${baseUrl}/public/embeds/${testimonialId}"></iframe>`}
                  </code>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Code, Play, Terminal, Loader2, FileText, FileCode, Eye } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ApiEndpointType = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  responseType?: 'json' | 'html' | 'javascript' | 'text'; // Nuevo campo
  exampleResponse?: any;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
  }>;
};

interface ApiEndpointCardProps {
  endpoint: ApiEndpointType;
  baseUrl: string;
}

export function ApiEndpointCard({ endpoint, baseUrl }: ApiEndpointCardProps) {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [responseType, setResponseType] = useState<'text' | 'json'>('json');

  // Determinar el tipo de respuesta esperado basado en el endpoint
  const getExpectedResponseType = (): 'json' | 'html' | 'javascript' | 'text' => {
    // Si el endpoint tiene un tipo definido, usarlo
    if (endpoint.responseType) return endpoint.responseType;
    
    // Inferir basado en la ruta
    if (endpoint.path.includes('.js')) return 'javascript';
    if (endpoint.path.includes('/preview') || endpoint.path.includes('/code')) return 'html';
    if (endpoint.path.includes('/embeds/') || endpoint.path.includes('/embed/')) return 'text';
    
    // Por defecto, JSON
    return 'json';
  };

  const expectedType = getExpectedResponseType();

  const buildFullUrl = () => {
    let fullPath = endpoint.path;
    
    // Reemplazar parámetros de ruta {id}, {slug}, etc.
    Object.keys(paramValues).forEach(key => {
      if (fullPath.includes(`{${key}}`)) {
        fullPath = fullPath.replace(`{${key}}`, paramValues[key]);
      }
    });
    
    // Agregar query params
    const queryParams = new URLSearchParams();
    Object.keys(paramValues).forEach(key => {
      if (!fullPath.includes(`{${key}}`) && paramValues[key]) {
        queryParams.append(key, paramValues[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${baseUrl}${fullPath}${queryString ? `?${queryString}` : ''}`;
    
    return url;
  };

  const fullUrl = buildFullUrl();

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'html': return <FileText className="w-4 h-4" />;
      case 'javascript': return <FileCode className="w-4 h-4" />;
      case 'json': return <Code className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  const handleTestEndpoint = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);
    
    try {
      const url = buildFullUrl();
      console.log('Testing URL:', url);
      
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Accept': expectedType === 'json' ? 'application/json' : 'text/html',
        },
      });
      
      // Determinar cómo procesar la respuesta
      if (expectedType === 'json') {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }
        setTestResult({ type: 'json', data });
        setResponseType('json');
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
        }
        setTestResult({ type: expectedType, data: text });
        setResponseType('text');
      }
      
    } catch (error) {
      // Si falla el JSON parse, intentar como texto
      if (error instanceof SyntaxError && expectedType === 'json') {
        try {
          // Reintentar como texto
          const url = buildFullUrl();
          const response = await fetch(url);
          const text = await response.text();
          setTestResult({ type: 'text', data: text });
          setResponseType('text');
          setTestError(null);
        } catch (retryError) {
          setTestError(retryError instanceof Error ? retryError.message : 'Error desconocido');
        }
      } else {
        setTestError(error instanceof Error ? error.message : 'Error desconocido');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const renderTestResult = () => {
    if (!testResult) return null;

    switch (testResult.type) {
      case 'json':
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
            <code>{JSON.stringify(testResult.data, null, 2)}</code>
          </pre>
        );
      
      case 'html':
      case 'text':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const blob = new Blob([testResult.data], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
                className="flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Abrir en nueva pestaña
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(testResult.data)}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copiar contenido
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-gray-300 p-2 text-xs font-mono">
                Contenido ({testResult.type.toUpperCase()}):
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                <code>{testResult.data.substring(0, 2000)}</code>
              </pre>
            </div>
          </div>
        );
      
      case 'javascript':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Ejecutar el JS en un iframe sandbox
                  const iframe = document.createElement('iframe');
                  iframe.sandbox = 'allow-scripts';
                  iframe.srcdoc = `<script>${testResult.data}</script>`;
                  document.body.appendChild(iframe);
                  setTimeout(() => document.body.removeChild(iframe), 1000);
                }}
                className="flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Ejecutar JS
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(testResult.data)}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copiar JS
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
              <code>{testResult.data.substring(0, 2000)}</code>
            </pre>
          </div>
        );
      
      default:
        return <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs">{JSON.stringify(testResult.data, null, 2)}</pre>;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getMethodColor(endpoint.method)}>
                {endpoint.method}
              </Badge>
              <span className="font-mono text-sm">{endpoint.path}</span>
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                {getResponseIcon(expectedType)}
                <span className="text-xs">{expectedType.toUpperCase()}</span>
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2">{endpoint.description}</CardDescription>
          </div>
          {endpoint.requiresAuth && (
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              Requiere Auth
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Inputs para parámetros */}
        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Parámetros para probar:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endpoint.parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`param-${param.name}`} className="text-sm font-mono">
                      {param.name}
                    </Label>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      param.required 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {param.required ? 'Requerido' : 'Opcional'}
                    </span>
                  </div>
                  <Input
                    id={`param-${param.name}`}
                    placeholder={`Ej: ${param.example}`}
                    value={paramValues[param.name] || ''}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URL y botones */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">URL completa:</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                {fullUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(fullUrl)}
                className="shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleTestEndpoint}
              disabled={isTesting}
              className="flex items-center gap-1"
            >
              {isTesting  ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Probando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Probar Endpoint
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en nueva pestaña
              </a>
            </Button>
            
            {endpoint.exampleResponse && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(JSON.stringify(endpoint.exampleResponse, null, 2))}
                className="flex items-center gap-1"
              >
                <Code className="w-4 h-4" />
                Copiar ejemplo
              </Button>
            )}
          </div>
        </div>

        {/* Resultados de prueba */}
        {(testResult || testError) && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Resultado de la prueba:
              {testResult && (
                <Badge variant="outline" className="text-xs">
                  {testResult.type.toUpperCase()}
                </Badge>
              )}
            </h4>
            
            {testError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-red-800 font-medium mb-1">Error:</div>
                <code className="text-red-600 text-sm">{testError}</code>
              </div>
            ) : (
              <div className="space-y-3">
                {renderTestResult()}
              </div>
            )}
          </div>
        )}

        {/* Ejemplo de respuesta */}
        {endpoint.exampleResponse && !testResult && expectedType === 'json' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Code className="w-4 h-4" />
                Ejemplo de respuesta (JSON):
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(JSON.stringify(endpoint.exampleResponse, null, 2))}
                className="h-6 px-2"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar JSON
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
              <code>{JSON.stringify(endpoint.exampleResponse, null, 2)}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
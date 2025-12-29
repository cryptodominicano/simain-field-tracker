import React from 'react';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ArrowLeft,
  Clock,
  User,
  Wrench,
  Package,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Image,
  Download,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function VerReporte() {
  const urlParams = new URLSearchParams(window.location.search);
  const ordenId = urlParams.get('ordenId');

  const { data: orden, isLoading: loadingOrden } = useQuery({
    queryKey: ['orden', ordenId],
    queryFn: () => entities.ordenes_trabajo.filter({ id: ordenId }),
    select: (data) => data[0],
    enabled: !!ordenId
  });

  const { data: reportes = [], isLoading: loadingReporte } = useQuery({
    queryKey: ['reporte-orden', ordenId],
    queryFn: () => entities.reportes_trabajo.filter({ orden_trabajo_id: ordenId }),
    enabled: !!ordenId
  });

  const { data: fotos = [] } = useQuery({
    queryKey: ['fotos-orden', ordenId],
    queryFn: () => entities.fotos.filter({ orden_trabajo_id: ordenId }),
    enabled: !!ordenId
  });

  const reporte = reportes[0];
  const isLoading = loadingOrden || loadingReporte;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!orden || !reporte) {
    return (
      <div className="p-4">
        <Card className="bg-white">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No se encontró el reporte</p>
            <Link to={createPageUrl('MisOrdenes')}>
              <Button className="mt-4">Volver a Órdenes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl(`DetalleOrden?id=${ordenId}`)}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reporte de Trabajo</h1>
          <p className="text-sm text-gray-500">{orden.numero_orden}</p>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Trabajo Completado</p>
              <p className="text-sm text-green-600">
                {reporte.created_date && format(new Date(reporte.created_date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Info */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            Información de la Orden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Cliente:</span>
            <span className="font-medium">{orden.cliente_nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo de Servicio:</span>
            <span className="font-medium">{orden.tipo_servicio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Técnico:</span>
            <span className="font-medium">{reporte.presentado_por_nombre}</span>
          </div>
        </CardContent>
      </Card>

      {/* Time */}
      <Card className="bg-white">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tiempo Total</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.floor(reporte.tiempo_gastado_minutos / 60)}h {reporte.tiempo_gastado_minutos % 60}m
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Description */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Trabajo Realizado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{reporte.descripcion_trabajo}</p>
        </CardContent>
      </Card>

      {/* Parts Used */}
      {reporte.partes_usadas && (
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Partes/Materiales Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{reporte.partes_usadas}</p>
          </CardContent>
        </Card>
      )}

      {/* Problems */}
      {reporte.problemas_encontrados && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Problemas Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-900 whitespace-pre-wrap">{reporte.problemas_encontrados}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {reporte.recomendaciones && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-4 w-4" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-900 whitespace-pre-wrap">{reporte.recomendaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {fotos.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Image className="h-4 w-4 text-blue-600" />
              Fotografías ({fotos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto) => (
                <a
                  key={foto.id}
                  href={foto.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                >
                  <img 
                    src={foto.archivo_url} 
                    alt={foto.descripcion || 'Foto'} 
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Status */}
      <Card className="bg-white">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Estado del Reporte:</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {reporte.estado_reporte || 'Enviado'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
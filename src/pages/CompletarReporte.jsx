import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { savePendingReport } from '@/utils/offlineQueue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Send, Loader2, Clock, Image } from 'lucide-react';

export default function CompletarReporte() {
  const urlParams = new URLSearchParams(window.location.search);
  const ordenId = urlParams.get('ordenId');

  const { userProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    descripcion_trabajo: '',
    partes_usadas: '',
    tiempo_gastado_minutos: 0,
    problemas_encontrados: '',
    recomendaciones: ''
  });

  const queryClient = useQueryClient();

  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden', ordenId],
    queryFn: () => entities.ordenes_trabajo.filter({ id: ordenId }),
    select: (data) => data[0],
    enabled: !!ordenId
  });

  const { data: fotos = [] } = useQuery({
    queryKey: ['fotos-orden', ordenId],
    queryFn: () => entities.fotos.filter({ orden_trabajo_id: ordenId }),
    enabled: !!ordenId
  });

  const { data: registros = [] } = useQuery({
    queryKey: ['registros-orden', ordenId, userProfile?.id],
    queryFn: () => entities.registros_entrada.filter({
      orden_trabajo_id: ordenId,
      usuario_id: userProfile?.id
    }),
    enabled: !!ordenId && !!userProfile?.id
  });

  // Calculate time spent
  useEffect(() => {
    if (registros.length > 0) {
      const inicio = registros.find(r => r.tipo_registro === 'Inicio');
      if (inicio) {
        const minutos = Math.round((new Date() - new Date(inicio.created_date)) / (1000 * 60));
        setFormData(prev => ({ ...prev, tiempo_gastado_minutos: minutos }));
      }
    }
  }, [registros]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.descripcion_trabajo.trim()) {
      toast.error('Por favor describe el trabajo realizado');
      return;
    }

    setSubmitting(true);

    // Get current location for check-out
    let lat, lon, accuracy;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      accuracy = position.coords.accuracy;
    } catch (e) {
      console.log('Could not get location for check-out');
    }

    const reportData = {
      orden_trabajo_id: ordenId,
      numero_orden: orden.numero_orden,
      presentado_por_id: userProfile.id,
      presentado_por_nombre: userProfile.nombre_completo,
      ...formData,
      estado_reporte: 'Enviado'
    };

    const checkOutData = {
      usuario_id: userProfile.id,
      usuario_nombre: userProfile.nombre_completo,
      orden_trabajo_id: ordenId,
      numero_orden: orden.numero_orden,
      tipo_registro: 'Fin',
      latitud: lat || 0,
      longitud: lon || 0,
      precision_gps: accuracy || 0
    };

    // Check if offline
    if (!navigator.onLine) {
      try {
        savePendingReport({
          reportData,
          checkOutData,
          ordenId,
          updateOrderStatus: true,
          newStatus: 'Completada'
        });
        toast.success('Sin conexión - reporte guardado localmente', {
          description: 'Se sincronizará cuando vuelvas a conectarte'
        });
        // Navigate back to dashboard
        window.location.href = createPageUrl('DashboardTecnico');
      } catch (error) {
        toast.error('Error al guardar reporte offline');
        setSubmitting(false);
      }
      return;
    }

    try {
      // Create work report
      await entities.reportes_trabajo.create(reportData);

      // Create check-out registro
      await entities.registros_entrada.create(checkOutData);

      // Update order status
      await entities.ordenes_trabajo.update(ordenId, {
        estado: 'Completada'
      });

      toast.success('✓ Reporte enviado exitosamente');

      // Navigate back to dashboard
      window.location.href = createPageUrl('DashboardTecnico');
    } catch (error) {
      toast.error('Error al enviar el reporte');
      setSubmitting(false);
    }
  };

  if (isLoading || !orden) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl(`DetalleOrden?id=${ordenId}`)}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Completar Reporte</h1>
          <p className="text-sm text-gray-500">{orden.numero_orden}</p>
        </div>
      </div>

      {/* Time Indicator */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tiempo en sitio</p>
              <p className="text-xl font-bold text-blue-800">
                {Math.floor(formData.tiempo_gastado_minutos / 60)}h {formData.tiempo_gastado_minutos % 60}m
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Summary */}
      {fotos.length > 0 && (
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Image className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fotos capturadas</p>
                <p className="text-lg font-bold text-gray-900">{fotos.length} fotos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Detalles del Trabajo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-700">Descripción del trabajo realizado *</Label>
              <Textarea
                placeholder="Describe el trabajo realizado en detalle..."
                value={formData.descripcion_trabajo}
                onChange={(e) => setFormData({...formData, descripcion_trabajo: e.target.value})}
                className="mt-1.5 min-h-[120px]"
                required
              />
            </div>

            <div>
              <Label className="text-gray-700">Partes/Materiales utilizados</Label>
              <Textarea
                placeholder="Ej: Filtro x2, Válvula x1, Cable 10m..."
                value={formData.partes_usadas}
                onChange={(e) => setFormData({...formData, partes_usadas: e.target.value})}
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-gray-700">Tiempo total (minutos)</Label>
              <Input
                type="number"
                value={formData.tiempo_gastado_minutos}
                onChange={(e) => setFormData({...formData, tiempo_gastado_minutos: parseInt(e.target.value) || 0})}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-700">Problemas encontrados</Label>
              <Textarea
                placeholder="Describe cualquier problema encontrado..."
                value={formData.problemas_encontrados}
                onChange={(e) => setFormData({...formData, problemas_encontrados: e.target.value})}
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-gray-700">Recomendaciones</Label>
              <Textarea
                placeholder="Recomendaciones para el cliente o futuras visitas..."
                value={formData.recomendaciones}
                onChange={(e) => setFormData({...formData, recomendaciones: e.target.value})}
                className="mt-1.5 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <Button 
            type="submit"
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-semibold"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            {submitting ? 'Enviando...' : 'COMPLETAR Y ENVIAR'}
          </Button>
        </div>
      </form>
    </div>
  );
}
import React, { useState } from 'react';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import StatCard from '@/components/common/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { 
  Users, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Plus, 
  RefreshCw,
  MapPin,
  Phone,
  ChevronRight
} from 'lucide-react';
import { format, isToday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardGerente() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: ordenes = [], isLoading: loadingOrdenes, refetch } = useQuery({
    queryKey: ['ordenes-all'],
    queryFn: () => entities.ordenes_trabajo.list('-created_at', 100),
    refetchInterval: autoRefresh ? 30000 : false
  });

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => entities.usuarios.filter({ rol: 'tecnico', activo: true })
  });

  const { data: reportes = [] } = useQuery({
    queryKey: ['reportes-recientes'],
    queryFn: () => entities.reportes_trabajo.list('-created_at', 50)
  });

  // Calculate stats
  const tecnicosEnCampo = ordenes.filter(o => o.estado === 'En Progreso').length;
  const ordenesActivas = ordenes.filter(o => o.estado === 'Asignada' || o.estado === 'En Progreso').length;
  const completadasHoy = ordenes.filter(o => 
    o.estado === 'Completada' && isToday(new Date(o.updated_date))
  ).length;
  
  const tiemposCompletados = reportes.filter(r => r.tiempo_gastado_minutos > 0);
  const promedioTiempo = tiemposCompletados.length > 0 
    ? Math.round(tiemposCompletados.reduce((acc, r) => acc + r.tiempo_gastado_minutos, 0) / tiemposCompletados.length)
    : 0;

  // Recent orders
  const recentOrders = ordenes.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de operaciones SIMAIN</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm text-gray-600">
              Auto-refresh
            </Label>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link to={createPageUrl('CrearOrden')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Técnicos en Campo"
          value={tecnicosEnCampo}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Órdenes Activas"
          value={ordenesActivas}
          icon={ClipboardList}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Completadas Hoy"
          value={completadasHoy}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Tiempo Promedio"
          value={promedioTiempo > 0 ? `${Math.floor(promedioTiempo / 60)}h ${promedioTiempo % 60}m` : '--'}
          icon={Clock}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Work - Large Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Map Link */}
          <Link to={createPageUrl('MapaTecnicos')}>
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors cursor-pointer">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Mapa en Vivo</h3>
                      <p className="text-blue-100 text-sm">
                        {tecnicosEnCampo} técnicos activos ahora
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Recent Orders Table */}
          <Card className="bg-white">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Órdenes Recientes</CardTitle>
                <Link to={createPageUrl('OrdenesTrabajoList')}>
                  <Button variant="ghost" size="sm">
                    Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrdenes ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : (
                <div className="divide-y">
                  {recentOrders.map((orden) => (
                    <Link 
                      key={orden.id}
                      to={createPageUrl(`DetalleOrden?id=${orden.id}`)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-blue-600">{orden.numero_orden}</span>
                          <StatusBadge status={orden.estado} />
                        </div>
                        <p className="font-medium text-gray-900 truncate">{orden.cliente_nombre}</p>
                        <p className="text-sm text-gray-500 truncate">{orden.direccion}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">
                          {orden.asignado_nombre || 'Sin asignar'}
                        </p>
                        {orden.fecha_programada && (
                          <p className="text-xs text-gray-400">
                            {format(new Date(orden.fecha_programada), "d MMM", { locale: es })}
                            {orden.hora_programada && ` ${orden.hora_programada}`}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Technicians Summary */}
          <Card className="bg-white">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Técnicos</CardTitle>
                <Link to={createPageUrl('GestionTecnicos')}>
                  <Button variant="ghost" size="sm">
                    Ver todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {tecnicos.slice(0, 5).map((tecnico) => {
                  const ordenActiva = ordenes.find(
                    o => o.asignado_a === tecnico.id && o.estado === 'En Progreso'
                  );
                  
                  return (
                    <div key={tecnico.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {tecnico.foto_perfil ? (
                          <img 
                            src={tecnico.foto_perfil} 
                            alt={tecnico.nombre_completo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-medium text-gray-600">
                            {tecnico.nombre_completo?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {tecnico.nombre_completo}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {ordenActiva ? (
                            <span className="text-green-600">En campo - {ordenActiva.numero_orden}</span>
                          ) : (
                            'Disponible'
                          )}
                        </p>
                      </div>
                      {ordenActiva && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Activo
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Priority Orders */}
          <Card className="bg-white">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-red-600">
                ⚡ Órdenes Urgentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {ordenes.filter(o => o.prioridad === 'Urgente' && o.estado !== 'Completada' && o.estado !== 'Cancelada').length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay órdenes urgentes pendientes
                </p>
              ) : (
                <div className="space-y-3">
                  {ordenes
                    .filter(o => o.prioridad === 'Urgente' && o.estado !== 'Completada' && o.estado !== 'Cancelada')
                    .slice(0, 3)
                    .map((orden) => (
                      <Link 
                        key={orden.id}
                        to={createPageUrl(`DetalleOrden?id=${orden.id}`)}
                        className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{orden.numero_orden}</p>
                        <p className="text-sm text-gray-600 truncate">{orden.cliente_nombre}</p>
                        <StatusBadge status={orden.estado} className="mt-2" />
                      </Link>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
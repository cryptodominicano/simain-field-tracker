import React, { useState } from 'react';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportesAnalisis() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: ordenes = [], isLoading: loadingOrdenes } = useQuery({
    queryKey: ['ordenes-reportes'],
    queryFn: () => entities.ordenes_trabajo.list('-created_date', 500)
  });

  const { data: reportes = [], isLoading: loadingReportes } = useQuery({
    queryKey: ['reportes-all'],
    queryFn: () => entities.reportes_trabajo.list('-created_date', 500)
  });

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => entities.usuarios.filter({ rol: 'tecnico' })
  });

  // Filter data by date range
  const filteredOrdenes = ordenes.filter(o => {
    if (!o.created_date) return false;
    const orderDate = new Date(o.created_date);
    return isWithinInterval(orderDate, {
      start: startOfDay(parseISO(dateRange.start)),
      end: endOfDay(parseISO(dateRange.end))
    });
  });

  // Chart data: Orders by status
  const statusData = ['Pendiente', 'Asignada', 'En Progreso', 'Completada', 'Cancelada'].map(estado => ({
    name: estado,
    value: filteredOrdenes.filter(o => o.estado === estado).length
  })).filter(d => d.value > 0);

  // Chart data: Orders by technician
  const tecnicoData = tecnicos.map(t => ({
    name: t.nombre_completo?.split(' ')[0] || 'N/A',
    ordenes: filteredOrdenes.filter(o => o.asignado_a === t.id).length,
    completadas: filteredOrdenes.filter(o => o.asignado_a === t.id && o.estado === 'Completada').length
  })).sort((a, b) => b.ordenes - a.ordenes).slice(0, 10);

  // Chart data: Average time by service type
  const tipoServicioData = ['Instalación', 'Mantenimiento', 'Calibración', 'Reparación', 'Inspección'].map(tipo => {
    const tipoReportes = reportes.filter(r => {
      const orden = ordenes.find(o => o.id === r.orden_trabajo_id);
      return orden?.tipo_servicio === tipo && r.tiempo_gastado_minutos > 0;
    });
    const avgTime = tipoReportes.length > 0 
      ? tipoReportes.reduce((acc, r) => acc + r.tiempo_gastado_minutos, 0) / tipoReportes.length
      : 0;
    return {
      name: tipo,
      tiempo: Math.round(avgTime)
    };
  }).filter(d => d.tiempo > 0);

  // Chart data: Orders by day
  const dailyData = [];
  let currentDate = parseISO(dateRange.start);
  const endDate = parseISO(dateRange.end);
  
  while (currentDate <= endDate) {
    const dayStr = format(currentDate, 'yyyy-MM-dd');
    const dayOrdenes = filteredOrdenes.filter(o => 
      o.created_date && format(new Date(o.created_date), 'yyyy-MM-dd') === dayStr
    );
    dailyData.push({
      date: format(currentDate, 'd MMM', { locale: es }),
      ordenes: dayOrdenes.length,
      completadas: dayOrdenes.filter(o => o.estado === 'Completada').length
    });
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Export reports to CSV
  const exportToCSV = () => {
    const filteredReportes = reportes.filter(r => {
      if (!r.created_date) return false;
      const reportDate = new Date(r.created_date);
      return isWithinInterval(reportDate, {
        start: startOfDay(parseISO(dateRange.start)),
        end: endOfDay(parseISO(dateRange.end))
      });
    });

    const headers = ['Número Orden', 'Técnico', 'Cliente', 'Fecha', 'Tiempo (min)', 'Estado'];
    const rows = filteredReportes.map(r => {
      const orden = ordenes.find(o => o.id === r.orden_trabajo_id);
      return [
        r.numero_orden || orden?.numero_orden || '',
        r.presentado_por_nombre || '',
        orden?.cliente_nombre || '',
        r.created_date ? format(new Date(r.created_date), 'dd/MM/yyyy') : '',
        r.tiempo_gastado_minutos || 0,
        r.estado_reporte || ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
  };

  const isLoading = loadingOrdenes || loadingReportes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-500 mt-1">Métricas de operaciones SIMAIN</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label className="text-sm text-gray-500">Fecha Inicio</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-500">Fecha Fin</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDateRange({
                  start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
                  end: format(new Date(), 'yyyy-MM-dd')
                })}
              >
                7 días
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDateRange({
                  start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                  end: format(new Date(), 'yyyy-MM-dd')
                })}
              >
                30 días
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDateRange({
                  start: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
                  end: format(new Date(), 'yyyy-MM-dd')
                })}
              >
                90 días
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Órdenes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{filteredOrdenes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completadas</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {filteredOrdenes.filter(o => o.estado === 'Completada').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Tasa de Completación</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {filteredOrdenes.length > 0 
                ? Math.round((filteredOrdenes.filter(o => o.estado === 'Completada').length / filteredOrdenes.length) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Reportes Generados</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{reportes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Órdenes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Technician */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Órdenes por Técnico</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tecnicoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ordenes" name="Asignadas" fill="#3b82f6" />
                  <Bar dataKey="completadas" name="Completadas" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Time by Service Type */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tiempo Promedio por Tipo de Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tipoServicioData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit=" min" />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <Tooltip formatter={(value) => `${value} minutos`} />
                  <Bar dataKey="tiempo" name="Tiempo Promedio" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Órdenes por Día</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ordenes" name="Creadas" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="completadas" name="Completadas" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
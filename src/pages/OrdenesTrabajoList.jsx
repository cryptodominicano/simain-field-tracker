import React, { useState } from 'react';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronRight,
  MapPin,
  User,
  Calendar,
  Phone,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function OrdenesTrabajoList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterTecnico, setFilterTecnico] = useState('all');
  const [filterFecha, setFilterFecha] = useState('');

  const { data: ordenes = [], isLoading } = useQuery({
    queryKey: ['ordenes-all'],
    queryFn: () => entities.ordenes_trabajo.list('-created_date', 200)
  });

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => entities.usuarios.filter({ rol: 'tecnico' })
  });

  // Filter orders
  const filteredOrders = ordenes.filter(orden => {
    const matchesSearch = !searchTerm || 
      orden.numero_orden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'all' || orden.estado === filterEstado;
    const matchesTecnico = filterTecnico === 'all' || orden.asignado_a === filterTecnico;
    const matchesFecha = !filterFecha || orden.fecha_programada === filterFecha;

    return matchesSearch && matchesEstado && matchesTecnico && matchesFecha;
  });

  const exportToCSV = () => {
    const headers = ['Número', 'Cliente', 'Dirección', 'Tipo', 'Estado', 'Técnico', 'Fecha', 'Prioridad'];
    const rows = filteredOrders.map(o => [
      o.numero_orden,
      o.cliente_nombre,
      o.direccion,
      o.tipo_servicio,
      o.estado,
      o.asignado_nombre || 'Sin asignar',
      o.fecha_programada || '',
      o.prioridad
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ordenes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p className="text-gray-500 mt-1">{filteredOrders.length} órdenes encontradas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Link to={createPageUrl('CrearOrden')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Asignada">Asignada</SelectItem>
                <SelectItem value="En Progreso">En Progreso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTecnico} onValueChange={setFilterTecnico}>
              <SelectTrigger>
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los técnicos</SelectItem>
                {tecnicos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nombre_completo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              placeholder="Fecha"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No se encontraron órdenes</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredOrders.map((orden) => (
                <Link 
                  key={orden.id}
                  to={createPageUrl(`DetalleOrden?id=${orden.id}`)}
                  className="flex items-start p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-blue-600">{orden.numero_orden}</span>
                      <StatusBadge status={orden.estado} />
                      <PriorityBadge priority={orden.prioridad} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{orden.cliente_nombre}</h3>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{orden.direccion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{orden.asignado_nombre || 'Sin asignar'}</span>
                      </div>
                      {orden.fecha_programada && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(new Date(orden.fecha_programada), "d 'de' MMM", { locale: es })}
                            {orden.hora_programada && ` a las ${orden.hora_programada}`}
                          </span>
                        </div>
                      )}
                      {orden.cliente_telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{orden.cliente_telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import OrderCard from '@/components/orders/OrderCard';
import StatCard from '@/components/common/StatCard';
import { format, isToday } from 'date-fns';

export default function DashboardTecnico() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: ordenes = [], isLoading: loadingOrdenes } = useQuery({
    queryKey: ['ordenes-tecnico', userProfile?.id],
    queryFn: () => entities.ordenes_trabajo.filter({
      asignado_a: userProfile?.id
    }),
    enabled: !!userProfile?.id
  });

  const { data: registros = [] } = useQuery({
    queryKey: ['registros-hoy', userProfile?.id],
    queryFn: () => entities.registros_entrada.filter({
      usuario_id: userProfile?.id
    }),
    enabled: !!userProfile?.id
  });

  // Calculate stats
  const ordenesHoy = ordenes.filter(o =>
    o.fecha_programada && isToday(new Date(o.fecha_programada))
  );

  const ordenesPendientes = ordenes.filter(o =>
    o.estado === 'Asignada' || o.estado === 'En Progreso'
  );

  const ordenesEnProgreso = ordenes.filter(o => o.estado === 'En Progreso');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Calculate hours worked today
  const registrosHoy = registros.filter(r => isToday(new Date(r.created_date)));
  let horasTrabajadas = 0;
  
  const inicios = registrosHoy.filter(r => r.tipo_registro === 'Inicio');
  const fines = registrosHoy.filter(r => r.tipo_registro === 'Fin');
  
  inicios.forEach((inicio, idx) => {
    const fin = fines[idx];
    if (fin) {
      const diff = new Date(fin.created_date) - new Date(inicio.created_date);
      horasTrabajadas += diff / (1000 * 60 * 60);
    } else if (ordenesEnProgreso.length > 0) {
      // Still working
      const diff = new Date() - new Date(inicio.created_date);
      horasTrabajadas += diff / (1000 * 60 * 60);
    }
  });

  if (!userProfile) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Button 
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Órdenes Hoy"
          value={ordenesHoy.length}
          icon={ClipboardList}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Horas Trabajadas"
          value={horasTrabajadas.toFixed(1) + 'h'}
          icon={Clock}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Pendientes"
          value={ordenesPendientes.length}
          icon={AlertCircle}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="En Progreso"
          value={ordenesEnProgreso.length}
          icon={CheckCircle}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Orders Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Órdenes de Trabajo</h2>
        
        {loadingOrdenes ? (
          <div className="space-y-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : ordenesPendientes.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No tienes órdenes pendientes</p>
              <p className="text-sm text-gray-400 mt-1">¡Buen trabajo!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ordenesPendientes.map(orden => (
              <OrderCard key={orden.id} order={orden} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Today */}
      {ordenes.filter(o => o.estado === 'Completada' && isToday(new Date(o.updated_date))).length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Completadas Hoy</h2>
          <div className="space-y-3">
            {ordenes
              .filter(o => o.estado === 'Completada' && isToday(new Date(o.updated_date)))
              .map(orden => (
                <OrderCard key={orden.id} order={orden} />
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
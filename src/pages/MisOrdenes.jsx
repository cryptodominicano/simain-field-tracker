import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, ClipboardList } from 'lucide-react';
import OrderCard from '@/components/orders/OrderCard';

export default function MisOrdenes() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pendientes');

  const { data: ordenes = [], isLoading } = useQuery({
    queryKey: ['ordenes-tecnico-all', userProfile?.id],
    queryFn: () => entities.ordenes_trabajo.filter({
      asignado_a: userProfile?.id
    }),
    enabled: !!userProfile?.id
  });

  const filterOrders = (orders) => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.numero_orden?.toLowerCase().includes(term) ||
      o.cliente_nombre?.toLowerCase().includes(term) ||
      o.direccion?.toLowerCase().includes(term)
    );
  };

  const pendientes = filterOrders(ordenes.filter(o => 
    o.estado === 'Asignada' || o.estado === 'En Progreso'
  ));
  
  const completadas = filterOrders(ordenes.filter(o => o.estado === 'Completada'));
  const todas = filterOrders(ordenes);

  const OrderList = ({ orders }) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="py-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay órdenes en esta categoría</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {orders.map(orden => (
          <OrderCard key={orden.id} order={orden} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Mis Órdenes</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por número, cliente o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 bg-gray-100">
          <TabsTrigger value="pendientes" className="text-sm">
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="completadas" className="text-sm">
            Completadas ({completadas.length})
          </TabsTrigger>
          <TabsTrigger value="todas" className="text-sm">
            Todas ({todas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-4">
          <OrderList orders={pendientes} />
        </TabsContent>

        <TabsContent value="completadas" className="mt-4">
          <OrderList orders={completadas} />
        </TabsContent>

        <TabsContent value="todas" className="mt-4">
          <OrderList orders={todas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
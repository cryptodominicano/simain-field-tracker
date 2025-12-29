import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { MapPin, Clock, User, ChevronRight, Phone, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function OrderCard({ order, showTechnician = false }) {
  return (
    <Link to={createPageUrl(`DetalleOrden?id=${order.id}`)}>
      <Card className="hover:shadow-md transition-shadow bg-white border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-blue-600">{order.numero_orden}</p>
              <h3 className="font-semibold text-gray-900 mt-1">{order.cliente_nombre}</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{order.direccion}</span>
            </div>
            
            {order.fecha_programada && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {format(new Date(order.fecha_programada), "d 'de' MMMM", { locale: es })}
                  {order.hora_programada && ` • ${order.hora_programada}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wrench className="h-4 w-4 text-gray-400" />
              <span>{order.tipo_servicio}</span>
            </div>

            {showTechnician && order.asignado_nombre && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 text-gray-400" />
                <span>{order.asignado_nombre}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={order.estado} />
            <PriorityBadge priority={order.prioridad} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
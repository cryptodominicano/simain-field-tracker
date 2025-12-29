import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  const statusStyles = {
    'Pendiente': 'bg-gray-100 text-gray-700 border-gray-200',
    'Asignada': 'bg-blue-100 text-blue-700 border-blue-200',
    'En Progreso': 'bg-amber-100 text-amber-700 border-amber-200',
    'Completada': 'bg-green-100 text-green-700 border-green-200',
    'Cancelada': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium",
        statusStyles[status] || 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }) {
  const priorityStyles = {
    'Baja': 'bg-green-100 text-green-700 border-green-200',
    'Media': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Alta': 'bg-orange-100 text-orange-700 border-orange-200',
    'Urgente': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium",
        priorityStyles[priority] || 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {priority}
    </Badge>
  );
}

export function CertificationBadge({ status, className }) {
  const styles = {
    'Activa': 'bg-green-100 text-green-700 border-green-200',
    'Por Vencer': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Vencida': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium",
        styles[status] || 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {status}
    </Badge>
  );
}
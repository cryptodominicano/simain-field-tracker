import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ClipboardList,
  Award,
  AlertCircle,
  Settings
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Notificaciones() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones', userProfile?.id],
    queryFn: () => entities.notificaciones.filter({
      usuario_id: userProfile?.id
    }),
    enabled: !!userProfile?.id
  });

  const markAsRead = async (notif) => {
    if (!notif.leida) {
      await entities.notificaciones.update(notif.id, { leida: true });
      queryClient.invalidateQueries(['notificaciones', userProfile?.id]);
    }
  };

  const markAllAsRead = async () => {
    const unread = notificaciones.filter(n => !n.leido);
    await Promise.all(unread.map(n => 
      entities.notificaciones.update(n.id, { leido: true })
    ));
    queryClient.invalidateQueries(['notificaciones', userProfile?.id]);
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'Orden de Trabajo':
        return <ClipboardList className="h-5 w-5 text-blue-600" />;
      case 'Certificación':
        return <Award className="h-5 w-5 text-amber-600" />;
      case 'Alerta':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLink = (notif) => {
    if (notif.tipo === 'Orden de Trabajo' && notif.relacionado_id) {
      return createPageUrl(`DetalleOrden?id=${notif.relacionado_id}`);
    }
    return null;
  };

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('DashboardTecnico')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} sin leer</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todo
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : notificaciones.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((notif) => {
            const link = getLink(notif);
            const content = (
              <Card 
                className={`bg-white transition-colors ${!notif.leido ? 'border-l-4 border-l-blue-600' : ''}`}
                onClick={() => markAsRead(notif)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${!notif.leido ? 'bg-blue-50' : 'bg-gray-100'}`}>
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notif.leido ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notif.titulo}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notif.created_date), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{notif.mensaje}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notif.tipo}
                        </Badge>
                        {!notif.leido && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            Nueva
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            if (link) {
              return (
                <Link key={notif.id} to={link} onClick={() => markAsRead(notif)}>
                  {content}
                </Link>
              );
            }

            return <div key={notif.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
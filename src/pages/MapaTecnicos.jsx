import React, { useState, useEffect } from 'react';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ArrowLeft, RefreshCw, MapPin, User, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = createIcon('blue');
const greenIcon = createIcon('green');
const orangeIcon = createIcon('orange');
const greyIcon = createIcon('grey');
const redIcon = createIcon('red');

function MapBounds({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  
  return null;
}

export default function MapaTecnicos() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: ordenes = [], isLoading: loadingOrdenes, refetch } = useQuery({
    queryKey: ['ordenes-mapa'],
    queryFn: () => entities.ordenes_trabajo.filter({
      estado: ['Asignada', 'En Progreso', 'Completada']
    }),
    refetchInterval: autoRefresh ? 30000 : false
  });

  const { data: registros = [] } = useQuery({
    queryKey: ['registros-recientes'],
    queryFn: () => entities.registros_entrada.list('-created_date', 100),
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Get unique technician positions (last known location)
  const tecnicoPositions = {};
  registros.forEach(r => {
    if (!tecnicoPositions[r.usuario_id] || new Date(r.created_date) > new Date(tecnicoPositions[r.usuario_id].created_date)) {
      tecnicoPositions[r.usuario_id] = r;
    }
  });

  // Filter orders with valid coordinates
  const mappedOrders = ordenes.filter(o => o.latitud && o.longitud);
  
  // Collect all positions for bounds
  const allPositions = [
    ...mappedOrders.map(o => [o.latitud, o.longitud]),
    ...Object.values(tecnicoPositions).filter(r => r.latitud && r.longitud).map(r => [r.latitud, r.longitud])
  ];

  const getOrderIcon = (estado) => {
    switch (estado) {
      case 'En Progreso': return greenIcon;
      case 'Asignada': return blueIcon;
      case 'Completada': return greyIcon;
      default: return orangeIcon;
    }
  };

  // Default center (Dominican Republic)
  const defaultCenter = [18.7357, -70.1627];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('DashboardGerente')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mapa en Vivo</h1>
            <p className="text-gray-500 mt-1">Ubicación de técnicos y órdenes activas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-refresh-map"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh-map" className="text-sm text-gray-600">
              Auto-refresh (30s)
            </Label>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-white">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Orden Asignada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">En Progreso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Técnico (última ubicación)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[600px]">
            {loadingOrdenes ? (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <MapContainer 
                center={allPositions.length > 0 ? allPositions[0] : defaultCenter} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {allPositions.length > 0 && <MapBounds positions={allPositions} />}
                
                {/* Order markers */}
                {mappedOrders.map((orden) => (
                  <Marker 
                    key={orden.id}
                    position={[orden.latitud, orden.longitud]}
                    icon={getOrderIcon(orden.estado)}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-blue-600">{orden.numero_orden}</span>
                          <StatusBadge status={orden.estado} />
                        </div>
                        <p className="font-medium">{orden.cliente_nombre}</p>
                        <p className="text-sm text-gray-500 mt-1">{orden.direccion}</p>
                        {orden.asignado_nombre && (
                          <p className="text-sm text-gray-600 mt-2">
                            <User className="inline h-3 w-3 mr-1" />
                            {orden.asignado_nombre}
                          </p>
                        )}
                        <Link to={createPageUrl(`DetalleOrden?id=${orden.id}`)}>
                          <Button size="sm" className="mt-3 w-full">Ver Detalle</Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Technician markers */}
                {Object.values(tecnicoPositions).filter(r => r.latitud && r.longitud).map((registro) => (
                  <Marker 
                    key={`tech-${registro.usuario_id}`}
                    position={[registro.latitud, registro.longitud]}
                    icon={redIcon}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-medium">{registro.usuario_nombre}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Última ubicación: {format(new Date(registro.created_date), "HH:mm", { locale: es })}
                        </p>
                        {registro.numero_orden && (
                          <p className="text-sm text-blue-600 mt-1">
                            Trabajando en: {registro.numero_orden}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Orders List */}
      <Card className="bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">Órdenes Activas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y max-h-[300px] overflow-y-auto">
            {ordenes.filter(o => o.estado === 'En Progreso').map((orden) => (
              <Link 
                key={orden.id}
                to={createPageUrl(`DetalleOrden?id=${orden.id}`)}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-blue-600">{orden.numero_orden}</span>
                    <StatusBadge status={orden.estado} />
                  </div>
                  <p className="font-medium text-gray-900">{orden.cliente_nombre}</p>
                  <p className="text-sm text-gray-500">{orden.asignado_nombre}</p>
                </div>
                <MapPin className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
            {ordenes.filter(o => o.estado === 'En Progreso').length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No hay órdenes en progreso actualmente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
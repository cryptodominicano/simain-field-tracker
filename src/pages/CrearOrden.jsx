import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, MapPin, User, Calendar, Wrench } from 'lucide-react';

export default function CrearOrden() {
  const { userProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    direccion: '',
    latitud: null,
    longitud: null,
    tipo_servicio: '',
    descripcion: '',
    prioridad: 'Media',
    asignado_a: '',
    asignado_nombre: '',
    fecha_programada: '',
    hora_programada: '',
    equipos_involucrados: '',
    notas_internas: ''
  });

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos-activos'],
    queryFn: () => entities.usuarios.filter({ rol: 'tecnico', activo: true })
  });

  const generateOrderNumber = () => {
    return `OT-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleTecnicoChange = (tecnicoId) => {
    const tecnico = tecnicos.find(t => t.id === tecnicoId);
    setFormData({
      ...formData,
      asignado_a: tecnicoId,
      asignado_nombre: tecnico?.nombre_completo || ''
    });
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitud: position.coords.latitude,
            longitud: position.coords.longitude
          });
          toast.success('Ubicación capturada');
        },
        (error) => {
          toast.error('No se pudo obtener la ubicación');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cliente_nombre || !formData.direccion || !formData.tipo_servicio) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }

    setSaving(true);

    try {
      const numeroOrden = generateOrderNumber();
      
      const ordenData = {
        ...formData,
        numero_orden: numeroOrden,
        estado: formData.asignado_a ? 'Asignada' : 'Pendiente',
        creado_por: userProfile?.id
      };

      const orden = await entities.ordenes_trabajo.create(ordenData);

      // Create notification for assigned technician
      if (formData.asignado_a) {
        await entities.notificaciones.create({
          usuario_id: formData.asignado_a,
          titulo: 'Nueva Orden de Trabajo Asignada',
          mensaje: `Se te ha asignado la orden ${numeroOrden} para ${formData.cliente_nombre} en ${formData.direccion}`,
          tipo: 'Orden de Trabajo',
          relacionado_id: orden.id
        });
      }

      toast.success('✓ Orden creada exitosamente');
      window.location.href = createPageUrl(`DetalleOrden?id=${orden.id}`);
    } catch (error) {
      toast.error('Error al crear la orden');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('DashboardGerente')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
          <p className="text-gray-500">Complete los detalles para crear una nueva orden</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre del Cliente *</Label>
              <Input
                value={formData.cliente_nombre}
                onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                placeholder="Empresa o persona"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={formData.cliente_telefono}
                onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                placeholder="809-555-1234"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dirección *</Label>
              <Textarea
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                placeholder="Dirección completa del sitio de trabajo"
                className="mt-1"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                type="button"
                variant="outline"
                onClick={getLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Capturar Ubicación GPS
              </Button>
              {formData.latitud && (
                <span className="text-sm text-green-600">
                  ✓ Ubicación capturada
                </span>
              )}
            </div>
            {formData.latitud && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitud</Label>
                  <Input value={formData.latitud} readOnly className="mt-1 bg-gray-50" />
                </div>
                <div>
                  <Label>Longitud</Label>
                  <Input value={formData.longitud} readOnly className="mt-1 bg-gray-50" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Detalles del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Servicio *</Label>
                <Select 
                  value={formData.tipo_servicio}
                  onValueChange={(v) => setFormData({...formData, tipo_servicio: v})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instalación">Instalación</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Calibración">Calibración</SelectItem>
                    <SelectItem value="Reparación">Reparación</SelectItem>
                    <SelectItem value="Inspección">Inspección</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridad</Label>
                <Select 
                  value={formData.prioridad}
                  onValueChange={(v) => setFormData({...formData, prioridad: v})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descripción del Trabajo</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe el trabajo a realizar..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label>Equipos Involucrados</Label>
              <Input
                value={formData.equipos_involucrados}
                onChange={(e) => setFormData({...formData, equipos_involucrados: e.target.value})}
                placeholder="Lista de equipos a trabajar"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Asignación y Programación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Asignar a Técnico</Label>
              <Select 
                value={formData.asignado_a}
                onValueChange={handleTecnicoChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Fecha Programada</Label>
                <Input
                  type="date"
                  value={formData.fecha_programada}
                  onChange={(e) => setFormData({...formData, fecha_programada: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hora Programada</Label>
                <Input
                  type="time"
                  value={formData.hora_programada}
                  onChange={(e) => setFormData({...formData, hora_programada: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Notas Internas</Label>
              <Textarea
                value={formData.notas_internas}
                onChange={(e) => setFormData({...formData, notas_internas: e.target.value})}
                placeholder="Notas para el equipo interno..."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Link to={createPageUrl('DashboardGerente')} className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Creando...' : 'Crear Orden'}
          </Button>
        </div>
      </form>
    </div>
  );
}
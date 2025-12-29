import React, { useState } from 'react';
import { entities } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CertificationBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  Download, 
  ExternalLink,
  Calendar,
  User,
  Award,
  Loader2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CertificacionesEquipo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterTecnico, setFilterTecnico] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    usuario_id: '',
    usuario_nombre: '',
    nombre_certificacion: '',
    tipo: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    numero_certificado: '',
    documento_url: ''
  });

  const queryClient = useQueryClient();

  const { data: certificaciones = [], isLoading } = useQuery({
    queryKey: ['certificaciones-all'],
    queryFn: () => entities.certificaciones.list('-fecha_vencimiento')
  });

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => entities.usuarios.filter({ rol: 'tecnico', activo: true })
  });

  // Calculate status based on expiration
  const getCertStatus = (cert) => {
    if (!cert.fecha_vencimiento) return 'Activa';
    const daysUntilExpiry = differenceInDays(new Date(cert.fecha_vencimiento), new Date());
    if (daysUntilExpiry < 0) return 'Vencida';
    if (daysUntilExpiry <= 30) return 'Por Vencer';
    return 'Activa';
  };

  // Filter certifications
  const filteredCerts = certificaciones.filter(cert => {
    const status = getCertStatus(cert);
    const matchesSearch = !searchTerm || 
      cert.nombre_certificacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.numero_certificado?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'all' || status === filterEstado;
    const matchesTipo = filterTipo === 'all' || cert.tipo === filterTipo;
    const matchesTecnico = filterTecnico === 'all' || cert.usuario_id === filterTecnico;

    return matchesSearch && matchesEstado && matchesTipo && matchesTecnico;
  });

  // Count by status
  const vencidas = certificaciones.filter(c => getCertStatus(c) === 'Vencida').length;
  const porVencer = certificaciones.filter(c => getCertStatus(c) === 'Por Vencer').length;
  const activas = certificaciones.filter(c => getCertStatus(c) === 'Activa').length;

  const handleTecnicoChange = (tecnicoId) => {
    const tecnico = tecnicos.find(t => t.id === tecnicoId);
    setFormData({
      ...formData,
      usuario_id: tecnicoId,
      usuario_nombre: tecnico?.nombre_completo || ''
    });
  };

  const handleSave = async () => {
    if (!formData.usuario_id || !formData.nombre_certificacion || !formData.fecha_vencimiento) {
      toast.error('Complete los campos requeridos');
      return;
    }

    setSaving(true);

    try {
      await entities.certificaciones.create({
        ...formData,
        estado: getCertStatus(formData)
      });
      toast.success('Certificación agregada');
      queryClient.invalidateQueries(['certificaciones-all']);
      setShowAddDialog(false);
      setFormData({
        usuario_id: '',
        usuario_nombre: '',
        nombre_certificacion: '',
        tipo: '',
        fecha_emision: '',
        fecha_vencimiento: '',
        numero_certificado: '',
        documento_url: ''
      });
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = () => {
    const headers = ['Técnico', 'Certificación', 'Tipo', 'Número', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado'];
    const rows = filteredCerts.map(c => [
      c.usuario_nombre,
      c.nombre_certificacion,
      c.tipo,
      c.numero_certificado || '',
      c.fecha_emision || '',
      c.fecha_vencimiento,
      getCertStatus(c)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificaciones_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificaciones del Equipo</h1>
          <p className="text-gray-500 mt-1">{certificaciones.length} certificaciones registradas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Certificación
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(vencidas > 0 || porVencer > 0) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Atención Requerida</p>
                <p className="text-sm text-amber-700 mt-1">
                  {vencidas > 0 && <span className="font-medium text-red-600">{vencidas} vencida(s)</span>}
                  {vencidas > 0 && porVencer > 0 && ' • '}
                  {porVencer > 0 && <span className="font-medium text-amber-600">{porVencer} por vencer (30 días)</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activas}</p>
              <p className="text-sm text-gray-500">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{porVencer}</p>
              <p className="text-sm text-gray-500">Por Vencer</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{vencidas}</p>
              <p className="text-sm text-gray-500">Vencidas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
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
                <SelectItem value="Activa">Activa</SelectItem>
                <SelectItem value="Por Vencer">Por Vencer</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="INDOCAL">INDOCAL</SelectItem>
                <SelectItem value="NFPA">NFPA</SelectItem>
                <SelectItem value="ISO 17020:2012">ISO 17020:2012</SelectItem>
                <SelectItem value="ODAC">ODAC</SelectItem>
                <SelectItem value="Otra">Otra</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Certifications List */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="py-12 text-center">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron certificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCerts.map((cert) => {
                const status = getCertStatus(cert);
                const daysUntilExpiry = cert.fecha_vencimiento 
                  ? differenceInDays(new Date(cert.fecha_vencimiento), new Date())
                  : null;

                return (
                  <div key={cert.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{cert.nombre_certificacion}</h3>
                          <CertificationBadge status={status} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{cert.usuario_nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-400" />
                            <span>{cert.tipo}</span>
                          </div>
                          {cert.numero_certificado && (
                            <div className="text-gray-500">
                              No. Certificado: {cert.numero_certificado}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              Vence: {format(new Date(cert.fecha_vencimiento), "d 'de' MMMM, yyyy", { locale: es })}
                              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                                <span className="text-gray-400 ml-1">({daysUntilExpiry} días)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {cert.documento_url && (
                        <a 
                          href={cert.documento_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <ExternalLink className="h-5 w-5 text-blue-600" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Certificación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Técnico *</Label>
              <Select value={formData.usuario_id} onValueChange={handleTecnicoChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nombre_completo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nombre de Certificación *</Label>
              <Input
                value={formData.nombre_certificacion}
                onChange={(e) => setFormData({...formData, nombre_certificacion: e.target.value})}
                placeholder="Ej: Certificación NFPA"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(v) => setFormData({...formData, tipo: v})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDOCAL">INDOCAL</SelectItem>
                  <SelectItem value="NFPA">NFPA</SelectItem>
                  <SelectItem value="ISO 17020:2012">ISO 17020:2012</SelectItem>
                  <SelectItem value="ODAC">ODAC</SelectItem>
                  <SelectItem value="Otra">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha Emisión</Label>
                <Input
                  type="date"
                  value={formData.fecha_emision}
                  onChange={(e) => setFormData({...formData, fecha_emision: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Fecha Vencimiento *</Label>
                <Input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Número de Certificado</Label>
              <Input
                value={formData.numero_certificado}
                onChange={(e) => setFormData({...formData, numero_certificado: e.target.value})}
                placeholder="Ej: CERT-2024-001"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
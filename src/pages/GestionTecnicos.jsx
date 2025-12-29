import React, { useState } from 'react';
import { entities } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Edit, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail,
  CreditCard,
  Loader2
} from 'lucide-react';

export default function GestionTecnicos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    cedula: '',
    rol: 'tecnico',
    activo: true
  });

  const queryClient = useQueryClient();

  const { data: tecnicos = [], isLoading } = useQuery({
    queryKey: ['tecnicos-all'],
    queryFn: () => entities.usuarios.filter({ rol: 'tecnico' })
  });

  const { data: ordenes = [] } = useQuery({
    queryKey: ['ordenes-stats'],
    queryFn: () => entities.ordenes_trabajo.list('-created_date', 500)
  });

  const filteredTecnicos = tecnicos.filter(t => 
    !searchTerm || 
    t.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cedula?.includes(searchTerm) ||
    t.telefono?.includes(searchTerm)
  );

  const getStats = (tecnicoId) => {
    const tecnicoOrdenes = ordenes.filter(o => o.asignado_a === tecnicoId);
    return {
      total: tecnicoOrdenes.length,
      completadas: tecnicoOrdenes.filter(o => o.estado === 'Completada').length,
      enProgreso: tecnicoOrdenes.filter(o => o.estado === 'En Progreso').length
    };
  };

  const handleSave = async () => {
    if (!formData.nombre_completo) {
      toast.error('El nombre es requerido');
      return;
    }

    setSaving(true);

    try {
      if (editingTecnico) {
        await entities.usuarios.update(editingTecnico.id, formData);
        toast.success('Técnico actualizado');
      } else {
        await entities.usuarios.create(formData);
        toast.success('Técnico creado');
      }
      
      queryClient.invalidateQueries(['tecnicos-all']);
      setShowAddDialog(false);
      setEditingTecnico(null);
      setFormData({
        nombre_completo: '',
        telefono: '',
        cedula: '',
        rol: 'tecnico',
        activo: true
      });
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (tecnico) => {
    try {
      await entities.usuarios.update(tecnico.id, { activo: !tecnico.activo });
      toast.success(tecnico.activo ? 'Técnico desactivado' : 'Técnico activado');
      queryClient.invalidateQueries(['tecnicos-all']);
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const openEdit = (tecnico) => {
    setEditingTecnico(tecnico);
    setFormData({
      nombre_completo: tecnico.nombre_completo || '',
      telefono: tecnico.telefono || '',
      cedula: tecnico.cedula || '',
      rol: tecnico.rol,
      activo: tecnico.activo
    });
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Técnicos</h1>
          <p className="text-gray-500 mt-1">{tecnicos.length} técnicos registrados</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingTecnico(null);
            setFormData({
              nombre_completo: '',
              telefono: '',
              cedula: '',
              rol: 'tecnico',
              activo: true
            });
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Técnico
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, cédula o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Technicians Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTecnicos.map((tecnico) => {
            const stats = getStats(tecnico.id);
            
            return (
              <Card key={tecnico.id} className={`bg-white ${!tecnico.activo ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {tecnico.foto_perfil ? (
                          <img 
                            src={tecnico.foto_perfil} 
                            alt={tecnico.nombre_completo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-blue-600">
                            {tecnico.nombre_completo?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tecnico.nombre_completo}</h3>
                        <Badge variant={tecnico.activo ? "default" : "secondary"} className="mt-1">
                          {tecnico.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {tecnico.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{tecnico.telefono}</span>
                      </div>
                    )}
                    {tecnico.cedula && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span>{tecnico.cedula}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{stats.completadas}</p>
                      <p className="text-xs text-gray-500">Completadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600">{stats.enProgreso}</p>
                      <p className="text-xs text-gray-500">En Progreso</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(tecnico)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleActivo(tecnico)}
                    >
                      {tecnico.activo ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTecnico ? 'Editar Técnico' : 'Agregar Técnico'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre Completo *</Label>
              <Input
                value={formData.nombre_completo}
                onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                placeholder="Nombre y apellido"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                placeholder="809-555-1234"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Cédula</Label>
              <Input
                value={formData.cedula}
                onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                placeholder="001-1234567-8"
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
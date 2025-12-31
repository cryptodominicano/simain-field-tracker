import React, { useState } from 'react';
import { entities, auth } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  Shield,
  User,
  Users,
  Mail,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

export default function GestionUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nombre_completo: '',
    telefono: '',
    cedula: '',
    rol: 'tecnico',
    activo: true
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  const queryClient = useQueryClient();

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios-all'],
    queryFn: () => entities.usuarios.list('-created_date')
  });

  const filteredUsers = usuarios.filter(u => {
    const matchesSearch = !searchTerm || 
      u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cedula?.includes(searchTerm) ||
      u.telefono?.includes(searchTerm);
    const matchesRol = filterRol === 'all' || u.rol === filterRol;
    return matchesSearch && matchesRol;
  });

  const handleSave = async () => {
    if (!formData.nombre_completo || !formData.rol) {
      toast.error('Complete los campos requeridos');
      return;
    }

    // For new users, email is required
    if (!editingUser && !formData.email) {
      toast.error('El correo electrónico es requerido para nuevos usuarios');
      return;
    }

    // Validate email format
    if (!editingUser && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Ingrese un correo electrónico válido');
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        // Update existing user (profile data only)
        const { email, ...updateData } = formData;
        await entities.usuarios.update(editingUser.id, updateData);
        toast.success('Usuario actualizado');
      } else {
        // Create new user with auth invite
        await auth.inviteUser({
          email: formData.email,
          nombre_completo: formData.nombre_completo,
          rol: formData.rol,
          telefono: formData.telefono,
          cedula: formData.cedula
        });
        toast.success('Usuario invitado exitosamente', {
          description: `Se envió un correo a ${formData.email} para establecer contraseña`
        });
      }

      queryClient.invalidateQueries(['usuarios-all']);
      setShowAddDialog(false);
      setEditingUser(null);
      setFormData({
        email: '',
        nombre_completo: '',
        telefono: '',
        cedula: '',
        rol: 'tecnico',
        activo: true
      });
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.message?.includes('already registered')) {
        toast.error('Este correo ya está registrado');
      } else {
        toast.error(error.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (usuario) => {
    try {
      await entities.usuarios.update(usuario.id, { activo: !usuario.activo });
      toast.success(usuario.activo ? 'Usuario desactivado' : 'Usuario activado');
      queryClient.invalidateQueries(['usuarios-all']);
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const deleteUser = async (usuario) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await entities.usuarios.delete(usuario.id);
      toast.success('Usuario eliminado');
      queryClient.invalidateQueries(['usuarios-all']);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const openEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      email: '', // Email can't be changed after creation
      nombre_completo: usuario.nombre_completo || '',
      telefono: usuario.telefono || '',
      cedula: usuario.cedula || '',
      rol: usuario.rol,
      activo: usuario.activo
    });
    setShowAddDialog(true);
  };

  const resendInvite = async (usuario) => {
    if (!usuario.created_by) {
      toast.error('Este usuario no tiene correo registrado');
      return;
    }

    setSendingInvite(true);
    try {
      await auth.resetPassword(usuario.created_by);
      toast.success('Invitación reenviada', {
        description: `Se envió un correo a ${usuario.created_by}`
      });
    } catch (error) {
      toast.error('Error al reenviar invitación');
    } finally {
      setSendingInvite(false);
    }
  };

  const getRolBadge = (rol) => {
    const styles = {
      administrador: 'bg-purple-100 text-purple-700 border-purple-200',
      gerente: 'bg-blue-100 text-blue-700 border-blue-200',
      tecnico: 'bg-green-100 text-green-700 border-green-200'
    };
    const labels = {
      administrador: 'Administrador',
      gerente: 'Gerente',
      tecnico: 'Técnico'
    };
    return (
      <Badge variant="outline" className={styles[rol]}>
        {labels[rol]}
      </Badge>
    );
  };

  const getRolIcon = (rol) => {
    switch (rol) {
      case 'administrador': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'gerente': return <Users className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-green-600" />;
    }
  };

  // Count by role
  const countByRol = {
    administrador: usuarios.filter(u => u.rol === 'administrador').length,
    gerente: usuarios.filter(u => u.rol === 'gerente').length,
    tecnico: usuarios.filter(u => u.rol === 'tecnico').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingUser(null);
            setFormData({
              email: '',
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
          Invitar Usuario
        </Button>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{countByRol.administrador}</p>
              <p className="text-sm text-gray-500">Administradores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{countByRol.gerente}</p>
              <p className="text-sm text-gray-500">Gerentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{countByRol.tecnico}</p>
              <p className="text-sm text-gray-500">Técnicos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, cédula o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((usuario) => (
                  <TableRow key={usuario.id} className={!usuario.activo ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {usuario.foto_perfil ? (
                            <img 
                              src={usuario.foto_perfil} 
                              alt={usuario.nombre_completo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-medium text-gray-600">
                              {usuario.nombre_completo?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{usuario.nombre_completo}</p>
                          <p className="text-sm text-gray-500">{usuario.created_by}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{usuario.telefono || '-'}</TableCell>
                    <TableCell>{usuario.cedula || '-'}</TableCell>
                    <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.activo ? "default" : "secondary"}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.created_date 
                        ? format(new Date(usuario.created_date), 'dd/MM/yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(usuario)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {usuario.created_by && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => resendInvite(usuario)}
                            disabled={sendingInvite}
                            title="Reenviar invitación"
                          >
                            <Mail className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActivo(usuario)}
                          title={usuario.activo ? 'Desactivar' : 'Activar'}
                        >
                          {usuario.activo ? (
                            <UserX className="h-4 w-4 text-amber-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(usuario)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Invitar Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingUser && (
              <div>
                <Label>Correo Electrónico *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="usuario@empresa.com"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Se enviará un correo para establecer contraseña
                </p>
              </div>
            )}
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
            <div>
              <Label>Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(v) => setFormData({...formData, rol: v})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingUser ? (
                  'Guardar'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Invitación
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
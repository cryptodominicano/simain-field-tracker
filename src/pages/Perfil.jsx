import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities, integrations } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Edit,
  LogOut,
  Award,
  ChevronRight,
  Loader2,
  Camera
} from 'lucide-react';

export default function Perfil() {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (userProfile) {
      setEditData(userProfile);
    }
  }, [userProfile]);

  const { data: certificaciones = [] } = useQuery({
    queryKey: ['mis-certificaciones', userProfile?.id],
    queryFn: () => entities.certificaciones.filter({ usuario_id: userProfile?.id }),
    enabled: !!userProfile?.id
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await entities.usuarios.update(userProfile.id, {
        nombre_completo: editData.nombre_completo,
        telefono: editData.telefono,
        cedula: editData.cedula
      });
      toast.success('Perfil actualizado');
      setShowEditDialog(false);
      refreshProfile();
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await integrations.Core.UploadFile({ file });
      await entities.usuarios.update(userProfile.id, { foto_perfil: file_url });
      toast.success('Foto actualizada');
      refreshProfile();
    } catch (error) {
      toast.error('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/login';
    }
  };

  const getRolLabel = (rol) => {
    const labels = {
      tecnico: 'Técnico',
      gerente: 'Gerente',
      administrador: 'Administrador'
    };
    return labels[rol] || rol;
  };

  const activeCerts = certificaciones.filter(c => c.estado === 'Activa').length;
  const expiringSoon = certificaciones.filter(c => c.estado === 'Por Vencer').length;

  if (!userProfile) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center py-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 mt-4" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
        <Button
          variant="outline"
          className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 mt-6"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 mr-2" />
          )}
          {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {userProfile.foto_perfil ? (
              <img 
                src={userProfile.foto_perfil} 
                alt={userProfile.nombre_completo}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-blue-600">
                {userProfile.nombre_completo?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />
            {uploadingPhoto ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-white" />
            )}
          </label>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{userProfile.nombre_completo}</h1>
        <Badge className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
          {getRolLabel(userProfile.rol)}
        </Badge>
      </div>

      {/* User Info */}
      <Card className="bg-white">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Información Personal</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mail className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Phone className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{userProfile.telefono || 'No especificado'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cédula</p>
              <p className="font-medium text-gray-900">{userProfile.cedula || 'No especificada'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications Summary */}
      {userProfile.rol === 'tecnico' && (
        <Link to={createPageUrl('MisCertificaciones')}>
          <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mis Certificaciones</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {activeCerts} Activas
                      </Badge>
                      {expiringSoon > 0 && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {expiringSoon} Por Vencer
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5 mr-2" />
        )}
        {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
      </Button>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={editData.nombre_completo || ''}
                onChange={(e) => setEditData({...editData, nombre_completo: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={editData.telefono || ''}
                onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                className="mt-1"
                placeholder="809-555-1234"
              />
            </div>
            <div>
              <Label>Cédula</Label>
              <Input
                value={editData.cedula || ''}
                onChange={(e) => setEditData({...editData, cedula: e.target.value})}
                className="mt-1"
                placeholder="001-1234567-8"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowEditDialog(false)}
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
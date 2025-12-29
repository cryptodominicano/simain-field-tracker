import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities, integrations } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import {
  MapPin,
  Clock,
  User,
  Phone,
  Play,
  Camera,
  CheckCircle,
  Map,
  ArrowLeft,
  Wrench,
  FileText,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Compress image for mobile upload
const compressImage = async (file, maxSizeMB = 1, maxWidthOrHeight = 1920) => {
  return new Promise((resolve) => {
    // If file is already small enough, return as-is
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if needed
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = (height / width) * maxWidthOrHeight;
            width = maxWidthOrHeight;
          } else {
            width = (width / height) * maxWidthOrHeight;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      img.onerror = () => resolve(file); // Fallback to original
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file); // Fallback to original
    reader.readAsDataURL(file);
  });
};

export default function DetalleOrden() {
  const urlParams = new URLSearchParams(window.location.search);
  const ordenId = urlParams.get('id');

  const { userProfile } = useAuth();
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showDistanceWarning, setShowDistanceWarning] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState(null);
  const [photoData, setPhotoData] = useState({ tipo_foto: 'Durante', descripcion: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // Debug status for mobile
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const queryClient = useQueryClient();

  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden', ordenId],
    queryFn: () => entities.ordenes_trabajo.filter({ id: ordenId }),
    select: (data) => data[0],
    enabled: !!ordenId
  });

  const { data: fotos = [] } = useQuery({
    queryKey: ['fotos-orden', ordenId],
    queryFn: () => entities.fotos.filter({ orden_trabajo_id: ordenId }),
    enabled: !!ordenId
  });

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleStartWork = async () => {
    setCheckingIn(true);
    
    try {
      // Get current GPS location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Calculate distance from work site
      let distancia = 0;
      if (orden.latitud && orden.longitud) {
        distancia = calculateDistance(latitude, longitude, orden.latitud, orden.longitud);
      }

      const checkInData = {
        latitud: latitude,
        longitud: longitude,
        precision_gps: accuracy,
        distancia_del_sitio: distancia
      };

      // If distance > 500m, show warning
      if (distancia > 500) {
        setPendingCheckIn(checkInData);
        setShowDistanceWarning(true);
        setCheckingIn(false);
        return;
      }

      // Proceed with check-in
      await performCheckIn(checkInData);
    } catch (error) {
      toast.error('Error al obtener ubicación GPS');
      setCheckingIn(false);
    }
  };

  const performCheckIn = async (checkInData) => {
    try {
      // Create registro entrada
      await entities.registros_entrada.create({
        usuario_id: userProfile.id,
        usuario_nombre: userProfile.nombre_completo,
        orden_trabajo_id: ordenId,
        numero_orden: orden.numero_orden,
        tipo_registro: 'Inicio',
        ...checkInData
      });

      // Update order status
      await entities.ordenes_trabajo.update(ordenId, {
        estado: 'En Progreso'
      });

      toast.success('¡Trabajo iniciado exitosamente!');
      queryClient.invalidateQueries(['orden', ordenId]);
      setShowDistanceWarning(false);
      setPendingCheckIn(null);
    } catch (error) {
      toast.error('Error al registrar inicio de trabajo');
    } finally {
      setCheckingIn(false);
    }
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log('[PHOTO] File selected:', { name: file.name, type: file.type, size: file.size });

    setUploadingPhoto(true);
    setUploadStatus(`1. Archivo: ${file.name} (${originalSizeMB}MB)`);

    try {
      // Validate file type on mobile (some browsers return empty type)
      let fileToUpload = file;
      if (!file.type || file.type === '') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'heic': 'image/heic',
          'heif': 'image/heif'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';
        fileToUpload = new File([file], file.name, { type: mimeType });
      }

      // Compress image if larger than 1MB
      if (fileToUpload.size > 1024 * 1024) {
        setUploadStatus(prev => prev + '\n2. Comprimiendo imagen...');
        fileToUpload = await compressImage(fileToUpload, 1, 1920);
        const compressedSizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(2);
        setUploadStatus(prev => prev.replace('Comprimiendo imagen...', `Comprimido: ${originalSizeMB}MB → ${compressedSizeMB}MB`));
      }

      // Get current location (non-blocking with strict timeout)
      setUploadStatus(prev => prev + '\n3. Obteniendo GPS...');
      let lat, lon;
      try {
        const position = await Promise.race([
          new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 3000,
              maximumAge: 60000
            });
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('GPS timeout')), 3000))
        ]);
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        setUploadStatus(prev => prev.replace('Obteniendo GPS...', `GPS OK`));
      } catch (locError) {
        setUploadStatus(prev => prev.replace('Obteniendo GPS...', 'GPS omitido'));
      }

      // Upload file with retry logic
      setUploadStatus(prev => prev + '\n4. Subiendo a Supabase...');
      let file_url = null;
      let uploadError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          if (attempt > 1) {
            setUploadStatus(prev => prev.replace(/Subiendo.*/, `Subiendo (intento ${attempt}/3)...`));
          }
          const result = await integrations.Core.UploadFile({ file: fileToUpload });
          file_url = result.file_url;
          break; // Success, exit retry loop
        } catch (err) {
          uploadError = err;
          if (attempt < 3) {
            // Wait before retry (1s, then 2s)
            await new Promise(r => setTimeout(r, attempt * 1000));
          }
        }
      }

      if (!file_url) {
        throw uploadError || new Error('Error al subir archivo después de 3 intentos');
      }

      setUploadStatus(prev => prev.replace(/Subiendo.*/, 'Subido OK'));

      // Save photo record
      setUploadStatus(prev => prev + '\n5. Guardando registro...');
      await entities.fotos.create({
        orden_trabajo_id: ordenId,
        numero_orden: orden.numero_orden,
        subido_por_id: userProfile.id,
        subido_por_nombre: userProfile.nombre_completo,
        archivo_url: file_url,
        tipo_foto: photoData.tipo_foto,
        descripcion: photoData.descripcion,
        latitud: lat,
        longitud: lon
      });

      setUploadStatus('✓ ¡Completado!');
      toast.success('Foto subida exitosamente');
      queryClient.invalidateQueries(['fotos-orden', ordenId]);
      setTimeout(() => {
        setShowPhotoDialog(false);
        setPhotoData({ tipo_foto: 'Durante', descripcion: '' });
        setUploadStatus('');
      }, 1000);
    } catch (error) {
      console.error('Photo upload error:', error);
      setUploadStatus(prev => prev + `\n❌ ERROR: ${error.message || 'Error desconocido'}`);
      toast.error(error.message || 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleCall = () => {
    if (orden.cliente_telefono) {
      window.location.href = `tel:${orden.cliente_telefono}`;
    }
  };

  const openMap = () => {
    if (orden.latitud && orden.longitud) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${orden.latitud},${orden.longitud}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orden.direccion)}`, '_blank');
    }
  };

  if (isLoading || !orden) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('MisOrdenes')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-sm font-bold text-blue-600">{orden.numero_orden}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={orden.estado} />
            <PriorityBadge priority={orden.prioridad} />
          </div>
        </div>
      </div>

      {/* Client Info */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-gray-900">{orden.cliente_nombre}</p>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <span>{orden.direccion}</span>
          </div>
          {orden.cliente_telefono && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{orden.cliente_telefono}</span>
            </div>
          )}
          {orden.fecha_programada && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>
                {format(new Date(orden.fecha_programada), "EEEE d 'de' MMMM", { locale: es })}
                {orden.hora_programada && ` a las ${orden.hora_programada}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">
            Detalles del Servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">{orden.tipo_servicio}</span>
          </div>
          {orden.descripcion && (
            <p className="text-gray-600 text-sm">{orden.descripcion}</p>
          )}
          {orden.equipos_involucrados && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Equipos:</p>
              <p className="text-gray-700">{orden.equipos_involucrados}</p>
            </div>
          )}
          {orden.notas_internas && (
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Nota: </span>
                {orden.notas_internas}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos Gallery */}
      {fotos.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              Fotos ({fotos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto) => (
                <button
                  key={foto.id}
                  onClick={() => setSelectedPhoto(foto)}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img 
                    src={foto.archivo_url} 
                    alt={foto.descripcion || 'Foto'} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
        {orden.estado === 'Asignada' && (
          <Button 
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-semibold"
            onClick={handleStartWork}
            disabled={checkingIn}
          >
            {checkingIn ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            INICIAR TRABAJO
          </Button>
        )}

        {orden.estado === 'En Progreso' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="h-12"
                onClick={() => setShowPhotoDialog(true)}
              >
                <Camera className="h-5 w-5 mr-2" />
                Tomar Foto
              </Button>
              <Button 
                variant="outline"
                className="h-12"
                onClick={openMap}
              >
                <Map className="h-5 w-5 mr-2" />
                Ver en Mapa
              </Button>
            </div>
            <Link to={createPageUrl(`CompletarReporte?ordenId=${ordenId}`)}>
              <Button 
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-lg font-semibold"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                FINALIZAR TRABAJO
              </Button>
            </Link>
          </>
        )}

        {orden.estado === 'Completada' && (
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="h-12"
              onClick={openMap}
            >
              <Map className="h-5 w-5 mr-2" />
              Ver en Mapa
            </Button>
            <Link to={createPageUrl(`VerReporte?ordenId=${ordenId}`)}>
              <Button 
                variant="outline"
                className="h-12 w-full"
              >
                <FileText className="h-5 w-5 mr-2" />
                Ver Reporte
              </Button>
            </Link>
          </div>
        )}

        {orden.cliente_telefono && (
          <Button 
            variant="outline"
            className="w-full h-12"
            onClick={handleCall}
          >
            <Phone className="h-5 w-5 mr-2" />
            Llamar Cliente
          </Button>
        )}
      </div>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Foto</Label>
              <Select 
                value={photoData.tipo_foto} 
                onValueChange={(v) => setPhotoData({...photoData, tipo_foto: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Antes">Antes</SelectItem>
                  <SelectItem value="Durante">Durante</SelectItem>
                  <SelectItem value="Después">Después</SelectItem>
                  <SelectItem value="Problema">Problema</SelectItem>
                  <SelectItem value="Equipo">Equipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                placeholder="Describe la foto..."
                value={photoData.descripcion}
                onChange={(e) => setPhotoData({...photoData, descripcion: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Button
                className="w-full h-12 relative overflow-hidden"
                disabled={uploadingPhoto}
              >
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 mr-2" />
                )}
                {uploadingPhoto ? 'Subiendo...' : 'Tomar Foto'}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 relative overflow-hidden"
                disabled={uploadingPhoto}
              >
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handlePhotoCapture}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 mr-2" />
                )}
                {uploadingPhoto ? 'Subiendo...' : 'Elegir de Galería'}
              </Button>
            </div>
            {/* Debug status display */}
            {uploadStatus && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg text-xs font-mono whitespace-pre-line">
                {uploadStatus}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Distance Warning Dialog */}
      <Dialog open={showDistanceWarning} onOpenChange={setShowDistanceWarning}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Advertencia de Ubicación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Estás a <span className="font-bold">{Math.round(pendingCheckIn?.distancia_del_sitio || 0)} metros</span> del sitio de trabajo.
            </p>
            <p className="text-sm text-gray-500">
              ¿Deseas confirmar el check-in de todas formas?
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDistanceWarning(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                onClick={() => performCheckIn(pendingCheckIn)}
                disabled={checkingIn}
              >
                {checkingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-lg p-0">
          {selectedPhoto && (
            <div className="relative">
              <img 
                src={selectedPhoto.archivo_url} 
                alt={selectedPhoto.descripcion || 'Foto'} 
                className="w-full"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              {selectedPhoto.descripcion && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="text-sm font-medium">{selectedPhoto.tipo_foto}</p>
                  <p className="text-sm opacity-80">{selectedPhoto.descripcion}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
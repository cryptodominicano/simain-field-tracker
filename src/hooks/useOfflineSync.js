import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPendingPhotos, getPendingCount, removePendingPhoto, pendingPhotoToFile } from '../utils/offlineQueue';
import { integrations, entities } from '../api';
import { toast } from 'sonner';

/**
 * Hook to manage offline photo sync
 * - Monitors pending photo count
 * - Listens for online events
 * - Automatically syncs when back online
 */
export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Update pending count
  const refreshCount = useCallback(() => {
    setPendingCount(getPendingCount());
  }, []);

  // Sync all pending photos
  const syncPendingPhotos = useCallback(async () => {
    const pending = getPendingPhotos();
    if (pending.length === 0) return;

    setSyncing(true);
    console.log('[SYNC] Starting sync of', pending.length, 'photos');

    let successCount = 0;
    let failCount = 0;

    for (const pendingPhoto of pending) {
      try {
        // Convert back to File
        const file = pendingPhotoToFile(pendingPhoto);

        // Upload to Supabase
        const result = await integrations.Core.UploadFile({ file });

        if (result.offline) {
          // Still offline, skip
          console.log('[SYNC] Still offline, skipping', pendingPhoto.id);
          continue;
        }

        // Save the photo record to database
        const metadata = pendingPhoto.metadata;
        if (metadata.orden_trabajo_id) {
          await entities.fotos.create({
            orden_trabajo_id: metadata.orden_trabajo_id,
            numero_orden: metadata.numero_orden,
            subido_por_id: metadata.subido_por_id,
            subido_por_nombre: metadata.subido_por_nombre,
            archivo_url: result.file_url,
            tipo_foto: metadata.tipo_foto,
            descripcion: metadata.descripcion,
            latitud: metadata.latitud,
            longitud: metadata.longitud
          });
        }

        // Remove from queue
        removePendingPhoto(pendingPhoto.id);
        successCount++;
        console.log('[SYNC] Successfully synced', pendingPhoto.id);
      } catch (error) {
        console.error('[SYNC] Failed to sync', pendingPhoto.id, error);
        failCount++;
      }
    }

    setSyncing(false);
    refreshCount();

    if (successCount > 0) {
      // Invalidate photo queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['fotos-orden'] });
      toast.success(`${successCount} foto${successCount > 1 ? 's' : ''} sincronizada${successCount > 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} foto${failCount > 1 ? 's' : ''} no se pudo${failCount > 1 ? 'ieron' : ''} sincronizar`);
    }
  }, [refreshCount, queryClient]);

  // Listen for online events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[SYNC] Back online, starting sync...');
      syncPendingPhotos();
    };

    window.addEventListener('online', handleOnline);

    // Initial count
    refreshCount();

    // If already online and have pending photos, sync them
    if (navigator.onLine && getPendingCount() > 0) {
      syncPendingPhotos();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingPhotos, refreshCount]);

  // Expose manual refresh for when photos are added
  return {
    pendingCount,
    isSyncing,
    refreshCount,
    syncPendingPhotos
  };
}

export default useOfflineSync;

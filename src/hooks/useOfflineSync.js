import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getPendingPhotos,
  getPendingCheckIns,
  getPendingReports,
  getPendingCount,
  getPendingCounts,
  removePendingPhoto,
  removePendingCheckIn,
  removePendingReport,
  pendingPhotoToFile
} from '../utils/offlineQueue';
import { integrations, entities } from '../api';
import { toast } from 'sonner';

/**
 * Hook to manage offline sync for photos, check-ins, and work reports
 * - Monitors pending counts across all queues
 * - Listens for online events
 * - Automatically syncs when back online
 */
export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingCounts, setPendingCounts] = useState({ photos: 0, checkIns: 0, reports: 0, total: 0 });
  const [isSyncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Update pending counts
  const refreshCount = useCallback(() => {
    const counts = getPendingCounts();
    setPendingCounts(counts);
    setPendingCount(counts.total);
  }, []);

  // Sync all pending photos
  const syncPhotos = useCallback(async () => {
    const pending = getPendingPhotos();
    if (pending.length === 0) return { success: 0, fail: 0 };

    console.log('[SYNC] Syncing', pending.length, 'photos');
    let success = 0, fail = 0;

    for (const pendingPhoto of pending) {
      try {
        const file = pendingPhotoToFile(pendingPhoto);
        const result = await integrations.Core.UploadFile({ file });

        if (result.offline) {
          console.log('[SYNC] Still offline, skipping photo', pendingPhoto.id);
          continue;
        }

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

        removePendingPhoto(pendingPhoto.id);
        success++;
      } catch (error) {
        console.error('[SYNC] Failed to sync photo', pendingPhoto.id, error);
        fail++;
      }
    }

    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['fotos-orden'] });
    }

    return { success, fail };
  }, [queryClient]);

  // Sync all pending check-ins
  const syncCheckIns = useCallback(async () => {
    const pending = getPendingCheckIns();
    if (pending.length === 0) return { success: 0, fail: 0 };

    console.log('[SYNC] Syncing', pending.length, 'check-ins');
    let success = 0, fail = 0;

    for (const pendingCheckIn of pending) {
      try {
        // Check if still offline
        if (!navigator.onLine) {
          console.log('[SYNC] Still offline, skipping check-in', pendingCheckIn.id);
          continue;
        }

        const data = pendingCheckIn.data;

        // Create the check-in record
        await entities.registros_entrada.create(data.checkInData);

        // Update order status if needed
        if (data.updateOrderStatus) {
          await entities.ordenes_trabajo.update(data.ordenId, {
            estado: data.newStatus
          });
        }

        removePendingCheckIn(pendingCheckIn.id);
        success++;
      } catch (error) {
        console.error('[SYNC] Failed to sync check-in', pendingCheckIn.id, error);
        fail++;
      }
    }

    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['orden'] });
    }

    return { success, fail };
  }, [queryClient]);

  // Sync all pending work reports
  const syncReports = useCallback(async () => {
    const pending = getPendingReports();
    if (pending.length === 0) return { success: 0, fail: 0 };

    console.log('[SYNC] Syncing', pending.length, 'reports');
    let success = 0, fail = 0;

    for (const pendingReport of pending) {
      try {
        // Check if still offline
        if (!navigator.onLine) {
          console.log('[SYNC] Still offline, skipping report', pendingReport.id);
          continue;
        }

        const data = pendingReport.data;

        // Create the report record
        await entities.reportes_trabajo.create(data.reportData);

        // Update order status if needed
        if (data.updateOrderStatus) {
          await entities.ordenes_trabajo.update(data.ordenId, {
            estado: data.newStatus
          });
        }

        // Create checkout record if provided
        if (data.checkOutData) {
          await entities.registros_entrada.create(data.checkOutData);
        }

        removePendingReport(pendingReport.id);
        success++;
      } catch (error) {
        console.error('[SYNC] Failed to sync report', pendingReport.id, error);
        fail++;
      }
    }

    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['orden'] });
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
    }

    return { success, fail };
  }, [queryClient]);

  // Sync all pending items
  const syncAll = useCallback(async () => {
    if (!navigator.onLine) {
      console.log('[SYNC] Cannot sync - still offline');
      return;
    }

    const totalPending = getPendingCount();
    if (totalPending === 0) return;

    setSyncing(true);
    console.log('[SYNC] Starting sync of', totalPending, 'items');

    // Sync all types
    const [photoResults, checkInResults, reportResults] = await Promise.all([
      syncPhotos(),
      syncCheckIns(),
      syncReports()
    ]);

    setSyncing(false);
    refreshCount();

    // Show consolidated toast
    const totalSuccess = photoResults.success + checkInResults.success + reportResults.success;
    const totalFail = photoResults.fail + checkInResults.fail + reportResults.fail;

    if (totalSuccess > 0) {
      const parts = [];
      if (photoResults.success > 0) parts.push(`${photoResults.success} foto${photoResults.success > 1 ? 's' : ''}`);
      if (checkInResults.success > 0) parts.push(`${checkInResults.success} registro${checkInResults.success > 1 ? 's' : ''}`);
      if (reportResults.success > 0) parts.push(`${reportResults.success} reporte${reportResults.success > 1 ? 's' : ''}`);
      toast.success(`Sincronizado: ${parts.join(', ')}`);
    }

    if (totalFail > 0) {
      toast.error(`${totalFail} elemento${totalFail > 1 ? 's' : ''} no se pudo sincronizar`);
    }
  }, [syncPhotos, syncCheckIns, syncReports, refreshCount]);

  // Listen for online events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[SYNC] Back online, starting sync...');
      syncAll();
    };

    window.addEventListener('online', handleOnline);

    // Initial count
    refreshCount();

    // If already online and have pending items, sync them
    if (navigator.onLine && getPendingCount() > 0) {
      syncAll();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncAll, refreshCount]);

  return {
    pendingCount,
    pendingCounts,
    isSyncing,
    refreshCount,
    syncAll
  };
}

export default useOfflineSync;

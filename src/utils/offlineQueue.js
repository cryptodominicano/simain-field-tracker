/**
 * Offline Queue Manager
 * Saves photos, check-ins, and work reports to localStorage when offline
 * Syncs automatically when back online
 */

const QUEUE_KEYS = {
  photos: 'simain_offline_photos',
  checkIns: 'simain_offline_checkins',
  reports: 'simain_offline_reports'
};

/**
 * Generate a unique ID for pending items
 */
const generateId = (prefix = 'offline') => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

// ============================================
// PHOTOS QUEUE
// ============================================

/**
 * Save a pending photo to localStorage
 * @param {Blob} photoBlob - The photo file as a blob
 * @param {Object} metadata - Photo metadata (orden_trabajo_id, tipo_foto, descripcion, etc.)
 * @returns {string} - The ID of the saved photo
 */
export const savePendingPhoto = async (photoBlob, metadata) => {
  const id = generateId('photo');

  // Convert blob to base64 for localStorage
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(photoBlob);
  });

  const pendingPhoto = {
    id,
    base64,
    fileName: metadata.fileName || `photo_${Date.now()}.jpg`,
    fileType: metadata.fileType || 'image/jpeg',
    metadata,
    savedAt: new Date().toISOString()
  };

  const queue = getPendingPhotos();
  queue.push(pendingPhoto);

  try {
    localStorage.setItem(QUEUE_KEYS.photos, JSON.stringify(queue));
    console.log('[OFFLINE] Photo saved to queue:', id);
    return id;
  } catch (e) {
    console.error('[OFFLINE] Failed to save photo:', e);
    throw new Error('No hay espacio para guardar fotos offline. Libera espacio e intenta de nuevo.');
  }
};

/**
 * Get all pending photos from localStorage
 */
export const getPendingPhotos = () => {
  try {
    const data = localStorage.getItem(QUEUE_KEYS.photos);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[OFFLINE] Error reading photos queue:', e);
    return [];
  }
};

/**
 * Remove a photo from the queue after successful upload
 */
export const removePendingPhoto = (id) => {
  const queue = getPendingPhotos();
  const filtered = queue.filter(p => p.id !== id);
  localStorage.setItem(QUEUE_KEYS.photos, JSON.stringify(filtered));
  console.log('[OFFLINE] Photo removed from queue:', id);
};

/**
 * Convert base64 back to File for upload
 */
export const pendingPhotoToFile = (pendingPhoto) => {
  const byteString = atob(pendingPhoto.base64.split(',')[1]);
  const mimeType = pendingPhoto.fileType;
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], pendingPhoto.fileName, { type: mimeType });
};

// ============================================
// CHECK-INS QUEUE (registros_entrada)
// ============================================

/**
 * Save a pending check-in to localStorage
 * @param {Object} checkInData - Check-in data (usuario_id, orden_trabajo_id, tipo_registro, etc.)
 * @returns {string} - The ID of the saved check-in
 */
export const savePendingCheckIn = (checkInData) => {
  const id = generateId('checkin');

  const pendingCheckIn = {
    id,
    data: checkInData,
    savedAt: new Date().toISOString()
  };

  const queue = getPendingCheckIns();
  queue.push(pendingCheckIn);

  try {
    localStorage.setItem(QUEUE_KEYS.checkIns, JSON.stringify(queue));
    console.log('[OFFLINE] Check-in saved to queue:', id);
    return id;
  } catch (e) {
    console.error('[OFFLINE] Failed to save check-in:', e);
    throw new Error('No hay espacio para guardar el registro offline.');
  }
};

/**
 * Get all pending check-ins from localStorage
 */
export const getPendingCheckIns = () => {
  try {
    const data = localStorage.getItem(QUEUE_KEYS.checkIns);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[OFFLINE] Error reading check-ins queue:', e);
    return [];
  }
};

/**
 * Remove a check-in from the queue after successful sync
 */
export const removePendingCheckIn = (id) => {
  const queue = getPendingCheckIns();
  const filtered = queue.filter(c => c.id !== id);
  localStorage.setItem(QUEUE_KEYS.checkIns, JSON.stringify(filtered));
  console.log('[OFFLINE] Check-in removed from queue:', id);
};

// ============================================
// WORK REPORTS QUEUE (reportes_trabajo)
// ============================================

/**
 * Save a pending work report to localStorage
 * @param {Object} reportData - Report data (orden_trabajo_id, descripcion_trabajo, etc.)
 * @returns {string} - The ID of the saved report
 */
export const savePendingReport = (reportData) => {
  const id = generateId('report');

  const pendingReport = {
    id,
    data: reportData,
    savedAt: new Date().toISOString()
  };

  const queue = getPendingReports();
  queue.push(pendingReport);

  try {
    localStorage.setItem(QUEUE_KEYS.reports, JSON.stringify(queue));
    console.log('[OFFLINE] Report saved to queue:', id);
    return id;
  } catch (e) {
    console.error('[OFFLINE] Failed to save report:', e);
    throw new Error('No hay espacio para guardar el reporte offline.');
  }
};

/**
 * Get all pending reports from localStorage
 */
export const getPendingReports = () => {
  try {
    const data = localStorage.getItem(QUEUE_KEYS.reports);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[OFFLINE] Error reading reports queue:', e);
    return [];
  }
};

/**
 * Remove a report from the queue after successful sync
 */
export const removePendingReport = (id) => {
  const queue = getPendingReports();
  const filtered = queue.filter(r => r.id !== id);
  localStorage.setItem(QUEUE_KEYS.reports, JSON.stringify(filtered));
  console.log('[OFFLINE] Report removed from queue:', id);
};

// ============================================
// AGGREGATE FUNCTIONS
// ============================================

/**
 * Get the count of all pending items across all queues
 * @returns {Object} - { photos, checkIns, reports, total }
 */
export const getPendingCounts = () => {
  const photos = getPendingPhotos().length;
  const checkIns = getPendingCheckIns().length;
  const reports = getPendingReports().length;
  return {
    photos,
    checkIns,
    reports,
    total: photos + checkIns + reports
  };
};

/**
 * Get the total count of all pending items
 * @returns {number}
 */
export const getPendingCount = () => {
  return getPendingCounts().total;
};

/**
 * Check if there are any pending items
 * @returns {boolean}
 */
export const hasPendingItems = () => {
  return getPendingCount() > 0;
};

export default {
  // Photos
  savePendingPhoto,
  getPendingPhotos,
  removePendingPhoto,
  pendingPhotoToFile,
  // Check-ins
  savePendingCheckIn,
  getPendingCheckIns,
  removePendingCheckIn,
  // Reports
  savePendingReport,
  getPendingReports,
  removePendingReport,
  // Aggregate
  getPendingCounts,
  getPendingCount,
  hasPendingItems
};

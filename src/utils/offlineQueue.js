/**
 * Offline Queue for Photos
 * Saves photos to localStorage when offline, syncs when back online
 */

const QUEUE_KEY = 'simain_offline_photos';

/**
 * Generate a unique ID for pending photos
 */
const generateId = () => `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`;

/**
 * Save a pending photo to localStorage
 * @param {Blob} photoBlob - The photo file as a blob
 * @param {Object} metadata - Photo metadata (orden_trabajo_id, tipo_foto, descripcion, etc.)
 * @returns {string} - The ID of the saved photo
 */
export const savePendingPhoto = async (photoBlob, metadata) => {
  const id = generateId();

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
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[OFFLINE] Photo saved to queue:', id);
    return id;
  } catch (e) {
    // localStorage might be full
    console.error('[OFFLINE] Failed to save photo:', e);
    throw new Error('No hay espacio para guardar fotos offline. Libera espacio e intenta de nuevo.');
  }
};

/**
 * Get all pending photos from localStorage
 * @returns {Array} - Array of pending photo objects
 */
export const getPendingPhotos = () => {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[OFFLINE] Error reading queue:', e);
    return [];
  }
};

/**
 * Remove a photo from the queue after successful upload
 * @param {string} id - The photo ID to remove
 */
export const removePendingPhoto = (id) => {
  const queue = getPendingPhotos();
  const filtered = queue.filter(p => p.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  console.log('[OFFLINE] Photo removed from queue:', id);
};

/**
 * Get the count of pending photos
 * @returns {number}
 */
export const getPendingCount = () => {
  return getPendingPhotos().length;
};

/**
 * Convert base64 back to File for upload
 * @param {Object} pendingPhoto - The pending photo object
 * @returns {File}
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

export default {
  savePendingPhoto,
  getPendingPhotos,
  removePendingPhoto,
  getPendingCount,
  pendingPhotoToFile
};

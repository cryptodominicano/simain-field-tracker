import { supabase } from './supabaseClient';

const BUCKET_NAME = 'photos';
const UPLOAD_TIMEOUT_MS = 60000; // 60 seconds for mobile uploads
const MAX_FILE_SIZE_MB = 10; // 10MB max file size

/**
 * Create a timeout promise for upload operations
 */
const createUploadTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`La carga tardó demasiado. Por favor, verifica tu conexión a internet e intenta de nuevo.`));
    }, ms);
  });
};

/**
 * Validate file before upload
 */
const validateFile = (file) => {
  if (!file) {
    throw new Error('No se seleccionó ningún archivo.');
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`El archivo es demasiado grande (${fileSizeMB.toFixed(1)}MB). El tamaño máximo es ${MAX_FILE_SIZE_MB}MB.`);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}. Use JPG, PNG, GIF, WebP o PDF.`);
  }

  return true;
};

/**
 * Get user-friendly error message
 */
const getUploadErrorMessage = (error) => {
  if (!error) return 'Error desconocido al subir el archivo.';

  const message = error.message || error.toString();

  if (message.includes('network') || message.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
  }
  if (message.includes('storage/unauthorized') || message.includes('not authorized')) {
    return 'No tienes permiso para subir archivos. Intenta cerrar sesión y volver a entrar.';
  }
  if (message.includes('storage/quota')) {
    return 'Se ha excedido el límite de almacenamiento.';
  }
  if (message.includes('duplicate') || message.includes('already exists')) {
    return 'Ya existe un archivo con este nombre.';
  }
  if (message.includes('timeout') || message.includes('tardó')) {
    return message;
  }

  return `Error al subir archivo: ${message}`;
};

export const storage = {
  /**
   * Upload a file to Supabase Storage
   * Compatible with Base44's UploadFile integration
   * @param {object} options - { file: File, onProgress?: (percent: number) => void }
   * @returns {Promise<{ file_url: string }>}
   */
  async uploadFile({ file, onProgress }) {
    try {
      // Validate file
      validateFile(file);

      // Get current user for folder organization
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error('Error de autenticación. Por favor, inicia sesión de nuevo.');
      }
      if (!user) {
        throw new Error('Debes iniciar sesión para subir archivos.');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload file with timeout
      const uploadPromise = supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      const { data, error } = await Promise.race([
        uploadPromise,
        createUploadTimeout(UPLOAD_TIMEOUT_MS)
      ]);

      if (error) {
        throw new Error(getUploadErrorMessage(error));
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return { file_url: publicUrl, file_path: fileName };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(getUploadErrorMessage(error));
    }
  },

  /**
   * Upload a private file that requires signed URLs
   * @param {object} options - { file: File }
   * @returns {Promise<{ file_path: string }>}
   */
  async uploadPrivateFile({ file }) {
    try {
      // Validate file
      validateFile(file);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error('Error de autenticación. Por favor, inicia sesión de nuevo.');
      }
      if (!user) {
        throw new Error('Debes iniciar sesión para subir archivos.');
      }

      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `private/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const uploadPromise = supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      const { data, error } = await Promise.race([
        uploadPromise,
        createUploadTimeout(UPLOAD_TIMEOUT_MS)
      ]);

      if (error) {
        throw new Error(getUploadErrorMessage(error));
      }

      return { file_path: data.path };
    } catch (error) {
      console.error('Private upload error:', error);
      throw new Error(getUploadErrorMessage(error));
    }
  },

  /**
   * Create a signed URL for a private file
   * @param {object} options - { file_path: string, expires_in?: number }
   * @returns {Promise<{ signed_url: string }>}
   */
  async createSignedUrl({ file_path, expires_in = 3600 }) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(file_path, expires_in);

    if (error) throw error;

    return { signed_url: data.signedUrl };
  },

  /**
   * Delete a file
   * @param {string} filePath - Path to the file in storage
   */
  async deleteFile(filePath) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
    return true;
  },

  /**
   * List files in a folder
   * @param {string} folder - Folder path
   */
  async listFiles(folder = '') {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder);

    if (error) throw error;
    return data;
  }
};

// Compatibility layer for Base44's integrations.Core
export const Core = {
  UploadFile: storage.uploadFile.bind(storage),
  UploadPrivateFile: storage.uploadPrivateFile.bind(storage),
  CreateFileSignedUrl: storage.createSignedUrl.bind(storage)
};

export const integrations = { Core };

export default storage;

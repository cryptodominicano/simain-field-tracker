import { supabase } from './supabaseClient';

const BUCKET_NAME = 'photos';

export const storage = {
  /**
   * Upload a file to Supabase Storage
   * Compatible with Base44's UploadFile integration
   * @param {object} options - { file: File }
   * @returns {Promise<{ file_url: string }>}
   */
  async uploadFile({ file }) {
    // Get current user for folder organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to upload files');

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { file_url: publicUrl };
  },

  /**
   * Upload a private file that requires signed URLs
   * @param {object} options - { file: File }
   * @returns {Promise<{ file_path: string }>}
   */
  async uploadPrivateFile({ file }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to upload files');

    const fileExt = file.name.split('.').pop();
    const fileName = `private/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    return { file_path: data.path };
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

import { supabase } from './supabaseClient';

export const auth = {
  /**
   * Sign up a new user with email and password
   */
  async signUp({ email, password, nombre_completo, rol = 'tecnico' }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo,
          rol
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current authenticated user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get the current user's profile from usuarios table
   */
  async me() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (error) throw error;
    return { ...user, profile: data, email: user.email };
  },

  /**
   * Update the current user's password
   */
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return data;
  },

  /**
   * Invite a new user by email (admin only)
   * Sends an invite email where user can set their password
   */
  async inviteUser({ email, nombre_completo, rol = 'tecnico', telefono = '', cedula = '' }) {
    // Use signUp with a temporary random password
    // The user will need to use "forgot password" to set their own
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!1';

    const { data, error } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          nombre_completo,
          rol,
          telefono,
          cedula
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (error) throw error;

    // Immediately send password reset so user can set their own password
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    return data;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Logout (alias for signOut for Base44 compatibility)
   */
  logout() {
    window.location.href = '/login';
    return this.signOut();
  }
};

export default auth;

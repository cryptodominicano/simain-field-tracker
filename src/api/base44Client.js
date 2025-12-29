import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6951b2bd4463c102a5797eb5", 
  requiresAuth: true // Ensure authentication is required for all operations
});

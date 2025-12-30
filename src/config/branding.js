/**
 * White-label branding configuration
 * Edit these values for each client deployment
 */

export const branding = {
  // Company Information
  company: {
    name: 'SIMAIN',
    fullName: 'SIMAIN SRL',
    tagline: 'Field Tracker',
    logo: null, // URL to logo image, or null to use initial
    logoInitial: 'S',
    website: 'https://simain.do',
    supportEmail: 'soporte@simain.do',
    phone: '+1 809 555 0000'
  },

  // Theme Colors (CSS color values)
  colors: {
    primary: '#2563eb', // blue-600
    primaryHover: '#1d4ed8', // blue-700
    primaryLight: '#dbeafe', // blue-100
    primaryDark: '#1e40af', // blue-800
    accent: '#10b981', // green-500 (for success states)
    warning: '#f59e0b', // amber-500
    danger: '#ef4444' // red-500
  },

  // Feature Flags
  features: {
    enableGPS: true,
    enablePhotos: true,
    enableOfflineMode: true,
    enableCertifications: true,
    enableNotifications: true,
    enableLiveMap: true,
    requirePhotoForCheckIn: false,
    requireGPSForCheckIn: true
  },

  // Localization
  locale: {
    language: 'es', // 'es' or 'en'
    timezone: 'America/Santo_Domingo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'DOP'
  },

  // Service Types (customize per client industry)
  serviceTypes: [
    'Mantenimiento Preventivo',
    'Mantenimiento Correctivo',
    'Instalacion',
    'Inspeccion',
    'Reparacion',
    'Calibracion',
    'Emergencia'
  ],

  // Equipment Categories (customize per client)
  equipmentCategories: [
    'Aires Acondicionados',
    'Sistemas de Refrigeracion',
    'Equipos Industriales',
    'Sistemas Electricos',
    'Plomeria',
    'Otros'
  ]
};

export default branding;

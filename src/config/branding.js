/**
 * BRANDING CONFIGURATION
 *
 * Edit this file to customize the app for each client.
 * No other code changes needed for basic white-labeling.
 */

export const branding = {
  // ===================
  // COMPANY INFORMATION
  // ===================
  companyName: "SIMAIN SRL",                    // Client company name
  appName: "SIMAIN Field Tracker",              // App title (shows in header/tab)
  tagline: "Sistema de Gestión de Servicios de Campo",

  // Logo (place file in /public folder)
  logo: "/logo.png",                            // Path to logo file
  logoAlt: "SIMAIN Logo",

  // ===================
  // COLORS (Tailwind classes or hex)
  // ===================
  colors: {
    primary: "#1E3A5F",        // Main brand color (headers, buttons)
    primaryHover: "#2C5282",   // Button hover state
    secondary: "#4A5568",      // Secondary elements
    accent: "#3182CE",         // Links, highlights
  },

  // ===================
  // CONTACT INFO
  // ===================
  supportEmail: "soporte@simain.do",
  supportPhone: "+1 809-555-0104",

  // ===================
  // SERVICE TYPES
  // Customize per industry (HVAC, elevators, fire safety, etc.)
  // ===================
  serviceTypes: [
    { value: "Instalación", label: "Instalación" },
    { value: "Mantenimiento", label: "Mantenimiento" },
    { value: "Calibración", label: "Calibración" },
    { value: "Reparación", label: "Reparación" },
    { value: "Inspección", label: "Inspección" },
  ],

  // ===================
  // CERTIFICATION TYPES
  // Customize per industry/country
  // ===================
  certificationTypes: [
    { value: "INDOCAL", label: "INDOCAL" },
    { value: "NFPA", label: "NFPA" },
    { value: "ISO 17020:2012", label: "ISO 17020:2012" },
    { value: "ODAC", label: "ODAC" },
    { value: "Otra", label: "Otra" },
  ],

  // ===================
  // PRIORITY LEVELS
  // ===================
  priorities: [
    { value: "Baja", label: "Baja", color: "green" },
    { value: "Media", label: "Media", color: "yellow" },
    { value: "Alta", label: "Alta", color: "orange" },
    { value: "Urgente", label: "Urgente", color: "red" },
  ],

  // ===================
  // ORDER STATUSES
  // ===================
  orderStatuses: [
    { value: "Pendiente", label: "Pendiente" },
    { value: "Asignada", label: "Asignada" },
    { value: "En Progreso", label: "En Progreso" },
    { value: "Completada", label: "Completada" },
    { value: "Cancelada", label: "Cancelada" },
  ],

  // ===================
  // PHOTO TYPES
  // ===================
  photoTypes: [
    { value: "Antes", label: "Antes" },
    { value: "Durante", label: "Durante" },
    { value: "Después", label: "Después" },
    { value: "Problema", label: "Problema" },
    { value: "Equipo", label: "Equipo" },
  ],

  // ===================
  // LOCALIZATION
  // ===================
  locale: "es-DO",              // Dominican Republic Spanish
  currency: "DOP",              // Dominican Peso (change to USD, EUR, etc.)
  dateFormat: "DD/MM/YYYY",
  timeFormat: "HH:mm",

  // ===================
  // FEATURES (toggle on/off)
  // ===================
  features: {
    offlineMode: true,          // Enable offline photo queue
    gpsTracking: true,          // Enable GPS check-in/out
    photoUpload: true,          // Enable photo documentation
    certifications: true,       // Enable certification tracking
    notifications: true,        // Enable in-app notifications
    mapView: true,              // Enable technician map view
  },

  // ===================
  // MAP SETTINGS
  // ===================
  map: {
    defaultCenter: [18.4861, -69.9312],  // Santo Domingo, DR
    defaultZoom: 12,
  },
};

export default branding;

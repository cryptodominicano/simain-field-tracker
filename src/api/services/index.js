import { createEntityService } from './baseService';

// Entity services - replaces base44.entities.*
export const usuarios = createEntityService('usuarios');
export const ordenes_trabajo = createEntityService('ordenes_trabajo');
export const registros_entrada = createEntityService('registros_entrada');
export const fotos = createEntityService('fotos');
export const reportes_trabajo = createEntityService('reportes_trabajo');
export const certificaciones = createEntityService('certificaciones');
export const notificaciones = createEntityService('notificaciones');

// Export all as entities object for compatibility
export const entities = {
  usuarios,
  ordenes_trabajo,
  registros_entrada,
  fotos,
  reportes_trabajo,
  certificaciones,
  notificaciones
};

export default entities;

# SIMAIN SRL - Rastreador de Servicio de Campo

## Guía Rápida de Usuario

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Roles de Usuario](#roles-de-usuario)
4. [Guía del Administrador](#guía-del-administrador)
5. [Guía del Gerente](#guía-del-gerente)
6. [Guía del Técnico](#guía-del-técnico)
7. [Funciones Comunes](#funciones-comunes)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

**SIMAIN SRL - Rastreador de Servicio de Campo** es una aplicación diseñada para gestionar eficientemente las operaciones de servicio técnico en campo. Permite:

- Crear y asignar órdenes de trabajo
- Rastrear técnicos en tiempo real
- Documentar trabajos con fotos
- Generar reportes de servicio
- Gestionar certificaciones de técnicos
- Recibir notificaciones importantes

### Acceso a la Aplicación

**URL**: https://simain-field-tracker.vercel.app

---

## Acceso al Sistema

### Iniciar Sesión

1. Abra la aplicación en su navegador
2. Ingrese su **correo electrónico**
3. Ingrese su **contraseña**
4. Haga clic en **"Iniciar Sesión"**

![Pantalla de Login](./docs/login.png)

### ¿Olvidó su Contraseña?

1. En la pantalla de inicio de sesión, haga clic en **"¿Olvidó su contraseña?"**
2. Ingrese su correo electrónico
3. Haga clic en **"Enviar Instrucciones"**
4. Revise su correo y siga las instrucciones

### Cerrar Sesión

1. Haga clic en **"Cerrar Sesión"** en el menú lateral izquierdo
2. Será redirigido a la pantalla de inicio de sesión

---

## Roles de Usuario

El sistema tiene **tres roles** con diferentes niveles de acceso:

### 1. Administrador
- Acceso completo al sistema
- Gestión de todos los usuarios
- Configuración del sistema
- Todos los permisos de Gerente

### 2. Gerente
- Crear y asignar órdenes de trabajo
- Ver todos los técnicos y sus ubicaciones
- Aprobar reportes de trabajo
- Ver análisis y estadísticas
- Gestionar certificaciones del equipo

### 3. Técnico
- Ver órdenes asignadas
- Registrar entrada/salida en sitios
- Subir fotos de trabajos
- Completar reportes de servicio
- Ver sus propias certificaciones

---

## Guía del Administrador

### Panel Principal (Dashboard)

Al iniciar sesión como Administrador, verá:

- **Técnicos en Campo**: Cantidad de técnicos trabajando actualmente
- **Órdenes Activas**: Órdenes pendientes y en progreso
- **Completadas Hoy**: Órdenes finalizadas en el día
- **Tiempo Promedio**: Duración promedio de servicios

### Gestión de Usuarios

**Acceso**: Menú lateral → **Gestión de Usuarios**

#### Crear Nuevo Usuario

1. Haga clic en **"+ Nuevo Usuario"**
2. Complete los campos:
   - Nombre completo
   - Correo electrónico
   - Teléfono
   - Rol (Administrador, Gerente o Técnico)
3. Haga clic en **"Guardar"**

*Nota: El nuevo usuario recibirá un correo para establecer su contraseña*

#### Editar Usuario

1. Busque el usuario en la lista
2. Haga clic en el ícono de **editar** (lápiz)
3. Modifique los campos necesarios
4. Haga clic en **"Guardar"**

#### Desactivar Usuario

1. Busque el usuario en la lista
2. Haga clic en el ícono de **desactivar**
3. Confirme la acción

*Los usuarios desactivados no pueden iniciar sesión pero sus datos se conservan*

---

## Guía del Gerente

### Panel Principal (Dashboard)

El dashboard del Gerente muestra:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  TÉCNICOS EN    │    ÓRDENES      │  COMPLETADAS    │    TIEMPO       │
│     CAMPO       │    ACTIVAS      │      HOY        │   PROMEDIO      │
│       4         │       8         │       3         │    2.5 hrs      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Órdenes de Trabajo

**Acceso**: Menú lateral → **Órdenes de Trabajo**

#### Crear Nueva Orden

1. Haga clic en **"+ Nueva Orden"**
2. Complete la información:

**Datos del Cliente:**
- Nombre del cliente
- Teléfono de contacto
- Dirección del servicio
- Ubicación GPS (opcional)

**Detalles del Servicio:**
- Tipo de servicio:
  - Instalación
  - Mantenimiento
  - Calibración
  - Reparación
  - Inspección
- Descripción del trabajo
- Equipos involucrados
- Prioridad (Baja, Media, Alta, Urgente)

**Programación:**
- Fecha programada
- Hora programada
- Técnico asignado

3. Haga clic en **"Crear Orden"**

#### Estados de las Órdenes

| Estado | Descripción | Color |
|--------|-------------|-------|
| Pendiente | Orden creada, sin asignar | Gris |
| Asignada | Asignada a un técnico | Azul |
| En Progreso | Técnico trabajando en sitio | Amarillo |
| Completada | Trabajo finalizado | Verde |
| Cancelada | Orden cancelada | Rojo |

#### Filtrar Órdenes

Use los filtros en la parte superior para buscar por:
- Estado
- Prioridad
- Técnico asignado
- Fecha
- Número de orden

### Mapa en Vivo

**Acceso**: Menú lateral → **Mapa en Vivo**

El mapa muestra la ubicación en tiempo real de todos los técnicos que están trabajando en campo.

**Información mostrada:**
- Nombre del técnico
- Orden actual
- Cliente
- Tiempo en sitio

**Colores de marcadores:**
- 🟢 Verde: Técnico activo en sitio
- 🟡 Amarillo: En tránsito
- 🔴 Rojo: Sin actividad reciente

### Gestión de Técnicos

**Acceso**: Menú lateral → **Técnicos**

Visualice información de todos los técnicos:
- Estado actual (Disponible, En servicio, No disponible)
- Órdenes asignadas
- Certificaciones vigentes
- Historial de trabajos

### Certificaciones del Equipo

**Acceso**: Menú lateral → **Certificaciones**

#### Agregar Certificación

1. Haga clic en **"+ Nueva Certificación"**
2. Seleccione el técnico
3. Complete:
   - Nombre de la certificación
   - Tipo (INDOCAL, NFPA, ISO, ODAC, Otra)
   - Número de certificado
   - Fecha de emisión
   - Fecha de vencimiento
   - Documento adjunto (opcional)
4. Haga clic en **"Guardar"**

#### Alertas de Vencimiento

El sistema envía notificaciones automáticas cuando una certificación está por vencer:
- 30 días antes
- 15 días antes
- 7 días antes
- El día de vencimiento

### Reportes y Análisis

**Acceso**: Menú lateral → **Reportes**

Visualice estadísticas como:
- Órdenes por estado
- Órdenes por tipo de servicio
- Rendimiento por técnico
- Tiempo promedio de servicio
- Órdenes por cliente

---

## Guía del Técnico

### Panel Principal (Dashboard)

Al iniciar sesión como Técnico, verá:

- **Mis Órdenes del Día**: Trabajos programados para hoy
- **Próximas Órdenes**: Trabajos de los próximos días
- **Órdenes en Progreso**: Trabajo actual

### Mis Órdenes

**Acceso**: Menú lateral → **Mis Órdenes**

Lista de todas las órdenes asignadas con filtros por estado.

### Ver Detalle de Orden

1. Haga clic en una orden de la lista
2. Verá información completa:
   - Datos del cliente
   - Dirección y mapa
   - Descripción del trabajo
   - Equipos a revisar
   - Historial de la orden

### Registrar Llegada (Check-in)

**Cuando llegue al sitio de trabajo:**

1. Abra la orden asignada
2. Haga clic en **"Registrar Llegada"**
3. El sistema capturará automáticamente:
   - Su ubicación GPS
   - Hora de llegada
   - Distancia del sitio programado

*Nota: Debe estar cerca del sitio para registrar llegada*

### Subir Fotos

**Durante el trabajo, documente con fotos:**

1. En la orden, haga clic en **"Agregar Foto"**
2. Seleccione el tipo:
   - **Antes**: Estado inicial del equipo
   - **Durante**: Proceso de trabajo
   - **Después**: Resultado final
   - **Problema**: Documentar issues encontrados
   - **Equipo**: Equipos y herramientas usadas
3. Tome la foto o seleccione de galería
4. Agregue descripción (opcional)
5. Haga clic en **"Subir"**

### Completar Reporte de Trabajo

**Al finalizar el servicio:**

1. Haga clic en **"Completar Reporte"**
2. Complete los campos:

```
┌────────────────────────────────────────────────────────────┐
│  REPORTE DE TRABAJO                                        │
├────────────────────────────────────────────────────────────┤
│  Descripción del Trabajo Realizado:                        │
│  [Detalle las actividades realizadas...]                   │
│                                                            │
│  Partes/Materiales Usados:                                 │
│  [Liste los materiales utilizados...]                      │
│                                                            │
│  Tiempo Total (minutos): [___]                             │
│                                                            │
│  Problemas Encontrados:                                    │
│  [Describa cualquier problema...]                          │
│                                                            │
│  Recomendaciones:                                          │
│  [Sugerencias para el cliente...]                          │
└────────────────────────────────────────────────────────────┘
```

3. Haga clic en **"Enviar Reporte"**

### Registrar Salida (Check-out)

**Al terminar y salir del sitio:**

1. Haga clic en **"Registrar Salida"**
2. El sistema registrará:
   - Hora de salida
   - Ubicación GPS
   - Tiempo total en sitio

### Mis Certificaciones

**Acceso**: Menú lateral → **Mis Certificaciones**

Vea sus certificaciones vigentes y próximas a vencer.

---

## Funciones Comunes

### Notificaciones

**Acceso**: Ícono de campana (🔔) en la esquina superior derecha

Tipos de notificaciones:
- 📋 Nueva orden asignada
- ✅ Orden completada
- ⚠️ Certificación por vencer
- 📢 Avisos del sistema

#### Marcar como Leída

- Haga clic en la notificación para marcarla como leída
- Use **"Marcar todas como leídas"** para limpiar todas

### Mi Perfil

**Acceso**: Menú lateral → **Mi Perfil** o haga clic en su nombre

Puede ver y editar:
- Nombre completo
- Teléfono
- Foto de perfil
- Cambiar contraseña

### Cambiar Contraseña

1. Vaya a **Mi Perfil**
2. Haga clic en **"Cambiar Contraseña"**
3. Ingrese la contraseña actual
4. Ingrese la nueva contraseña (mínimo 8 caracteres)
5. Confirme la nueva contraseña
6. Haga clic en **"Guardar"**

---

## Preguntas Frecuentes

### ¿Cómo recupero mi contraseña?

1. En la pantalla de login, haga clic en **"¿Olvidó su contraseña?"**
2. Ingrese su correo electrónico
3. Revise su bandeja de entrada (y spam)
4. Siga el enlace para crear nueva contraseña

### ¿Por qué no puedo registrar llegada?

Posibles causas:
- No tiene el GPS activado en su dispositivo
- Está muy lejos del sitio de trabajo
- No tiene conexión a internet

**Solución**: Active el GPS, acérquese al sitio, y verifique su conexión.

### ¿Cómo veo el historial de una orden?

1. Abra la orden deseada
2. Desplácese hacia abajo hasta **"Historial"**
3. Verá todos los cambios de estado, comentarios y actividades

### ¿Puedo editar un reporte enviado?

Los reportes con estado **"Enviado"** no pueden editarse. Contacte a su gerente si necesita hacer correcciones.

### ¿Por qué no veo algunas órdenes?

Como técnico, solo ve las órdenes que le han sido asignadas. Si cree que falta alguna, contacte a su gerente.

### ¿Cómo sé si mi certificación está por vencer?

- Recibirá notificaciones automáticas 30, 15 y 7 días antes
- Puede revisar en **Mis Certificaciones** → las próximas a vencer aparecen resaltadas en amarillo/rojo

### ¿La aplicación funciona sin internet?

La aplicación requiere conexión a internet para:
- Iniciar sesión
- Cargar órdenes
- Subir fotos
- Enviar reportes

*Consejo: Descargue la información de sus órdenes antes de ir a zonas sin cobertura*

### ¿Cómo contacto soporte técnico?

Contacte a su administrador del sistema o envíe un correo a soporte@simain.do

---

## Consejos Útiles

### Para Técnicos

✅ **Registre llegada** inmediatamente al llegar al sitio

✅ **Tome fotos** del estado inicial ANTES de comenzar

✅ **Documente problemas** encontrados con fotos

✅ **Complete el reporte** antes de irse del sitio

✅ **Registre salida** al terminar

### Para Gerentes

✅ **Revise el mapa** regularmente para ver técnicos en campo

✅ **Asigne prioridades** correctamente para urgencias

✅ **Revise reportes** pendientes diariamente

✅ **Monitoree certificaciones** próximas a vencer

✅ **Use filtros** para encontrar órdenes rápidamente

---

## Atajos de Navegación

| Acción | Atajo |
|--------|-------|
| Ir al Dashboard | Clic en logo SIMAIN |
| Ver notificaciones | Clic en 🔔 |
| Crear orden rápida | Botón "+ Nueva Orden" |
| Buscar orden | Use el campo de búsqueda |
| Cerrar sesión | Menú lateral → Cerrar Sesión |

---

## Glosario

| Término | Definición |
|---------|------------|
| **Orden de Trabajo** | Solicitud de servicio técnico |
| **Check-in** | Registro de llegada al sitio |
| **Check-out** | Registro de salida del sitio |
| **RLS** | Seguridad a nivel de fila (controla qué datos puede ver cada usuario) |
| **GPS** | Sistema de posicionamiento global |
| **Dashboard** | Panel principal con resumen de información |

---

## Contacto

**SIMAIN SRL**
Servicios de Ingeniería y Mantenimiento Industrial

📧 Email: info@simain.do
📞 Teléfono: (809) XXX-XXXX
🌐 Web: https://simain-field-tracker.vercel.app

---

*Guía actualizada: Diciembre 2024*
*Versión del Sistema: 1.0.0*

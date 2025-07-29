# Sistema Administrativo - SignaApp

## Descripción
Sistema de administración para gestionar y visualizar datos de la API clínica SignaApi. Incluye herramientas para poblar la base de datos con datos de prueba y visualizar información en tiempo real.

## URLs de Acceso

### Páginas Principales
- **Panel Principal**: `/admin` - Página de inicio con navegación
- **Dashboard**: `/admin/dashboard` - Vista completa de todos los datos
- **Gestor de Datos**: `/admin/data-manager` - Herramientas para poblar la base de datos

## Funcionalidades

### 1. Dashboard (`/admin/dashboard`)
- **Estadísticas en tiempo real**: Muestra contadores de todas las entidades
- **Gestor de datos**: Botones para poblar la base de datos
- **Tablas de datos**: Visualización de doctores, pacientes, visitas y diagnósticos
- **Actualización automática**: Los datos se actualizan cada 30 segundos

### 2. Gestor de Datos (`/admin/data-manager`)
- **Poblar Doctores**: Crea 5 doctores de prueba con especialidades
- **Poblar Pacientes**: Crea 8 pacientes con datos realistas
- **Poblar Historias**: Crea historias clínicas para los pacientes
- **Poblar Visitas**: Crea visitas con evaluaciones de triaje
- **Poblar Diagnósticos**: Crea diagnósticos con resultados RPGP
- **Poblar Todo**: Ejecuta todos los scripts en secuencia

### 3. Visualización de Datos
- **Doctores**: Lista con nombre, email y especialidad
- **Pacientes**: Lista con nombre, cédula y edad
- **Visitas**: Lista con hora de entrada, evaluación y especialidad
- **Diagnósticos**: Lista con diagnóstico y resultado RPGP

## Configuración de la API

### URL de la API
La aplicación está configurada para conectarse a:
```
http://localhost:8000
```

### Endpoints Utilizados
- `GET /doctores/` - Obtener lista de doctores
- `POST /doctores/` - Crear nuevo doctor
- `GET /pacientes/` - Obtener lista de pacientes
- `POST /pacientes/` - Crear nuevo paciente
- `GET /historias/` - Obtener historias clínicas
- `POST /historias/` - Crear nueva historia clínica
- `GET /visitas/` - Obtener lista de visitas
- `POST /visitas/` - Crear nueva visita
- `GET /diagnosticos/` - Obtener diagnósticos
- `POST /diagnosticos/` - Crear nuevo diagnóstico

## Datos de Prueba

### Doctores Creados
1. Dr. Juan Pérez - Cardiología
2. Dra. María García - Pediatría
3. Dr. Carlos López - Traumatología
4. Dra. Ana Rodríguez - Dermatología
5. Dr. Luis Martínez - Neurología

### Pacientes Creados
1. Roberto Silva - Cédula: 12345678 - Edad: 45
2. Carmen Vega - Cédula: 23456789 - Edad: 32
3. Miguel Torres - Cédula: 34567890 - Edad: 28
4. Isabel Morales - Cédula: 45678901 - Edad: 55
5. Fernando Ruiz - Cédula: 56789012 - Edad: 39
6. Patricia Herrera - Cédula: 67890123 - Edad: 41
7. Ricardo Mendoza - Cédula: 78901234 - Edad: 36
8. Sofia Castro - Cédula: 89012345 - Edad: 29

## Instrucciones de Uso

### 1. Iniciar la API
```bash
cd SignaApi
uvicorn api.main:app --reload
```

### 2. Iniciar el Frontend
```bash
cd Signaapp
npm run dev
```

### 3. Acceder al Panel Administrativo
1. Abrir el navegador en `http://localhost:3000/admin`
2. Navegar a "Gestor de Datos" para poblar la base de datos
3. Usar "Dashboard" para visualizar todos los datos

### 4. Poblar la Base de Datos
1. Ir a `/admin/data-manager`
2. Hacer clic en "Poblar Base de Datos Completa"
3. Esperar a que se completen todas las operaciones
4. Verificar los datos en el dashboard

## Características Técnicas

### Tecnologías Utilizadas
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLite
- **Estado**: React Hooks (useState, useEffect)
- **Navegación**: Next.js App Router

### Componentes Principales
- `DataManager.tsx` - Gestión de datos y scripts de población
- `StatsCards.tsx` - Estadísticas en tiempo real
- `DoctoresList.tsx` - Lista de doctores
- `PacientesList.tsx` - Lista de pacientes
- `VisitasList.tsx` - Lista de visitas
- `DiagnosticosList.tsx` - Lista de diagnósticos
- `AdminNavigation.tsx` - Navegación entre páginas

### Funciones de API
- `getDoctores()` - Obtener doctores
- `createDoctor()` - Crear doctor
- `getPacientes()` - Obtener pacientes
- `createPaciente()` - Crear paciente
- `getHistorias()` - Obtener historias
- `createHistoria()` - Crear historia
- `getVisitas()` - Obtener visitas
- `createVisita()` - Crear visita
- `getDiagnosticos()` - Obtener diagnósticos
- `createDiagnostico()` - Crear diagnóstico

## Seguridad

### Acceso Restringido
- Las páginas administrativas están en la ruta `/admin`
- Se recomienda implementar autenticación para producción
- Los datos son sensibles y requieren autorización

### Validación de Datos
- Todos los datos se validan antes de enviarse a la API
- Manejo de errores en todas las operaciones
- Feedback visual para el usuario

## Solución de Problemas

### Error de Conexión
- Verificar que la API esté ejecutándose en `http://localhost:8000`
- Revisar la consola del navegador para errores CORS
- Verificar que los endpoints estén disponibles

### Datos No Se Carguen
- Verificar la conexión a la API
- Revisar los logs del servidor
- Intentar recargar la página

### Errores de Población
- Verificar que la API esté funcionando
- Revisar que no haya datos duplicados
- Verificar la estructura de datos esperada

## Desarrollo

### Agregar Nuevas Entidades
1. Crear interfaces en `src/functions/api.ts`
2. Agregar funciones de API
3. Crear componente de lista
4. Actualizar el dashboard
5. Agregar datos de prueba al DataManager

### Modificar Datos de Prueba
Editar los arrays en `DataManager.tsx`:
- `doctoresPrueba`
- `pacientesPrueba`
- Lógica de creación de historias, visitas y diagnósticos

## Contacto
Para soporte técnico o preguntas sobre el sistema administrativo, contactar al equipo de desarrollo. 
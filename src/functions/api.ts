// Configuración de la API de SignaApi
const API_BASE_URL = 'https://signaapiv1.onrender.com'; // URL de producción en Railway

// Función para manejar errores de red
const handleNetworkError = (error: any): string => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Error de conexión: No se puede conectar con el servidor. Verifica que la API esté ejecutándose.';
  }
  if (error.name === 'AbortError') {
    return 'La solicitud fue cancelada.';
  }
  return 'Error de red desconocido.';
};

// Función para manejar errores HTTP
const handleHttpError = (response: Response): string => {
  switch (response.status) {
    case 400:
      return 'Datos inválidos enviados al servidor.';
    case 401:
      return 'No autorizado. Verifica las credenciales.';
    case 403:
      return 'Acceso prohibido.';
    case 404:
      return 'Recurso no encontrado.';
    case 500:
      return 'Error interno del servidor.';
    case 502:
      return 'Servidor no disponible temporalmente.';
    case 503:
      return 'Servicio no disponible.';
    default:
      return `Error del servidor: ${response.status} ${response.statusText}`;
  }
};

// Función para validar datos antes de enviar
const validateDoctor = (doctor: Omit<Doctor, 'id'>): string | null => {
  if (!doctor.nombre || doctor.nombre.trim().length < 2) {
    return 'El nombre del doctor debe tener al menos 2 caracteres.';
  }
  if (!doctor.email || !doctor.email.includes('@')) {
    return 'El email del doctor no es válido.';
  }
  if (!doctor.especialidad || doctor.especialidad.trim().length < 2) {
    return 'La especialidad debe tener al menos 2 caracteres.';
  }
  return null;
};

const validatePaciente = (paciente: Omit<Paciente, 'id'>): string | null => {
  if (!paciente.nombre || paciente.nombre.trim().length < 2) {
    return 'El nombre del paciente debe tener al menos 2 caracteres.';
  }
  if (!paciente.cedula || paciente.cedula.trim().length < 5) {
    return 'La cédula debe tener al menos 5 caracteres.';
  }
  if (paciente.edad < 0 || paciente.edad > 150) {
    return 'La edad debe estar entre 0 y 150 años.';
  }
  return null;
};

// Tipos de datos
export interface Doctor {
  id?: number;
  nombre: string;
  email: string;
  google_id?: string;
  especialidad: string;
}

export interface Paciente {
  id?: number;
  nombre: string;
  cedula: string;
  edad: number;
}

export interface HistoriaClinica {
  id?: number;
  paciente_id: number;
  fecha: string;
}

export interface Visita {
  id?: number;
  historia_id: number;
  hora_entrada: string;
  evaluacion_triaje: string;
  prediagnostico: string;
  especialidad: string;
  numero_visita: number;
}

export interface Diagnostico {
  id?: number;
  visita_id: number;
  diagnostico: string;
  resultado_rppg: string;
  informe_prediagnostico: string;
}

// Interfaces para autenticación
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface DoctorAuth {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
  especialidad: string | null;
  role: string;
}

export interface AuthMeResponse {
  doctor: DoctorAuth;
}

// Funciones para consumir la API

// Doctores
export const getDoctores = async (): Promise<Doctor[]> => {
  const data = await apiRequest<{ doctores: Doctor[] }>('/doctores/', {}, false);
  return data.doctores;
};

export const createDoctor = async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
  // Validar datos antes de enviar
  const validationError = validateDoctor(doctor);
  if (validationError) {
    throw new Error(validationError);
  }
  
  return apiRequest<Doctor>('/doctores/', {
    method: 'POST',
    body: JSON.stringify(doctor)
  });
};

// Pacientes
export const getPacientes = async (): Promise<Paciente[]> => {
  const data = await apiRequest<{ pacientes: Paciente[] }>('/pacientes/', {}, false);
  return data.pacientes;
};

export const createPaciente = async (paciente: Omit<Paciente, 'id'>): Promise<Paciente> => {
  // Validar datos antes de enviar
  const validationError = validatePaciente(paciente);
  if (validationError) {
    throw new Error(validationError);
  }
  
  return apiRequest<Paciente>('/pacientes/', {
    method: 'POST',
    body: JSON.stringify(paciente)
  });
};

// Función genérica para peticiones HTTP
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  expectedArray: boolean = false,
  querySecret?: string
): Promise<T> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Asegurar que la URL esté correctamente formada
    let url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
    if (querySecret) {
      url += `?secret=${querySecret}`;
    }

    const response = await fetch(url, {
      headers: options.method !== 'POST' || options.body ? { 'Content-Type': 'application/json' } : undefined,
      signal: controller.signal,
      ...options
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(handleHttpError(response));
    }

    const data = await response.json();

    if (expectedArray && !Array.isArray(data)) {
      throw new Error('Formato de respuesta inválido: se esperaba un array');
    }

    if (!expectedArray && (!data || typeof data !== 'object')) {
      throw new Error('Formato de respuesta inválido');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado');
      }
      throw error;
    }
    throw new Error(handleNetworkError(error));
  }
};

// Historias Clínicas
export const getHistorias = async (): Promise<HistoriaClinica[]> => {
  const data = await apiRequest<{ historias: HistoriaClinica[] }>('/historias/', {}, false);
  return data.historias;
};

export const createHistoria = async (historia: Omit<HistoriaClinica, 'id'>): Promise<HistoriaClinica> => {
  return apiRequest<HistoriaClinica>('/historias/', {
    method: 'POST',
    body: JSON.stringify(historia)
  });
};

// Visitas
export const getVisitas = async (): Promise<Visita[]> => {
  const data = await apiRequest<{ visitas: Visita[] }>('/visitas/', {}, false);
  return data.visitas;
};

export const createVisita = async (visita: Omit<Visita, 'id'>): Promise<Visita> => {
  return apiRequest<Visita>('/visitas/', {
    method: 'POST',
    body: JSON.stringify(visita)
  });
};

// Diagnósticos
export const getDiagnosticos = async (): Promise<Diagnostico[]> => {
  const data = await apiRequest<{ diagnosticos: Diagnostico[] }>('/diagnosticos/', {}, false);
  return data.diagnosticos;
};

export const createDiagnostico = async (diagnostico: Omit<Diagnostico, 'id'>): Promise<Diagnostico> => {
  return apiRequest<Diagnostico>('/diagnosticos/', {
    method: 'POST',
    body: JSON.stringify(diagnostico)
  });
};

// Autenticación
export const loginDoctor = async (cedula: string, password: string): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ cedula, password })
  });
};

export const getDoctorMe = async (): Promise<AuthMeResponse> => {
  // Usar token del localStorage si existe
  const token = localStorage.getItem('access_token');
  return apiRequest<AuthMeResponse>('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const registerNewDoctor = async (
  nombre: string,
  email: string,
  cedula: string,
  password: string,
  especialidad: string,
  secret: string
): Promise<any> => {
  return apiRequest<any>('/auth/register-doctor', {
    method: 'POST',
    body: JSON.stringify({
      nombre,
      email,
      cedula,
      password,
      especialidad
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }, false, secret);
};

// rPPG - archivo binario
export const sendRPPGApi = async (formData: FormData): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    const url = `https://signaapiv1.onrender.com/rppg/`; // Usar endpoint directo

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(handleHttpError(response));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado al procesar el video');
      }
      throw error;
    }
    throw new Error(handleNetworkError(error));
  }
};

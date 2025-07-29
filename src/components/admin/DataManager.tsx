'use client';

import { useState } from 'react';
import { 
  getDoctores, 
  createDoctor, 
  getPacientes, 
  createPaciente, 
  getHistorias, 
  createHistoria,
  getVisitas,
  createVisita,
  getDiagnosticos,
  createDiagnostico,
  type Doctor,
  type Paciente,
  type HistoriaClinica,
  type Visita,
  type Diagnostico
} from '@/functions/api';
import { useNotification } from './Notification';

const DataManager = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    doctores: Doctor[];
    pacientes: Paciente[];
    historias: HistoriaClinica[];
    visitas: Visita[];
    diagnosticos: Diagnostico[];
  }>({
    doctores: [],
    pacientes: [],
    historias: [],
    visitas: [],
    diagnosticos: []
  });
  
  const { addNotification } = useNotification();

  // Datos de prueba
  const doctoresPrueba: Omit<Doctor, 'id'>[] = [
    { nombre: 'Dr. Juan Pérez', email: 'juan.perez@hospital.com', especialidad: 'Cardiología' },
    { nombre: 'Dra. María García', email: 'maria.garcia@hospital.com', especialidad: 'Pediatría' },
    { nombre: 'Dr. Carlos López', email: 'carlos.lopez@hospital.com', especialidad: 'Traumatología' },
    { nombre: 'Dra. Ana Rodríguez', email: 'ana.rodriguez@hospital.com', especialidad: 'Dermatología' },
    { nombre: 'Dr. Luis Martínez', email: 'luis.martinez@hospital.com', especialidad: 'Neurología' }
  ];

  const pacientesPrueba: Omit<Paciente, 'id'>[] = [
    { nombre: 'Roberto Silva', cedula: '12345678', edad: 45 },
    { nombre: 'Carmen Vega', cedula: '23456789', edad: 32 },
    { nombre: 'Miguel Torres', cedula: '34567890', edad: 28 },
    { nombre: 'Isabel Morales', cedula: '45678901', edad: 55 },
    { nombre: 'Fernando Ruiz', cedula: '56789012', edad: 39 },
    { nombre: 'Patricia Herrera', cedula: '67890123', edad: 41 },
    { nombre: 'Ricardo Mendoza', cedula: '78901234', edad: 36 },
    { nombre: 'Sofia Castro', cedula: '89012345', edad: 29 }
  ];

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [doctores, pacientes, historias, visitas, diagnosticos] = await Promise.all([
        getDoctores(),
        getPacientes(),
        getHistorias(),
        getVisitas(),
        getDiagnosticos()
      ]);
      
      setData({ doctores, pacientes, historias, visitas, diagnosticos });
      addNotification('Datos cargados exitosamente', 'success');
    } catch (error) {
      addNotification(`Error al cargar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const poblarDoctores = async () => {
    setLoading(true);
    try {
      const doctoresCreados: Doctor[] = [];
      for (const doctor of doctoresPrueba) {
        const nuevoDoctor = await createDoctor(doctor);
        doctoresCreados.push(nuevoDoctor);
      }
      setData(prev => ({ ...prev, doctores: doctoresCreados }));
      addNotification(`${doctoresCreados.length} doctores creados exitosamente`, 'success');
    } catch (error) {
      addNotification(`Error al crear doctores: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const poblarPacientes = async () => {
    setLoading(true);
    try {
      const pacientesCreados: Paciente[] = [];
      for (const paciente of pacientesPrueba) {
        const nuevoPaciente = await createPaciente(paciente);
        pacientesCreados.push(nuevoPaciente);
      }
      setData(prev => ({ ...prev, pacientes: pacientesCreados }));
      addNotification(`${pacientesCreados.length} pacientes creados exitosamente`, 'success');
    } catch (error) {
      addNotification(`Error al crear pacientes: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const poblarHistorias = async () => {
    if (data.pacientes.length === 0) {
      addNotification('Primero debes crear pacientes', 'warning');
      return;
    }

    setLoading(true);
    try {
      const historiasCreadas: HistoriaClinica[] = [];
      const fechas = ['2024-01-15', '2024-01-20', '2024-02-01', '2024-02-10', '2024-02-15'];
      
      for (let i = 0; i < Math.min(data.pacientes.length, 5); i++) {
        const historia: Omit<HistoriaClinica, 'id'> = {
          paciente_id: data.pacientes[i].id!,
          fecha: fechas[i]
        };
        const nuevaHistoria = await createHistoria(historia);
        historiasCreadas.push(nuevaHistoria);
      }
      
      setData(prev => ({ ...prev, historias: historiasCreadas }));
      addNotification(`${historiasCreadas.length} historias clínicas creadas exitosamente`, 'success');
    } catch (error) {
      addNotification(`Error al crear historias: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const poblarVisitas = async () => {
    if (data.historias.length === 0) {
      addNotification('Primero debes crear historias clínicas', 'warning');
      return;
    }

    setLoading(true);
    try {
      const visitasCreadas: Visita[] = [];
      const especialidades = ['Cardiología', 'Pediatría', 'Traumatología', 'Dermatología', 'Neurología'];
      const evaluaciones = ['Estable', 'Urgente', 'Crítico', 'Leve', 'Moderado'];
      const prediagnosticos = ['Hipertensión', 'Gripe', 'Fractura', 'Dermatitis', 'Migraña'];
      
      for (let i = 0; i < Math.min(data.historias.length, 5); i++) {
        const visita: Omit<Visita, 'id'> = {
          historia_id: data.historias[i].id!,
          hora_entrada: `2024-01-${15 + i}T${9 + i}:00:00`,
          evaluacion_triaje: evaluaciones[i % evaluaciones.length],
          prediagnostico: prediagnosticos[i % prediagnosticos.length],
          especialidad: especialidades[i % especialidades.length],
          numero_visita: i + 1
        };
        const nuevaVisita = await createVisita(visita);
        visitasCreadas.push(nuevaVisita);
      }
      
      setData(prev => ({ ...prev, visitas: visitasCreadas }));
      addNotification(`${visitasCreadas.length} visitas creadas exitosamente`, 'success');
    } catch (error) {
      addNotification(`Error al crear visitas: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const poblarDiagnosticos = async () => {
    if (data.visitas.length === 0) {
      addNotification('Primero debes crear visitas', 'warning');
      return;
    }

    setLoading(true);
    try {
      const diagnosticosCreados: Diagnostico[] = [];
      const diagnosticos = ['Hipertensión arterial', 'Gripe estacional', 'Fractura de radio', 'Dermatitis atópica', 'Migraña crónica'];
      const resultados = ['Normal', 'Anormal', 'Requiere seguimiento', 'Estable', 'Mejoría'];
      const informes = [
        'Paciente presenta presión arterial elevada. Se recomienda dieta baja en sodio y ejercicio regular.',
        'Síntomas de gripe. Reposo y medicación sintomática.',
        'Fractura confirmada por radiografía. Inmovilización requerida.',
        'Erupción cutánea característica. Tratamiento tópico indicado.',
        'Cefalea intensa. Evaluación neurológica completa.'
      ];
      
      for (let i = 0; i < Math.min(data.visitas.length, 5); i++) {
        const diagnostico: Omit<Diagnostico, 'id'> = {
          visita_id: data.visitas[i].id!,
          diagnostico: diagnosticos[i % diagnosticos.length],
          resultado_rppg: resultados[i % resultados.length],
          informe_prediagnostico: informes[i % informes.length]
        };
        const nuevoDiagnostico = await createDiagnostico(diagnostico);
        diagnosticosCreados.push(nuevoDiagnostico);
      }
      
      setData(prev => ({ ...prev, diagnosticos: diagnosticosCreados }));
      addNotification(`${diagnosticosCreados.length} diagnósticos creados exitosamente`, 'success');
    } catch (error) {
      addNotification(`Error al crear diagnósticos: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const poblarTodo = async () => {
    setLoading(true);
    try {
      await poblarDoctores();
      await poblarPacientes();
      await poblarHistorias();
      await poblarVisitas();
      await poblarDiagnosticos();
      await cargarDatos();
      addNotification('Base de datos poblada completamente', 'success');
    } catch (error) {
      addNotification(`Error al poblar base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestor de Datos - SignaApi</h2>
      


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Cargar Datos Actuales
        </button>
        
        <button
          onClick={poblarDoctores}
          disabled={loading}
          className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Crear Doctores
        </button>
        
        <button
          onClick={poblarPacientes}
          disabled={loading}
          className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Crear Pacientes
        </button>
        
        <button
          onClick={poblarHistorias}
          disabled={loading}
          className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Crear Historias
        </button>
        
        <button
          onClick={poblarVisitas}
          disabled={loading}
          className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Crear Visitas
        </button>
        
        <button
          onClick={poblarDiagnosticos}
          disabled={loading}
          className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Crear Diagnósticos
        </button>
        
        <button
          onClick={poblarTodo}
          disabled={loading}
          className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 md:col-span-2 lg:col-span-3"
        >
          Poblar Base de Datos Completa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Doctores</h3>
          <p className="text-2xl font-bold text-blue-600">{data.doctores.length}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Pacientes</h3>
          <p className="text-2xl font-bold text-green-600">{data.pacientes.length}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Historias</h3>
          <p className="text-2xl font-bold text-yellow-600">{data.historias.length}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Visitas</h3>
          <p className="text-2xl font-bold text-purple-600">{data.visitas.length}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Diagnósticos</h3>
          <p className="text-2xl font-bold text-red-600">{data.diagnosticos.length}</p>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Procesando...</p>
        </div>
      )}
    </div>
  );
};

export default DataManager; 
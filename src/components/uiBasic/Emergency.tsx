"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "../tables/Pagination";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Collapse } from "react-collapse";

const Emergency = () => {
  // Estado para manejar el modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState(""); // Estado para el buscador
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [timeRange, setTimeRange] = useState(["00:00", "23:59"]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const toggleCollapse = () => {
    setIsCollapseOpen(!isCollapseOpen);
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  // Actualizar la hora actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Datos de prueba
  const patients = [
    {
      id: 1,
      name: "Juan Pérez",
      status: "Rojo",
      idNumber: "12345678",
      age: 45,
      report: "Informe detallado del paciente Juan Pérez.",
      time: "08:30 AM",
      doctor: "Dr. Carlos García",
      specialty: "Cardiología",
    },
    {
      id: 2,
      name: "María López",
      status: "Naranja",
      idNumber: "87654321",
      age: 32,
      report: "Informe detallado del paciente María López.",
      time: "09:15 AM",
      doctor: "Dra. Ana Torres",
      specialty: "Pediatría",
    },
    {
      id: 3,
      name: "Carlos García",
      status: "Amarillo",
      idNumber: "11223344",
      age: 60,
      report: "Informe detallado del paciente Carlos García.",
      time: "10:00 AM",
      doctor: "Dr. Luis Gómez",
      specialty: "Traumatología",
    },
    {
      id: 4,
      name: "Ana Torres",
      status: "Verde",
      idNumber: "44556677",
      age: 28,
      report: "Informe detallado del paciente Ana Torres.",
      time: "10:45 AM",
      doctor: "Dra. María López",
      specialty: "Dermatología",
    },
    {
      id: 5,
      name: "Luis Gómez",
      status: "Azul",
      idNumber: "99887766",
      age: 50,
      report: "Informe detallado del paciente Luis Gómez.",
      time: "11:30 AM",
      doctor: "Dr. Juan Pérez",
      specialty: "Neurología",
    },
    {
      id: 6,
      name: "Pedro Martínez",
      status: "Rojo",
      idNumber: "22334455",
      age: 40,
      report: "Informe detallado del paciente Pedro Martínez.",
      time: "12:15 PM",
      doctor: "Dr. José Fernández",
      specialty: "Oncología",
    },
    {
      id: 7,
      name: "Lucía Gómez",
      status: "Naranja",
      idNumber: "33445566",
      age: 35,
      report: "Informe detallado del paciente Lucía Gómez.",
      time: "01:00 PM",
      doctor: "Dra. Laura Sánchez",
      specialty: "Ginecología",
    },
    {
      id: 8,
      name: "Miguel Torres",
      status: "Amarillo",
      idNumber: "44556677",
      age: 50,
      report: "Informe detallado del paciente Miguel Torres.",
      time: "02:30 PM",
      doctor: "Dr. Andrés López",
      specialty: "Urología",
    },
    {
      id: 9,
      name: "Sofía Ramírez",
      status: "Verde",
      idNumber: "55667788",
      age: 29,
      report: "Informe detallado del paciente Sofía Ramírez.",
      time: "03:45 PM",
      doctor: "Dra. Paula Martínez",
      specialty: "Pediatría",
    },
    {
      id: 10,
      name: "Javier Hernández",
      status: "Azul",
      idNumber: "66778899",
      age: 60,
      report: "Informe detallado del paciente Javier Hernández.",
      time: "04:15 PM",
      doctor: "Dr. Manuel García",
      specialty: "Geriatría",
    },
  ];

  // Filtrar pacientes por cédula
  useEffect(() => {
    if (searchQuery) {
      setFilteredPatients(
        patients.filter((patient) =>
          patient.idNumber.includes(searchQuery.trim())
        )
      );
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery]);

  // Función para abrir el modal
  const openModal = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(false);
  };

  // Función para obtener el color de fondo según el estado
  const getRowColor = (status, isDarkMode) => {
    const colors = {
      Rojo: isDarkMode ? "bg-red-700" : "bg-red-100",
      Naranja: isDarkMode ? "bg-orange-700" : "bg-orange-100",
      Amarillo: isDarkMode ? "bg-yellow-600" : "bg-yellow-100",
      Verde: isDarkMode ? "bg-green-700" : "bg-green-100",
      Azul: isDarkMode ? "bg-blue-700" : "bg-blue-100",
      Default: isDarkMode ? "bg-gray-700" : "bg-gray-100",
    };
    return colors[status] || colors.Default;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAgeChange = (range) => {
    setAgeRange(range);
  };

  const handleTimeChange = (range) => {
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    };
    setTimeRange([formatTime(range[0]), formatTime(range[1])]);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const calculateWaitingTime = (arrivalTime) => {
    const [hours, minutes] = arrivalTime.split(/[: ]/).map(Number);
    const isPM = arrivalTime.includes("PM");
    const arrivalDate = new Date();
    arrivalDate.setHours(isPM && hours !== 12 ? hours + 12 : hours % 12, minutes, 0);

    const diffInMs = currentTime - arrivalDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffHours = Math.floor(diffInMinutes / 60);
    const diffMinutes = diffInMinutes % 60;

    return `${diffHours}h ${diffMinutes}m`;
  };

  const filteredAndPaginatedPatients = filteredPatients
    .filter(
      (patient) =>
        (!selectedStatus || patient.status === selectedStatus) &&
        (!selectedSpecialty || patient.specialty === selectedSpecialty) &&
        patient.age >= ageRange[0] &&
        patient.age <= ageRange[1] &&
        patient.time >= timeRange[0] &&
        patient.time <= timeRange[1]
    )
    .slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage);

  return (
    
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-800">

    
      {/* Apartado de explicación de colores y reloj */}
      <div className="p-4 flex justify-between gap-6">
        {/* Reloj */}
        <div className="flex items-center justify-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            {currentTime.toLocaleTimeString()}
          </h2>
        </div>

        {/* Buscador */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar por cédula"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full lg:w-64 text-gray-800 dark:text-white dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <button
        onClick={toggleCollapse}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Filtros
      </button>
      </div>

      {/* Filtros */}
     
    

      <Collapse isOpened={isCollapseOpen}>
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className=" flex gap-4">
        <div className="flex">
          <div  className="p-3 bg-gray-800 rounded-lg m-5">
          <h3 className="text-gray-200">Filtrar por estatus</h3>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg w-full lg:w-64 text-gray-800 dark:text-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Todos</option>
            <option value="Rojo">Rojo</option>
            <option value="Naranja">Naranja</option>
            <option value="Amarillo">Amarillo</option>
            <option value="Verde">Verde</option>
            <option value="Azul">Azul</option>
          </select>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg m-5">
          <h3 className="text-gray-200">Filtrar por especialidad</h3>
          <select
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
            className="px-4 py-2 border rounded-lg w-full lg:w-64 text-gray-800 dark:text-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Todas</option>
            <option value="Cardiología">Cardiología</option>
            <option value="Pediatría">Pediatría</option>
            <option value="Traumatología">Traumatología</option>
            <option value="Dermatología">Dermatología</option>
            <option value="Neurología">Neurología</option>
            <option value="Oncología">Oncología</option>
            <option value="Ginecología">Ginecología</option>
            <option value="Urología">Urología</option>
            <option value="Geriatría">Geriatría</option>
          </select>
        </div>
      </div>
        </div>
       <div className="p-3 bg-gray-800 rounded-lg m-2">
          <h3 className="text-gray-200 text-sm mb-2">Filtrar por rango de edad</h3>
          <Slider
            className="w-min"
            range
            min={0}
            max={120}
            defaultValue={[0, 100]}
            onChange={handleAgeChange}
          />
         <div>
         <div className="mt-2 text-gray-700 dark:text-white">
            {ageRange[0]} - {ageRange[1]}
          </div>
         </div>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg mx-2">
          <h3 className=" text-gray-200" >Filtrar por rango de hora</h3>

          <Slider
            range
            min={0}
            max={1440}
            step={15}
            defaultValue={[0, 1440]}
            onChange={(values) => handleTimeChange(values)}
          />
          <div className="mt-2 text-gray-700 dark:text-white">
            {timeRange[0]} - {timeRange[1]}
          </div>
          </div>

        </div>
      </Collapse>

      {/* Tabla */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            {/* Encabezado de la tabla */}
            <TableHeader className="border-b border-gray-100 dark:border-gray-700">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-xl text-gray-500 text-start text-theme-xs dark:text-gray-100"
                >
                  Paciente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-xl text-gray-500 text-start text-theme-xs dark:text-gray-100"
                >
                  Cédula
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-xl text-gray-500 text-start text-theme-xs dark:text-gray-100"
                >
                  Edad
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-xl text-gray-500 text-start text-theme-xs dark:text-gray-100"
                >
                  Tiempo de Espera
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-xl text-gray-500 text-start text-theme-xs dark:text-gray-100"
                >
                  Doctor y Especialidad
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-xl text-gray-500 text-start text-theme-xs dark:text-gray-100"
                >
                  Informe
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Cuerpo de la tabla */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredAndPaginatedPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className={`${getRowColor(
                    patient.status,
                    true // Forzar modo oscuro para la tabla
                  )}`}
                >
                  <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">
                    {patient.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">
                    {patient.idNumber}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">
                    {patient.age}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">
                    <div>
                      <span className="block text-lg font-bold text-white-500">
                        {calculateWaitingTime(patient.time)}
                      </span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        Hora de llegada: {patient.time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">
                    <div>
                      <span className="block text-base font-bold">
                        {patient.specialty}
                      </span>
                      <span className="block text-sm">{patient.doctor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <button
                      onClick={() => openModal(patient)}
                      className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Ver Informe
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
     <div className="m-5">
      {/* Paginación */}
      <Pagination 
        currentPage={currentPage}
        totalPages={Math.ceil(filteredPatients.length / patientsPerPage)}
        onPageChange={handlePageChange}
      />
      </div>
    </div>
  );
};

export default Emergency;
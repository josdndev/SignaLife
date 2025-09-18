"use client";

import React, { useEffect, useState } from "react";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { getPacientes, getVisitas } from "@/functions/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Patient {
  bed: string;
  name: string | null;
  idNumber: string | null;
  priority: string | null;
  hospitalizedTime: string | null;
  visitaId?: number;
  pacienteId?: number | null;
}

interface Room {
  id: number;
  name: string;
  patients: Patient[];
}

interface SelectedPatient {
  roomId: number;
  bedIndex: number;
}

const Camas = () => {
  const [expandedRoom, setExpandedRoom] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [monitoringPatient, setMonitoringPatient] = useState<Patient | null>(null);
  const [renaming, setRenaming] = useState({ type: null as string | null, id: null as number | null, name: "" });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, type: null as string | null, id: null as number | { roomId: number; bedIndex: number } | null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pacientes = await getPacientes();
        const visitas = await getVisitas();
        
        // Create rooms from API data - each room has 5 beds
        const roomsData: Room[] = [];
        let roomId = 1;
        
        for (let i = 0; i < visitas.length; i += 5) {
          const room: Room = {
            id: roomId++,
            name: `Habitación ${roomId}`,
            patients: visitas.slice(i, i + 5).map((visita, idx) => {
              const paciente = pacientes.find((p) => p.id === visita.historia_id);
              return {
                bed: `Cama ${idx + 1}`,
                name: paciente?.nombre || null,
                idNumber: paciente?.cedula || null,
                priority: visita.evaluacion_triaje || null,
                hospitalizedTime: visita.hora_entrada || null,
                visitaId: visita.id,
                pacienteId: paciente?.id || null,
              };
            }),
          };
          roomsData.push(room);
        }
        
        setRooms(roomsData);
      } catch (e) {
        console.error("Error fetching data:", e);
        setRooms([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleRoom = (roomId: number) => {
    setExpandedRoom((prev) => (prev === roomId ? null : roomId));
  };

  // Filter rooms based on search term (patient ID number)
  const filteredRooms = rooms.filter(room => 
    room.patients.some(patient => 
      patient.idNumber && patient.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "Rojo":
        return "bg-red-500 text-white";
      case "Naranja":
        return "bg-orange-500 text-white";
      case "Amarillo":
        return "bg-yellow-500 text-black";
      case "Verde":
        return "bg-green-500 text-white";
      case "Azul":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const dischargePatient = (roomId: number, bedIndex: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              patients: room.patients.map((patient, index) =>
                index === bedIndex
                  ? {
                      bed: patient.bed,
                      name: null,
                      idNumber: null,
                      priority: null,
                      hospitalizedTime: null,
                    }
                  : patient
              ),
            }
          : room
      )
    );
  };

  const deleteBed = (roomId: number, bedIndex: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              patients: room.patients.map((patient, index) =>
                index === bedIndex
                  ? {
                      bed: patient.bed,
                      name: null,
                      idNumber: null,
                      priority: null,
                      hospitalizedTime: null,
                    }
                  : patient
              ),
            }
          : room
      )
    );
  };

  const deleteRoom = (roomId: number) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
  };

  const renameEntity = (type: string, id: number, newName: string) => {
    if (type === "room") {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === id ? { ...room, name: newName } : room
        )
      );
    }
  };

  const openMoveModal = (roomId: number, bedIndex: number) => {
    const patientToMove = rooms
      .find((room) => room.id === roomId)
      ?.patients[bedIndex];

    if (!patientToMove?.name) return alert("No hay paciente para mover.");

    setSelectedPatient({ roomId, bedIndex });
    setModalVisible(true);
  };

  const movePatientToBed = (targetRoomId: number, targetBedIndex: number) => {
    if (!selectedPatient) return;
    
    const { roomId, bedIndex } = selectedPatient;
    const patientToMove = rooms
      .find((room) => room.id === roomId)
      ?.patients[bedIndex];

    if (!patientToMove) return;

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            patients: room.patients.map((patient, index) =>
              index === bedIndex
                ? {
                    bed: patient.bed,
                    name: null,
                    idNumber: null,
                    priority: null,
                    hospitalizedTime: null,
                  }
                : patient
            ),
          };
        } else if (room.id === targetRoomId) {
          return {
            ...room,
            patients: room.patients.map((patient, index) =>
              index === targetBedIndex
                ? {
                    ...patientToMove,
                    bed: patient.bed,
                  }
                : patient
            ),
          };
        }
        return room;
      })
    );

    setModalVisible(false);
    setSelectedPatient(null);
  };

  const handleContextMenu = (e: React.MouseEvent, type: string, id: number | { roomId: number; bedIndex: number }) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, type, id });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
  };

  const addRoom = () => {
    const newRoomId = rooms.length + 1;
    setRooms((prevRooms) => [
      ...prevRooms,
      {
        id: newRoomId,
        name: `Habitación ${newRoomId}`,
        patients: Array.from({ length: 5 }, (_, i) => ({
          bed: `Cama ${i + 1}`,
          name: null,
          idNumber: null,
          priority: null,
          hospitalizedTime: null,
        })),
      },
    ]);
  };

  const addBed = (roomId: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              patients: [
                ...room.patients,
                {
                  bed: `Cama ${room.patients.length + 1}`,
                  name: null,
                  idNumber: null,
                  priority: null,
                  hospitalizedTime: null,
                },
              ],
            }
          : room
      )
    );
  };

  const openMonitoring = (patient: Patient) => {
    setMonitoringPatient(patient);
  };

  const closeMonitoring = () => {
    setMonitoringPatient(null);
  };

  const generateRealTimeChartData = () => {
    const labels = Array.from({ length: 20 }, (_, i) => i + 1);
    return {
      labels,
      datasets: [
        {
          label: "Frecuencia Cardíaca",
          data: labels.map(() => Math.floor(Math.random() * (120 - 60 + 1)) + 60),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Presión Arterial",
          data: labels.map(() => Math.floor(Math.random() * (140 - 90 + 1)) + 90),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
        {
          label: "Saturación de Oxígeno",
          data: labels.map(() => Math.floor(Math.random() * (100 - 90 + 1)) + 90),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    };
  };

  return (
    <div className="p-4" onClick={closeContextMenu}>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por número de cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Add Room Button */}
      <button
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        onClick={addRoom}
      >
        Agregar Habitación
      </button>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRooms.map((room) => (
                    <div
                      key={room.id}
              className="border border-gray-300 rounded-lg"
                      onContextMenu={(e) => handleContextMenu(e, "room", room.id)}
                    >
                      <DropdownItem
                        tag="button"
                        onClick={() => toggleRoom(room.id)}
                baseClassName="block w-full text-left px-4 py-3 text-lg font-bold text-white bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-all duration-300"
                      >
                <div className="flex justify-between items-center">
                  <span>{room.name}</span>
                        <div className="flex">
                          {room.patients.map((patient, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 m-1 rounded-full ${getPriorityColor(
                                patient.priority
                              )}`}
                            ></div>
                          ))}
                  </div>
                        </div>
                      </DropdownItem>
                      {expandedRoom === room.id && (
                <div className="overflow-x-auto bg-white">
                  <table className="w-full border-collapse">
                            <thead>
                      <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Cama</th>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Cédula</th>
                        <th className="px-4 py-2 text-left">Prioridad</th>
                        <th className="px-4 py-2 text-left">Tiempo Hospitalizado</th>
                                <th className="px-4 py-2 text-left">Monitoreo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {room.patients.map((patient, i) => (
                                <tr
                                  key={i}
                                  onContextMenu={(e) =>
                                    handleContextMenu(e, "bed", { roomId: room.id, bedIndex: i })
                                  }
                          className={`hover:bg-gray-50 transition-all duration-300 ${
                            patient.priority ? getPriorityColor(patient.priority) : ""
                          }`}
                                >
                                  <td className="px-4 py-2">{patient.bed}</td>
                                  <td className="px-4 py-2">
                                    {patient.name || "Vacío"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {patient.idNumber || "N/A"}
                                  </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(patient.priority)}`}>
                              {patient.priority || "N/A"}
                            </span>
                          </td>
                                  <td className="px-4 py-2">
                                    {patient.hospitalizedTime || "N/A"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {patient.name && (
                                      <button
                                        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-900"
                                        onClick={() => openMonitoring(patient)}
                                      >
                                        Monitoreo
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
      
      {contextMenu.visible && (
        <div
          className="absolute bg-white shadow-lg rounded p-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === "room" && (
            <>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  addBed(contextMenu.id as number);
                  closeContextMenu();
                }}
              >
                Agregar Cama
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  deleteRoom(contextMenu.id as number);
                  closeContextMenu();
                }}
              >
                Eliminar Habitación
              </button>
            </>
          )}
          {contextMenu.type === "bed" && (
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => {
                const bedInfo = contextMenu.id as { roomId: number; bedIndex: number };
                deleteBed(bedInfo.roomId, bedInfo.bedIndex);
                closeContextMenu();
              }}
            >
              Eliminar Cama
            </button>
          )}
        </div>
      )}
      
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Seleccionar Cama</h2>
            <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {rooms.map((room) =>
                room.patients.map((patient, index) => (
                  <button
                    key={`${room.id}-${index}`}
                    className={`p-2 border rounded ${
                      !patient.name
                        ? "bg-green-500 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!!patient.name}
                    onClick={() => movePatientToBed(room.id, index)}
                  >
                    {room.name} - {patient.bed}
                  </button>
                ))
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              onClick={() => setModalVisible(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {monitoringPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              Monitoreo de {monitoringPatient.name}
            </h2>
            <p>Cédula: {monitoringPatient.idNumber}</p>
            <p>Cama: {monitoringPatient.bed}</p>
            <p>Tiempo Hospitalizado: {monitoringPatient.hospitalizedTime}</p>
            <div className="mt-4">
              <Line data={generateRealTimeChartData()} />
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              onClick={closeMonitoring}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {renaming.type && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Renombrar</h2>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={renaming.name}
              onChange={(e) =>
                setRenaming((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={() => {
                if (renaming.type && renaming.id) {
                renameEntity(renaming.type, renaming.id, renaming.name);
                }
                setRenaming({ type: null, id: null, name: "" });
              }}
            >
              Guardar
            </button>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              onClick={() => setRenaming({ type: null, id: null, name: "" })}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camas;
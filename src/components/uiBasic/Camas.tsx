"use client";

import React, { useEffect, useState } from "react";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { getPacientes, getVisitas } from "@/functions/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Camas = () => {
  const [expandedRoom, setExpandedRoom] = useState(null); // Solo una habitación expandida
  const [expandedFloor, setExpandedFloor] = useState(null); // Solo un piso expandido
  const [rooms, setRooms] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      floor: Math.floor(i / 5) + 1, // Agrupar habitaciones por piso (5 habitaciones por piso)
      name: `Habitación ${i + 1}`,
      patients: [
        {
          bed: `Cama ${i * 5 + 1}`,
          name: "Juan Pérez",
          idNumber: "12345678",
          priority: "Rojo",
          hospitalizedTime: "3 días",
        },
        {
          bed: `Cama ${i * 5 + 2}`,
          name: "María López",
          idNumber: "87654321",
          priority: "Naranja",
          hospitalizedTime: "1 día",
        },
        {
          bed: `Cama ${i * 5 + 3}`,
          name: null, // Cama vacía
          idNumber: null,
          priority: null,
          hospitalizedTime: null,
        },
        {
          bed: `Cama ${i * 5 + 4}`,
          name: "Ana Torres",
          idNumber: "78912345",
          priority: "Amarillo",
          hospitalizedTime: "2 días",
        },
        {
          bed: `Cama ${i * 5 + 5}`,
          name: null, // Cama vacía
          idNumber: null,
          priority: null,
          hospitalizedTime: null,
        },
      ],
    }))
  );

  const [loading, setLoading] = useState(true);
  const [apiRooms, setApiRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pacientes = await getPacientes();
        const visitas = await getVisitas();
        // Simular habitaciones: cada visita es una cama, agrupadas por piso (por ejemplo, cada 5 visitas un piso)
        const roomsData = [];
        let roomId = 1;
        let floor = 1;
        for (let i = 0; i < visitas.length; i += 5) {
          const room = {
            id: roomId++,
            floor: floor++,
            name: `Habitación ${roomId}`,
            patients: visitas.slice(i, i + 5).map((visita, idx) => {
              const paciente = pacientes.find((p) => p.id === visita.historia_id || p.id === visita.paciente_id);
              return {
                bed: `Cama ${idx + 1}`,
                name: paciente?.nombre || "-",
                idNumber: paciente?.cedula || "-",
                priority: visita.evaluacion_triaje || "-",
                hospitalizedTime: visita.hora_entrada || "-",
              };
            }),
          };
          roomsData.push(room);
        }
        setApiRooms(roomsData);
        setRooms(roomsData);
        setFloors(Array.from(new Set(roomsData.map((room) => room.floor))));
      } catch (e) {
        setApiRooms([]);
        setRooms([]);
        setFloors([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [monitoringPatient, setMonitoringPatient] = useState(null);
  const [renaming, setRenaming] = useState({ type: null, id: null, name: "" });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, type: null, id: null });
  const [floors, setFloors] = useState(Array.from(new Set(rooms.map((room) => room.floor))));

  const toggleRoom = (roomId) => {
    setExpandedRoom((prev) => (prev === roomId ? null : roomId)); // Alternar entre expandir y colapsar habitaciones
  };

  const toggleFloor = (floorId) => {
    setExpandedFloor((prev) => (prev === floorId ? null : floorId)); // Alternar entre expandir y colapsar pisos
  };

  const getPriorityColor = (priority) => {
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

  const dischargePatient = (roomId, bedIndex) => {
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

  const deleteBed = (roomId, bedIndex) => {
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

  const deleteRoom = (roomId) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
  };

  const deleteFloor = (floorId) => {
    setRooms((prevRooms) => prevRooms.filter((room) => room.floor !== floorId));
    setFloors((prevFloors) => prevFloors.filter((floor) => floor !== floorId));
  };

  const renameEntity = (type, id, newName) => {
    if (type === "room") {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === id ? { ...room, name: newName } : room
        )
      );
    } else if (type === "floor") {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.floor === id ? { ...room, floorName: newName } : room
        )
      );
    }
  };

  const openMoveModal = (roomId, bedIndex) => {
    const patientToMove = rooms
      .find((room) => room.id === roomId)
      .patients[bedIndex];

    if (!patientToMove.name) return alert("No hay paciente para mover.");

    setSelectedPatient({ roomId, bedIndex });
    setModalVisible(true);
  };

  const movePatientToBed = (targetRoomId, targetBedIndex) => {
    const { roomId, bedIndex } = selectedPatient;
    const patientToMove = rooms
      .find((room) => room.id === roomId)
      .patients[bedIndex];

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

  const handleContextMenu = (e, type, id) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, type, id });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
  };

  const addFloor = () => {
    const newFloor = floors.length + 1;
    setFloors((prevFloors) => [...prevFloors, newFloor]);
  };

  const addRoom = (floorId) => {
    const newRoomId = rooms.length + 1;
    setRooms((prevRooms) => [
      ...prevRooms,
      {
        id: newRoomId,
        floor: floorId,
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

  const addBed = (roomId) => {
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

  const openMonitoring = (patient) => {
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
      <button
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        onClick={addFloor}
      >
        Agregar Piso
      </button>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        floors.map((floor) => (
          <div
            key={floor}
            className="mb-6"
            onContextMenu={(e) => handleContextMenu(e, "floor", floor)}
          >
            <DropdownItem
              tag="button"
              onClick={() => toggleFloor(floor)}
              baseClassName="block w-full text-left px-4 py-2 text-lg font-bold text-white border-b border-gray-300 hover:bg-blue-700 transition-all duration-300"
            >
              Piso {floor}
            </DropdownItem>
            {expandedFloor === floor && (
              <div className="flex flex-col gap-4 mt-2">
                {rooms
                  .filter((room) => room.floor === floor)
                  .map((room) => (
                    <div
                      key={room.id}
                      className="border-b-1 ml-6"
                      onContextMenu={(e) => handleContextMenu(e, "room", room.id)}
                    >
                      <DropdownItem
                        tag="button"
                        onClick={() => toggleRoom(room.id)}
                        baseClassName="block w-full text-left pt-2 text-lg font-bold text-white border-b items-center flex border-gray-300 hover:bg-blue-700 transition-all duration-300"
                      >
                        {room.name}
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
                      </DropdownItem>
                      {expandedRoom === room.id && (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse box-border">
                            <thead>
                              <tr className="text-gray-200 bg-gray-800 bg-opacity-20">
                                <th className="px-4 py-2 text-left">Cama</th>
                                <th className="text-xl font-bold px-4 py-2 text-left">
                                  Nombre
                                </th>
                                <th className="text-xl font-bold px-4 py-2 text-left">
                                  Cédula
                                </th>
                                <th className="text-xl font-bold px-4 py-2 text-left">
                                  Tiempo Hospitalizado
                                </th>
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
                                  className={`hover:opacity-90 transition-all duration-300 ${getPriorityColor(
                                    patient.priority
                                  )}`}
                                >
                                  <td className="px-4 py-2">{patient.bed}</td>
                                  <td className="px-4 py-2">
                                    {patient.name || "Vacío"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {patient.idNumber || "N/A"}
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
          </div>
        ))
      )}
      {contextMenu.visible && (
        <div
          className="absolute bg-white shadow-lg rounded p-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === "floor" && (
            <>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  addRoom(contextMenu.id);
                  closeContextMenu();
                }}
              >
                Agregar Habitación
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  deleteFloor(contextMenu.id);
                  closeContextMenu();
                }}
              >
                Eliminar Piso
              </button>
            </>
          )}
          {contextMenu.type === "room" && (
            <>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  addBed(contextMenu.id);
                  closeContextMenu();
                }}
              >
                Agregar Cama
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  deleteRoom(contextMenu.id);
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
                deleteBed(contextMenu.id.roomId, contextMenu.id.bedIndex);
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
                renameEntity(renaming.type, renaming.id, renaming.name);
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
import type { VisitaEnriched } from "@/lib/clinicalData";

export const EMERGENCY_BEDS_PER_ROOM = 5;
const EMERGENCY_BOARD_STORAGE_KEY = "signalife.emergency.board.v1";
const EMERGENCY_BOARD_UPDATED_EVENT = "signalife:emergency-board-updated";

export type EmergencyVisitStatus = "waiting" | "in_bed" | "attended";

export type EmergencyBoardRecord = {
  visitaId: number;
  status: EmergencyVisitStatus;
  bedCode?: string;
  updatedAt: string;
};

export type EmergencyVisit = VisitaEnriched & {
  board: EmergencyBoardRecord;
};

export type BedSlot = {
  roomNumber: number;
  bedNumber: number;
  bedCode: string;
};

const STATUS_PRIORITY: Record<EmergencyVisitStatus, number> = {
  waiting: 0,
  in_bed: 1,
  attended: 2,
};

const TRIAGE_PRIORITY: Record<string, number> = {
  rojo: 0,
  naranja: 1,
  amarillo: 2,
  verde: 3,
  azul: 4,
};

function isEmergencyVisitStatus(value: unknown): value is EmergencyVisitStatus {
  return value === "waiting" || value === "in_bed" || value === "attended";
}

function buildDefaultRecord(visitaId: number, updatedAt?: string): EmergencyBoardRecord {
  return {
    visitaId,
    status: "waiting",
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

function parseRecord(raw: unknown): EmergencyBoardRecord | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const value = raw as Partial<EmergencyBoardRecord>;
  if (typeof value.visitaId !== "number" || !isEmergencyVisitStatus(value.status)) {
    return null;
  }

  const record: EmergencyBoardRecord = {
    visitaId: value.visitaId,
    status: value.status,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt.trim()
        ? value.updatedAt
        : new Date().toISOString(),
  };

  if (record.status === "in_bed" && typeof value.bedCode === "string" && value.bedCode.trim()) {
    record.bedCode = value.bedCode.trim().toUpperCase();
  }

  return record;
}

function readBoard(): Record<string, EmergencyBoardRecord> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const serialized = window.localStorage.getItem(EMERGENCY_BOARD_STORAGE_KEY);
    if (!serialized) {
      return {};
    }

    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const normalized: Record<string, EmergencyBoardRecord> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      const record = parseRecord(value);
      if (record) {
        normalized[key] = record;
      }
    });

    return normalized;
  } catch (error) {
    console.error("No se pudo leer el tablero de emergencia:", error);
    return {};
  }
}

function writeBoard(board: Record<string, EmergencyBoardRecord>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(EMERGENCY_BOARD_STORAGE_KEY, JSON.stringify(board));
  window.dispatchEvent(new Event(EMERGENCY_BOARD_UPDATED_EVENT));
}

function normalizeBedCode(bedCode: string) {
  return bedCode.trim().toUpperCase();
}

function updateRecord(
  visitaId: number,
  updater: (current: EmergencyBoardRecord) => EmergencyBoardRecord
): EmergencyBoardRecord {
  const board = readBoard();
  const key = String(visitaId);
  const current = board[key] ?? buildDefaultRecord(visitaId);
  const next = updater(current);

  board[key] = next;
  writeBoard(board);
  return next;
}

export function subscribeEmergencyBoard(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleBoardUpdate = () => onChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === EMERGENCY_BOARD_STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener(EMERGENCY_BOARD_UPDATED_EVENT, handleBoardUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(EMERGENCY_BOARD_UPDATED_EVENT, handleBoardUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

export function registerEmergencyVisit(visitaId: number) {
  return updateRecord(visitaId, (current) => ({
    ...current,
    status: "waiting",
    bedCode: undefined,
    updatedAt: new Date().toISOString(),
  }));
}

export function assignVisitToBed(visitaId: number, bedCode: string) {
  const normalizedBedCode = normalizeBedCode(bedCode);
  if (!normalizedBedCode) {
    throw new Error("Debe indicar una cama válida.");
  }

  return updateRecord(visitaId, () => ({
    visitaId,
    status: "in_bed",
    bedCode: normalizedBedCode,
    updatedAt: new Date().toISOString(),
  }));
}

export function releaseVisitBed(visitaId: number) {
  return updateRecord(visitaId, (current) => ({
    ...current,
    status: "waiting",
    bedCode: undefined,
    updatedAt: new Date().toISOString(),
  }));
}

export function markVisitAttended(visitaId: number) {
  return updateRecord(visitaId, (current) => ({
    ...current,
    status: "attended",
    bedCode: undefined,
    updatedAt: new Date().toISOString(),
  }));
}

export function reopenEmergencyVisit(visitaId: number) {
  return updateRecord(visitaId, (current) => ({
    ...current,
    status: "waiting",
    bedCode: undefined,
    updatedAt: new Date().toISOString(),
  }));
}

export function attachEmergencyBoard(visitas: VisitaEnriched[]): EmergencyVisit[] {
  const board = readBoard();

  return visitas
    .filter((visita): visita is VisitaEnriched & { id: number } => typeof visita.id === "number")
    .map((visita) => {
      const record = board[String(visita.id)] ?? buildDefaultRecord(visita.id, visita.hora_entrada);
      return {
        ...visita,
        board: record,
      };
    });
}

export function getTriagePriority(triage?: string) {
  const key = (triage ?? "").toLowerCase();
  return TRIAGE_PRIORITY[key] ?? 99;
}

export function sortEmergencyVisits(visitas: EmergencyVisit[]) {
  return [...visitas].sort((left, right) => {
    const byStatus = STATUS_PRIORITY[left.board.status] - STATUS_PRIORITY[right.board.status];
    if (byStatus !== 0) {
      return byStatus;
    }

    const byTriage = getTriagePriority(left.evaluacion_triaje) - getTriagePriority(right.evaluacion_triaje);
    if (byTriage !== 0) {
      return byTriage;
    }

    const leftTime = new Date(left.hora_entrada).getTime();
    const rightTime = new Date(right.hora_entrada).getTime();
    return leftTime - rightTime;
  });
}

export function toBedCode(roomNumber: number, bedNumber: number) {
  return `CU${roomNumber}-C${bedNumber}`;
}

export function parseBedCode(value?: string): BedSlot | null {
  if (!value) return null;
  const match = value.toUpperCase().match(/^(?:CU|H)(\d+)-C(\d+)$/);
  if (!match) return null;

  const roomNumber = Number(match[1]);
  const bedNumber = Number(match[2]);
  if (!Number.isInteger(roomNumber) || !Number.isInteger(bedNumber) || roomNumber < 1 || bedNumber < 1) {
    return null;
  }

  return {
    roomNumber,
    bedNumber,
    bedCode: toBedCode(roomNumber, bedNumber),
  };
}

export function getRequiredRoomCount(
  activeVisits: number,
  occupiedBedCodes: string[],
  bedsPerRoom = EMERGENCY_BEDS_PER_ROOM
) {
  const byCapacity = Math.max(1, Math.ceil(Math.max(activeVisits, 1) / bedsPerRoom));
  const byAssignedBeds = occupiedBedCodes.reduce((currentMax, bedCode) => {
    const parsed = parseBedCode(bedCode);
    if (!parsed) return currentMax;
    return Math.max(currentMax, parsed.roomNumber);
  }, 0);

  return Math.max(byCapacity, byAssignedBeds, 1);
}

export function listBeds(roomCount: number, bedsPerRoom = EMERGENCY_BEDS_PER_ROOM): BedSlot[] {
  const beds: BedSlot[] = [];

  for (let roomNumber = 1; roomNumber <= roomCount; roomNumber += 1) {
    for (let bedNumber = 1; bedNumber <= bedsPerRoom; bedNumber += 1) {
      beds.push({
        roomNumber,
        bedNumber,
        bedCode: toBedCode(roomNumber, bedNumber),
      });
    }
  }

  return beds;
}

export function getNextAvailableBed(
  occupiedBeds: Set<string>,
  roomCount: number,
  bedsPerRoom = EMERGENCY_BEDS_PER_ROOM
) {
  const beds = listBeds(roomCount, bedsPerRoom);
  return beds.find((bed) => !occupiedBeds.has(bed.bedCode)) ?? null;
}

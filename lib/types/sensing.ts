export type NodeRole = 'TX' | 'RX';
export type NodeStatus = 'ONLINE' | 'WARNING' | 'OFFLINE' | 'ERROR';
export type ActivityType = 'Standing' | 'Walking' | 'Sitting' | 'Lying Down' | 'Fall Detected' | 'Transitioning' | 'None';
export type ZoneId = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';
export type SystemMode = 'DEMO' | 'LIVE';

export interface PersonState {
  id: string; // e.g., "P01", "P02"
  zone: ZoneId;
  x: number; // -5 to 5 (meters in room space)
  y: number; // 0 to 2 (height)
  z: number; // -5 to 5 (meters in room space)
  activity: ActivityType;
  direction: string; // e.g., "→", "↗", "←", "Static"
  confidence: number; // 0 to 100%
  fall_detected: boolean;
  fall_confidence?: number;
  velocity: number; // m/s
  trail: Array<{ x: number; y: number; z: number; timestamp: number }>;
}

export interface SensorNode {
  id: string; // "TX-01", "RX-01", "RX-02"
  role: NodeRole;
  status: NodeStatus;
  rssi: number; // dBm e.g. -48
  csi_active: boolean;
  packet_rate: number; // Hz e.g. 100
  ip_address: string;
  mac_address: string;
  chipset: string; // "ESP32-S3-DevKitC-1"
  antenna: string; // "6dBi Dual-Band Dipole"
  uptime: number; // seconds
  error_count: number;
  noise_floor: number; // dBm e.g. -92
  last_packet_ms: number;
}

export interface SignalData {
  rssi: number; // dBm average
  variance: number; // CSI variance e.g. 0.05 to 1.85
  motion: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  subcarriers: number; // 51
  sample_rate: number; // 100 Hz
  amplitude: number[]; // 51 subcarrier values
  phase: number[]; // 51 unwrapped phase values (radians)
  fft: {
    frequencies: number[]; // Doppler bins (-50 to +50 Hz)
    magnitudes: number[];
  };
  spectrogram: number[][]; // [time_slices][51 subcarriers]
  hampel_filtered: boolean;
  butterworth_filtered: boolean;
}

export interface SafetyState {
  system_state: 'SAFE' | 'ALERT' | 'DEGRADED';
  fall_detected: boolean;
  fall_person_id?: string;
  location?: ZoneId;
  confidence: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface RoomOccupancy {
  total_people: number;
  max_capacity: number;
  zone_breakdown: Record<string, number>; // e.g., { "Zone A": 1, "Zone B": 2, "Zone C": 0 }
  zone_probabilities: Record<ZoneId, number>; // 0 to 100%
  room_status: 'EMPTY' | 'OCCUPIED' | 'OVERCROWDED';
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: 'FALL' | 'ACTIVITY' | 'ZONE_CHANGE' | 'NODE_STATUS' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  person_id?: string;
  location?: string;
  message: string;
  confidence?: number;
}

export interface NormalizedSensorState {
  timestamp: number;
  formatted_time: string;
  mode: SystemMode;
  people_count: number;
  people: PersonState[];
  room: RoomOccupancy;
  nodes: SensorNode[];
  signal: SignalData;
  safety: SafetyState;
  events: SystemEvent[];
  fps: number;
}

export type ScenarioId = 
  | 'auto_cycle'
  | 'empty_room'
  | 'single_standing'
  | 'single_walking'
  | 'multi_person'
  | 'crowd'
  | 'fall_detection'
  | 'zone_transition'
  | 'room_occupancy'
  | 'elderly_care'
  | 'emergency_scenario'
  | 'signal_degraded';

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  badge: string;
  duration_sec?: number;
}

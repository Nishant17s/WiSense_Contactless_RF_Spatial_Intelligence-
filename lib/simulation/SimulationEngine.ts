import { 
  NormalizedSensorState, 
  PersonState, 
  SensorNode, 
  SignalData, 
  SafetyState, 
  RoomOccupancy, 
  SystemEvent, 
  ScenarioId, 
  ZoneId 
} from '../types/sensing';
import { formatTimestamp, getZoneFromCoordinates } from '../utils/formatters';
import { SCENARIOS } from './scenarios';

export class SimulationEngine {
  private currentScenario: ScenarioId = 'single_walking';
  private autoCycleIndex = 1; // Start from empty_room or single
  private scenarioStartTime = Date.now();
  private elapsedSec = 0;
  private fallAcknowledged = false;
  private spectrogramBuffer: number[][] = [];
  private eventLogs: SystemEvent[] = [];
  private lastAlertTime = 0;

  constructor() {
    // Pre-seed 30 slices of spectrogram data
    for (let i = 0; i < 30; i++) {
      this.spectrogramBuffer.push(new Array(51).fill(0).map(() => 0.1 + Math.random() * 0.2));
    }
    this.seedInitialEvents();
  }

  public setScenario(scenario: ScenarioId) {
    if (this.currentScenario !== scenario) {
      this.currentScenario = scenario;
      this.scenarioStartTime = Date.now();
      this.fallAcknowledged = false;
      this.addEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: formatTimestamp(),
        type: 'SYSTEM',
        severity: 'INFO',
        message: `Switched simulation scenario to: ${SCENARIOS.find(s => s.id === scenario)?.name || scenario}`,
      });
    }
  }

  public getScenario(): ScenarioId {
    return this.currentScenario;
  }

  public acknowledgeFall() {
    this.fallAcknowledged = true;
    this.addEvent({
      id: `evt-ack-${Date.now()}`,
      timestamp: formatTimestamp(),
      type: 'FALL',
      severity: 'INFO',
      message: 'Fall alert acknowledged by Command Center operator.',
    });
  }

  private seedInitialEvents() {
    const now = new Date();
    const tMinus = (sec: number) => formatTimestamp(new Date(now.getTime() - sec * 1000));
    this.eventLogs = [
      {
        id: 'evt-init-1',
        timestamp: tMinus(60),
        type: 'SYSTEM',
        severity: 'INFO',
        message: 'WiSense CSI Core initialized. 3/3 ESP32-S3 nodes linked.',
      },
      {
        id: 'evt-init-2',
        timestamp: tMinus(45),
        type: 'NODE_STATUS',
        severity: 'INFO',
        message: 'TX-01 carrier locked at 5.24 GHz (51 OFDM subcarriers @ 100 Hz).',
      },
      {
        id: 'evt-init-3',
        timestamp: tMinus(20),
        type: 'ACTIVITY',
        severity: 'INFO',
        person_id: 'P01',
        location: 'Zone B2',
        message: 'RF disturbance detected in Zone B2 (Presence verified 94.2%).',
        confidence: 94.2,
      },
    ];
  }

  private addEvent(evt: SystemEvent) {
    this.eventLogs = [evt, ...this.eventLogs.slice(0, 49)];
  }

  public generateState(activeScenarioOverride?: ScenarioId): NormalizedSensorState {
    const now = Date.now();
    let effectiveScenario = activeScenarioOverride || this.currentScenario;

    // Handle Auto Cycle
    if (effectiveScenario === 'auto_cycle') {
      const cycleTime = 12; // 12 seconds per scenario
      const totalElapsed = (now - this.scenarioStartTime) / 1000;
      const cycleList: ScenarioId[] = [
        'empty_room',
        'single_standing',
        'single_walking',
        'multi_person',
        'fall_detection',
        'zone_transition',
        'crowd',
        'elderly_care',
        'emergency_scenario',
        'signal_degraded',
      ];
      const index = Math.floor(totalElapsed / cycleTime) % cycleList.length;
      effectiveScenario = cycleList[index];
      this.elapsedSec = totalElapsed % cycleTime;
    } else {
      this.elapsedSec = (now - this.scenarioStartTime) / 1000;
    }

    // 1. Generate People State
    const people = this.calculatePeople(effectiveScenario, this.elapsedSec);
    const peopleCount = people.length;

    // 2. Check for Fall conditions
    const hasFall = people.some(p => p.fall_detected);
    const fallPerson = people.find(p => p.fall_detected);

    if (hasFall && !this.fallAcknowledged && (now - this.lastAlertTime > 8000)) {
      this.lastAlertTime = now;
      this.addEvent({
        id: `evt-fall-${now}`,
        timestamp: formatTimestamp(),
        type: 'FALL',
        severity: 'CRITICAL',
        person_id: fallPerson?.id,
        location: fallPerson?.zone,
        message: `CRITICAL SAFETY ALERT: Potential Fall Event detected in ${fallPerson?.zone || 'Zone B2'}!`,
        confidence: fallPerson?.fall_confidence || 96.4,
      });
    }

    const safety: SafetyState = {
      system_state: hasFall && !this.fallAcknowledged ? 'ALERT' : (effectiveScenario === 'signal_degraded' ? 'DEGRADED' : 'SAFE'),
      fall_detected: hasFall,
      fall_person_id: fallPerson?.id,
      location: fallPerson?.zone || (hasFall ? 'B2' : undefined),
      confidence: hasFall ? (fallPerson?.fall_confidence || 96.4) : 98.2,
      timestamp: formatTimestamp(),
      acknowledged: this.fallAcknowledged,
    };

    // 3. Compute Room Occupancy & Zone Probabilities
    const room = this.calculateRoomOccupancy(people);

    // 4. Generate Sensor Nodes Status
    const isDegraded = effectiveScenario === 'signal_degraded';
    const nodes: SensorNode[] = [
      {
        id: 'TX-01',
        role: 'TX',
        status: isDegraded ? 'WARNING' : 'ONLINE',
        rssi: isDegraded ? -62 : -46.5 + Math.sin(this.elapsedSec) * 1.2,
        csi_active: true,
        packet_rate: isDegraded ? 84 : 100,
        ip_address: '192.168.4.101',
        mac_address: '48:E7:29:A1:01:FE',
        chipset: 'ESP32-S3-DevKitC-1U',
        antenna: '6dBi Dual-Band IPEX',
        uptime: 3640 + Math.floor(this.elapsedSec),
        error_count: isDegraded ? 14 : 0,
        noise_floor: isDegraded ? -74 : -94,
        last_packet_ms: Math.floor(Math.random() * 8) + 2,
      },
      {
        id: 'RX-01',
        role: 'RX',
        status: 'ONLINE',
        rssi: -48.2 + Math.cos(this.elapsedSec * 1.3) * 1.5,
        csi_active: true,
        packet_rate: 100,
        ip_address: '192.168.4.102',
        mac_address: '48:E7:29:A1:02:AA',
        chipset: 'ESP32-S3-DevKitC-1U',
        antenna: '6dBi Dual-Band IPEX',
        uptime: 3640 + Math.floor(this.elapsedSec),
        error_count: 0,
        noise_floor: -93,
        last_packet_ms: Math.floor(Math.random() * 7) + 2,
      },
      {
        id: 'RX-02',
        role: 'RX',
        status: 'ONLINE',
        rssi: -50.1 + Math.sin(this.elapsedSec * 0.9) * 1.8,
        csi_active: true,
        packet_rate: 100,
        ip_address: '192.168.4.103',
        mac_address: '48:E7:29:A1:03:BC',
        chipset: 'ESP32-S3-DevKitC-1U',
        antenna: '6dBi Dual-Band IPEX',
        uptime: 3638 + Math.floor(this.elapsedSec),
        error_count: 0,
        noise_floor: -92,
        last_packet_ms: Math.floor(Math.random() * 9) + 2,
      },
    ];

    // 5. Generate CSI Signal & Doppler Spectrogram
    const signal = this.calculateSignal(people, effectiveScenario, this.elapsedSec);

    return {
      timestamp: now,
      formatted_time: formatTimestamp(new Date(now)),
      mode: 'DEMO',
      people_count: peopleCount,
      people,
      room,
      nodes,
      signal,
      safety,
      events: this.eventLogs,
      fps: 60,
    };
  }

  private calculatePeople(scenario: ScenarioId, t: number): PersonState[] {
    const list: PersonState[] = [];

    switch (scenario) {
      case 'empty_room':
        return [];

      case 'single_standing': {
        // Small breathing subtle sway in zone B2
        const x = 0.2 * Math.sin(t * 1.2);
        const z = 0.1 * Math.cos(t * 1.5);
        list.push({
          id: 'P01',
          zone: 'B2',
          x,
          y: 0.9,
          z,
          activity: 'Standing',
          direction: 'Static',
          confidence: 94.5 + Math.sin(t) * 1.5,
          fall_detected: false,
          velocity: 0.05,
          trail: [
            { x: x - 0.05, y: 0.9, z: z - 0.05, timestamp: Date.now() - 1000 },
            { x, y: 0.9, z, timestamp: Date.now() },
          ],
        });
        break;
      }

      case 'single_walking': {
        // Trajectory A1 (-3, -3) -> B1 (-3, 0) -> B2 (0, 0) -> C2 (0, 3) -> C3 (3, 3) and loop back
        const period = 14;
        const progress = (t % period) / period; // 0 to 1
        const theta = progress * Math.PI * 2;
        // Figure 8 or rounded circuit
        const x = 3.2 * Math.sin(theta);
        const z = 3.0 * Math.sin(theta * 2) * 0.8;
        const vx = 3.2 * Math.cos(theta) * (Math.PI * 2 / period);
        const vz = 3.0 * 2 * Math.cos(theta * 2) * 0.8 * (Math.PI * 2 / period);
        const speed = Math.sqrt(vx * vx + vz * vz);
        const zone = getZoneFromCoordinates(x, z);

        list.push({
          id: 'P01',
          zone,
          x,
          y: 0.9,
          z,
          activity: 'Walking',
          direction: vx > 0.5 ? '→' : (vx < -0.5 ? '←' : (vz > 0 ? '↓' : '↑')),
          confidence: 93.8 + Math.sin(t * 2) * 2.2,
          fall_detected: false,
          velocity: Math.max(0.6, speed),
          trail: this.generateMovingTrail(x, z, theta),
        });
        break;
      }

      case 'multi_person': {
        // P01 in Zone A (walking top), P02 in Zone B (standing center), P03 in Zone C (pacing bottom)
        // P01
        const p1x = 2.5 * Math.cos(t * 0.7);
        const p1z = -2.8 + 0.4 * Math.sin(t * 1.1);
        list.push({
          id: 'P01',
          zone: getZoneFromCoordinates(p1x, p1z),
          x: p1x,
          y: 0.9,
          z: p1z,
          activity: 'Walking',
          direction: '→',
          confidence: 92.4,
          fall_detected: false,
          velocity: 1.1,
          trail: this.generateMovingTrail(p1x, p1z, t * 0.7),
        });

        // P02
        const p2x = 0.3 * Math.sin(t * 0.4);
        const p2z = 0.2 * Math.cos(t * 0.5);
        list.push({
          id: 'P02',
          zone: 'B2',
          x: p2x,
          y: 0.9,
          z: p2z,
          activity: 'Standing',
          direction: 'Static',
          confidence: 95.1,
          fall_detected: false,
          velocity: 0.08,
          trail: [{ x: p2x, y: 0.9, z: p2z, timestamp: Date.now() }],
        });

        // P03
        const p3x = -2.8 + 1.2 * Math.sin(t * 0.9);
        const p3z = 2.6 + 0.3 * Math.cos(t * 0.8);
        list.push({
          id: 'P03',
          zone: getZoneFromCoordinates(p3x, p3z),
          x: p3x,
          y: 0.9,
          z: p3z,
          activity: 'Walking',
          direction: '←',
          confidence: 89.7,
          fall_detected: false,
          velocity: 0.95,
          trail: this.generateMovingTrail(p3x, p3z, t * 0.9),
        });
        break;
      }

      case 'crowd': {
        // 5 distinct anonymous persons
        for (let i = 0; i < 5; i++) {
          const angle = (t * (0.4 + i * 0.15)) + (i * (Math.PI * 2 / 5));
          const radius = 1.8 + (i % 3) * 1.0;
          const x = radius * Math.cos(angle);
          const z = radius * Math.sin(angle);
          list.push({
            id: `P0${i + 1}`,
            zone: getZoneFromCoordinates(x, z),
            x,
            y: 0.9,
            z,
            activity: i % 2 === 0 ? 'Walking' : 'Standing',
            direction: ['↗', '↘', '↙', '↖', '→'][i],
            confidence: 88.0 + (i * 2.1) % 8,
            fall_detected: false,
            velocity: i % 2 === 0 ? 0.9 : 0.1,
            trail: this.generateMovingTrail(x, z, angle),
          });
        }
        break;
      }

      case 'fall_detection': {
        // Person walks into Zone B2, after t = 3.5s sudden fall occurs!
        const fallPhase = t % 12;
        if (fallPhase < 3.0) {
          // Walking to center
          const x = -2.0 + (fallPhase / 3.0) * 2.0;
          const z = 0;
          list.push({
            id: 'P01',
            zone: 'B2',
            x,
            y: 0.9,
            z,
            activity: 'Walking',
            direction: '→',
            confidence: 93.5,
            fall_detected: false,
            velocity: 1.2,
            trail: this.generateMovingTrail(x, z, fallPhase),
          });
        } else if (fallPhase < 4.5) {
          // Fall in progress (interpolating height from 0.9 to 0.15)
          const fallProgress = (fallPhase - 3.0) / 1.5;
          const y = 0.9 * (1 - fallProgress) + 0.15 * fallProgress;
          list.push({
            id: 'P01',
            zone: 'B2',
            x: 0,
            y,
            z: 0.3 * fallProgress,
            activity: 'Fall Detected',
            direction: 'Fall ↓',
            confidence: 96.8,
            fall_detected: true,
            fall_confidence: 97.4,
            velocity: 2.8 * (1 - fallProgress),
            trail: [{ x: 0, y, z: 0, timestamp: Date.now() }],
          });
        } else {
          // Lying flat in Zone B2 with high critical confidence
          list.push({
            id: 'P01',
            zone: 'B2',
            x: 0.1,
            y: 0.15,
            z: 0.4,
            activity: 'Fall Detected',
            direction: 'Stationary (Floor)',
            confidence: 98.9,
            fall_detected: true,
            fall_confidence: 98.9,
            velocity: 0.0,
            trail: [{ x: 0.1, y: 0.15, z: 0.4, timestamp: Date.now() }],
          });
        }
        break;
      }

      case 'zone_transition': {
        // Fast crossing: A1 (-3.5, -3) -> B2 (0, 0) -> C3 (3.5, 3)
        const period = 8;
        const p = (t % period) / period;
        const x = -3.5 + p * 7.0;
        const z = -3.0 + p * 6.0;
        list.push({
          id: 'P01',
          zone: getZoneFromCoordinates(x, z),
          x,
          y: 0.9,
          z,
          activity: 'Walking',
          direction: '↘',
          confidence: 95.4,
          fall_detected: false,
          velocity: 1.6,
          trail: this.generateMovingTrail(x, z, p * 5),
        });
        break;
      }

      case 'room_occupancy': {
        // 4 people in Zone B (B1, B2, B3) demonstrating high density clustering
        const zones: ZoneId[] = ['B1', 'B2', 'B3', 'B2'];
        const offsets = [-2.2, 0, 2.2, 0.6];
        for (let i = 0; i < 4; i++) {
          const x = offsets[i] + 0.2 * Math.sin(t + i);
          const z = 0.1 * Math.cos(t * 1.2 + i);
          list.push({
            id: `P0${i + 1}`,
            zone: zones[i],
            x,
            y: 0.9,
            z,
            activity: i === 1 ? 'Walking' : 'Standing',
            direction: 'Static',
            confidence: 91.2 + i * 1.5,
            fall_detected: false,
            velocity: i === 1 ? 0.6 : 0.05,
            trail: [{ x, y: 0.9, z, timestamp: Date.now() }],
          });
        }
        break;
      }

      case 'elderly_care': {
        // Slow subtle movement in Zone A2
        const x = 0.8 * Math.sin(t * 0.3);
        const z = -2.2 + 0.3 * Math.cos(t * 0.25);
        list.push({
          id: 'P01',
          zone: 'A2',
          x,
          y: 0.85,
          z,
          activity: Math.sin(t * 0.2) > 0 ? 'Sitting' : 'Standing',
          direction: 'Minimal',
          confidence: 96.1,
          fall_detected: false,
          velocity: 0.15,
          trail: [{ x, y: 0.85, z, timestamp: Date.now() }],
        });
        break;
      }

      case 'emergency_scenario': {
        // Sudden collapse in Zone A3
        const fallPhase = t % 10;
        const isFallen = fallPhase > 2.5;
        const x = 2.8;
        const z = -2.6;
        list.push({
          id: 'P01',
          zone: 'A3',
          x,
          y: isFallen ? 0.15 : 0.9,
          z,
          activity: isFallen ? 'Fall Detected' : 'Walking',
          direction: isFallen ? 'Emergency Alert' : '→',
          confidence: 99.1,
          fall_detected: isFallen,
          fall_confidence: 99.4,
          velocity: isFallen ? 0 : 1.4,
          trail: [{ x, y: isFallen ? 0.15 : 0.9, z, timestamp: Date.now() }],
        });
        break;
      }

      case 'signal_degraded': {
        // 1 person walking through high noise RF environment
        const x = 1.8 * Math.sin(t * 0.8);
        const z = 1.8 * Math.cos(t * 0.8);
        list.push({
          id: 'P01',
          zone: getZoneFromCoordinates(x, z),
          x,
          y: 0.9,
          z,
          activity: 'Walking',
          direction: '↻',
          confidence: 76.5 + Math.sin(t * 4) * 8.0, // fluctuating confidence due to noise
          fall_detected: false,
          velocity: 0.8,
          trail: this.generateMovingTrail(x, z, t * 0.8),
        });
        break;
      }
    }

    return list;
  }

  private generateMovingTrail(x: number, z: number, theta: number) {
    const trail = [];
    for (let i = 4; i >= 0; i--) {
      const dt = i * 0.3;
      const prevX = x - Math.cos(theta) * dt * 0.8;
      const prevZ = z - Math.sin(theta) * dt * 0.8;
      trail.push({ x: prevX, y: 0.85, z: prevZ, timestamp: Date.now() - i * 300 });
    }
    return trail;
  }

  private calculateRoomOccupancy(people: PersonState[]): RoomOccupancy {
    const total = people.length;
    const zoneBreakdown: Record<string, number> = {
      'Zone A': 0,
      'Zone B': 0,
      'Zone C': 0,
    };

    const allZones: ZoneId[] = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    const zoneProbabilities: Record<ZoneId, number> = {} as any;

    allZones.forEach(z => {
      zoneProbabilities[z] = total === 0 ? 0 : Math.max(2, Math.random() * 8); // Baseline ambient noise
    });

    people.forEach(p => {
      const row = p.zone[0];
      if (zoneBreakdown[`Zone ${row}`] !== undefined) {
        zoneBreakdown[`Zone ${row}`]++;
      }
      zoneProbabilities[p.zone] = Math.min(100, Math.max(zoneProbabilities[p.zone] || 0, p.confidence));
    });

    return {
      total_people: total,
      max_capacity: 8,
      zone_breakdown: zoneBreakdown,
      zone_probabilities: zoneProbabilities,
      room_status: total === 0 ? 'EMPTY' : (total > 5 ? 'OVERCROWDED' : 'OCCUPIED'),
    };
  }

  private calculateSignal(people: PersonState[], scenario: ScenarioId, t: number): SignalData {
    const hasMovement = people.some(p => p.velocity > 0.4);
    const hasPeople = people.length > 0;
    const isDegraded = scenario === 'signal_degraded';

    // 51 subcarriers amplitude and phase
    const amplitude: number[] = [];
    const phase: number[] = [];
    const baseAmp = isDegraded ? 22 : 38;

    for (let k = 0; k < 51; k++) {
      const subcarrierIndex = k - 25; // -25 to +25
      const carrierRipple = Math.cos(subcarrierIndex * 0.25) * 6;
      
      // Perturbations based on people count & activities
      let perturbation = 0;
      people.forEach((p, idx) => {
        const dist = Math.sqrt(p.x * p.x + p.z * p.z);
        const f = (k + idx * 7) * 0.15 + t * (p.velocity * 3.5 + 0.8);
        perturbation += Math.sin(f) * (p.velocity > 0.4 ? 9.5 : 2.8) / (1 + dist * 0.3);
      });

      if (isDegraded) {
        perturbation += (Math.random() - 0.5) * 18;
      }

      const ampVal = Math.max(4, baseAmp + carrierRipple + perturbation);
      amplitude.push(Number(ampVal.toFixed(2)));

      // Phase unwrapped calculation (-PI to +PI modulated)
      const basePhase = (subcarrierIndex * 0.08);
      const phaseNoise = (Math.random() - 0.5) * (isDegraded ? 0.9 : 0.12);
      const dynamicPhase = basePhase + Math.sin(t * 2 + k * 0.2) * (hasMovement ? 0.85 : 0.15) + phaseNoise;
      phase.push(Number(dynamicPhase.toFixed(3)));
    }

    // FFT Doppler shift calculation (-50Hz to +50Hz in 32 bins)
    const fftFreqs: number[] = [];
    const fftMags: number[] = [];
    for (let i = -16; i <= 16; i++) {
      const freq = (i / 16) * 50; // -50 to +50 Hz
      fftFreqs.push(freq);
      
      // Doppler peak centered around human movement velocity
      let mag = 0.05 + Math.random() * 0.08;
      people.forEach(p => {
        if (p.velocity > 0.2) {
          const expectedDopplerHz = p.velocity * 12.0; // ~12Hz per m/s at 5.2GHz
          const diff = Math.abs(freq - expectedDopplerHz);
          mag += Math.exp(-(diff * diff) / 8.0) * (p.velocity * 0.9);
        }
      });
      if (isDegraded) mag += Math.random() * 0.4;
      fftMags.push(Number(mag.toFixed(3)));
    }

    // Update Spectrogram Waterfall
    this.spectrogramBuffer.shift();
    this.spectrogramBuffer.push([...amplitude.map(a => Math.min(1.0, a / 60.0))]);

    const rssi = isDegraded ? -62 : (-48.0 - (people.length * 1.5) + Math.sin(t) * 0.8);
    const variance = !hasPeople ? 0.04 : (hasMovement ? 0.88 + Math.random() * 0.3 : 0.22);

    return {
      rssi: Number(rssi.toFixed(1)),
      variance: Number((variance * (isDegraded ? 2.5 : 1)).toFixed(2)),
      motion: !hasPeople ? 'NONE' : (hasMovement ? 'HIGH' : 'LOW'),
      subcarriers: 51,
      sample_rate: 100,
      amplitude,
      phase,
      fft: {
        frequencies: fftFreqs,
        magnitudes: fftMags,
      },
      spectrogram: [...this.spectrogramBuffer],
      hampel_filtered: true,
      butterworth_filtered: true,
    };
  }
}

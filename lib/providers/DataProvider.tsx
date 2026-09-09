'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { NormalizedSensorState, ScenarioId, SystemMode, SystemEvent } from '../types/sensing';
import { SimulationEngine } from '../simulation/SimulationEngine';

interface SensingContextType {
  state: NormalizedSensorState | null;
  mode: SystemMode;
  setMode: (mode: SystemMode) => void;
  scenario: ScenarioId;
  setScenario: (scenario: ScenarioId) => void;
  acknowledgeFall: () => void;
  isLiveConnected: boolean;
  liveError: string | null;
  reconnectLive: () => void;
  dspSettings: {
    hampel: boolean;
    butterworth: boolean;
    subcarrierCount: number;
    sampleRate: number;
  };
  setDspSettings: React.Dispatch<React.SetStateAction<{
    hampel: boolean;
    butterworth: boolean;
    subcarrierCount: number;
    sampleRate: number;
  }>>;
}

const SensingContext = createContext<SensingContextType | null>(null);

export function SensingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SystemMode>('DEMO');
  const [scenario, setScenarioState] = useState<ScenarioId>('single_walking');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [dspSettings, setDspSettings] = useState({
    hampel: true,
    butterworth: true,
    subcarrierCount: 51,
    sampleRate: 100,
  });

  const simEngineRef = useRef<SimulationEngine | null>(null);
  const [currentState, setCurrentState] = useState<NormalizedSensorState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize Simulation Engine (used exclusively in DEMO mode)
  if (!simEngineRef.current) {
    simEngineRef.current = new SimulationEngine();
  }

  const setScenario = useCallback((newScenario: ScenarioId) => {
    setScenarioState(newScenario);
    simEngineRef.current?.setScenario(newScenario);
  }, []);

  const acknowledgeFall = useCallback(() => {
    if (mode === 'DEMO') {
      simEngineRef.current?.acknowledgeFall();
    } else if (currentState) {
      setCurrentState((prev) =>
        prev
          ? {
              ...prev,
              safety: {
                ...prev.safety,
                acknowledged: true,
              },
            }
          : null
      );
    }
  }, [mode, currentState]);

  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/sensing';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
        setLiveError(null);
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data) as NormalizedSensorState;
          if (data && data.nodes) {
            data.mode = 'LIVE';
            setCurrentState(data);
          }
        } catch (e) {
          console.error('Error parsing live WS data', e);
        }
      };

      ws.onerror = () => {
        setIsLiveConnected(false);
        setLiveError('Cannot connect to live WiSense gateway (ws://localhost:8000/ws/sensing). Ensure hardware backend is running.');
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
      };
    } catch (err: any) {
      setIsLiveConnected(false);
      setLiveError(err?.message || 'WebSocket initialization failed.');
    }
  }, []);

  const setMode = useCallback((newMode: SystemMode) => {
    setModeState(newMode);

    if (newMode === 'LIVE') {
      // 1. Immediately reset state so no phantom demo artifacts linger
      setCurrentState({
        timestamp: Date.now(),
        formatted_time: new Date().toLocaleTimeString(),
        mode: 'LIVE',
        people_count: 0,
        people: [],
        room: {
          total_people: 0,
          max_capacity: 8,
          zone_breakdown: { 'Zone A': 0, 'Zone B': 0, 'Zone C': 0 },
          zone_probabilities: { A1: 0, A2: 0, A3: 0, B1: 0, B2: 0, B3: 0, C1: 0, C2: 0, C3: 0 },
          room_status: 'STANDBY (AWAITING HARDWARE STREAM)',
        },
        nodes: [
          { id: 'TX-01', role: 'TX', status: 'STANDBY', rssi: -95, csi_active: false, packet_rate: 0, ip_address: '192.168.4.101', mac_address: '48:E7:29:A1:01:FE', chipset: 'ESP32-S3', antenna: '6dBi Dipole', uptime: 0, error_count: 0, noise_floor: -95, last_packet_ms: 9999 },
          { id: 'RX-01', role: 'RX', status: 'STANDBY', rssi: -95, csi_active: false, packet_rate: 0, ip_address: '192.168.4.102', mac_address: '48:E7:29:A1:02:AA', chipset: 'ESP32-S3', antenna: '6dBi Dipole', uptime: 0, error_count: 0, noise_floor: -94, last_packet_ms: 9999 },
          { id: 'RX-02', role: 'RX', status: 'STANDBY', rssi: -95, csi_active: false, packet_rate: 0, ip_address: '192.168.4.103', mac_address: '48:E7:29:A1:03:BC', chipset: 'ESP32-S3', antenna: '6dBi Dipole', uptime: 0, error_count: 0, noise_floor: -93, last_packet_ms: 9999 },
        ],
        signal: {
          rssi: -95,
          variance: 0.0,
          motion: 'NONE',
          subcarriers: 51,
          sample_rate: 0,
          amplitude: Array(51).fill(0),
          phase: Array(51).fill(0),
          fft: { frequencies: Array.from({ length: 33 }, (_, i) => Math.round((i - 16) * 3.125)), magnitudes: Array(33).fill(0) },
          spectrogram: Array.from({ length: 30 }, () => Array(51).fill(0)),
          hampel_filtered: true,
          butterworth_filtered: true,
        },
        safety: {
          system_state: 'SAFE',
          fall_detected: false,
          confidence: 0,
          timestamp: new Date().toLocaleTimeString(),
          acknowledged: true,
        },
        events: [
          {
            id: `live-init-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'SYSTEM',
            severity: 'INFO',
            message: 'Switched to LIVE Hardware Mode. Simulation engine halted.',
          },
        ],
        fps: 0,
      });

      // 2. Connect to live hardware gateway
      connectWebSocket();
    } else {
      // Switching back to DEMO: close WS and start simulation
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsLiveConnected(false);
      setLiveError(null);
    }
  }, [connectWebSocket]);

  const reconnectLive = useCallback(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  // Simulation Mode Tick Loop (STRICTLY DISABLED in LIVE mode)
  useEffect(() => {
    if (mode !== 'DEMO') {
      return; // Absolute guarantee: zero simulation in LIVE mode
    }

    let animationFrameId: number;
    let lastTick = performance.now();

    const tick = (now: number) => {
      if (now - lastTick >= 33) {
        lastTick = now;
        if (simEngineRef.current) {
          const state = simEngineRef.current.generateState();
          state.signal.hampel_filtered = dspSettings.hampel;
          state.signal.butterworth_filtered = dspSettings.butterworth;
          state.signal.subcarriers = dspSettings.subcarrierCount;
          state.signal.sample_rate = dspSettings.sampleRate;
          setCurrentState(state);
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, dspSettings]);

  return (
    <SensingContext.Provider
      value={{
        state: currentState,
        mode,
        setMode,
        scenario,
        setScenario,
        acknowledgeFall,
        isLiveConnected,
        liveError,
        reconnectLive,
        dspSettings,
        setDspSettings,
      }}
    >
      {children}
    </SensingContext.Provider>
  );
}

export function useSensing() {
  const context = useContext(SensingContext);
  if (!context) {
    throw new Error('useSensing must be used within a SensingProvider');
  }
  return context;
}

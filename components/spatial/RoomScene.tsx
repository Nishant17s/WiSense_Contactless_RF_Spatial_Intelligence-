'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoomGrid, RoomBoundaries } from './RoomGrid';
import { SensorNode3D, CSIBeamLinks } from './SensorNode3D';
import { RFWaveField, RFParticleField } from './RFWaveField';
import { PersonModel3D, MotionTrail3D } from './PersonModel3D';
import { ZoneHeatmap3D } from './ZoneHeatmap3D';
import { CameraController, CameraViewPreset } from './CameraController';
import { NormalizedSensorState } from '@/lib/types/sensing';

interface RoomSceneProps {
  state: NormalizedSensorState | null;
  cameraPreset: CameraViewPreset;
  autoRotate: boolean;
  showWaveField: boolean;
  showParticles: boolean;
  showHeatmap: boolean;
  showTrails: boolean;
}

export function RoomScene({
  state,
  cameraPreset,
  autoRotate,
  showWaveField,
  showParticles,
  showHeatmap,
  showTrails,
}: RoomSceneProps) {
  const people = state?.people || [];
  const nodes = state?.nodes || [];
  const probabilities = state?.room.zone_probabilities || ({} as any);

  // Hardcoded known physical node coordinates in room space
  const txPos: [number, number, number] = [0, 1.2, -4.2]; // Top Center
  const rx1Pos: [number, number, number] = [-3.8, 1.2, 3.8]; // Bottom Left
  const rx2Pos: [number, number, number] = [3.8, 1.2, 3.8]; // Bottom Right

  const txNode = nodes.find((n) => n.id === 'TX-01') || {
    id: 'TX-01',
    role: 'TX',
    status: 'ONLINE',
    rssi: -48,
    csi_active: true,
    packet_rate: 100,
  };
  const rx1Node = nodes.find((n) => n.id === 'RX-01') || {
    id: 'RX-01',
    role: 'RX',
    status: 'ONLINE',
    rssi: -50,
    csi_active: true,
    packet_rate: 100,
  };
  const rx2Node = nodes.find((n) => n.id === 'RX-02') || {
    id: 'RX-02',
    role: 'RX',
    status: 'ONLINE',
    rssi: -51,
    csi_active: true,
    packet_rate: 100,
  };

  return (
    <div className="w-full h-full relative bg-[#05070a]">
      <Canvas
        camera={{ position: [0, 7.5, 9.5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#05070a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 15]} intensity={0.8} color="#e0f7fa" />
        <pointLight position={[0, 4, 0]} intensity={1.2} color="#00e5ff" distance={12} />

        <Suspense fallback={null}>
          {/* Room Environment */}
          <RoomGrid />
          <RoomBoundaries />

          {/* Spatial Heatmap Layer */}
          <ZoneHeatmap3D probabilities={probabilities} enabled={showHeatmap} />

          {/* Dynamic RF Wave Disturbance Mesh */}
          <RFWaveField people={people} enabled={showWaveField} />
          <RFParticleField people={people} enabled={showParticles} />

          {/* 3 Physical Sensor Nodes */}
          <SensorNode3D node={txNode as any} position={txPos} />
          <SensorNode3D node={rx1Node as any} position={rx1Pos} />
          <SensorNode3D node={rx2Node as any} position={rx2Pos} />

          {/* CSI Laser Link Beams between TX and RXs */}
          <CSIBeamLinks txPos={txPos} rx1Pos={rx1Pos} rx2Pos={rx2Pos} />

          {/* Anonymous Human Avatars and Movement Trails */}
          {people.map((person) => (
            <React.Fragment key={person.id}>
              <PersonModel3D person={person} />
              <MotionTrail3D person={person} enabled={showTrails} />
            </React.Fragment>
          ))}

          {/* Camera Orbit & Presets */}
          <CameraController preset={cameraPreset} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}

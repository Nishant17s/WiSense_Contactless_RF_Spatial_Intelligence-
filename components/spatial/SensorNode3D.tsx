'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SensorNode } from '@/lib/types/sensing';
import { Html } from '@react-three/drei/web/Html';

interface SensorNode3DProps {
  node: SensorNode;
  position: [number, number, number];
}

export function SensorNode3D({ node, position }: SensorNode3DProps) {
  const isTx = node.role === 'TX';
  const isOnline = node.status === 'ONLINE';
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const ringScaleRef = useRef(0.8);

  const primaryColor = isTx ? '#B5D04D' : '#7D7897';

  useFrame((_, delta) => {
    if (pulseRingRef.current) {
      ringScaleRef.current += delta * (isTx ? 1.5 : 0.8);
      if (ringScaleRef.current > 2.5) {
        ringScaleRef.current = 0.8;
      }
      pulseRingRef.current.scale.set(ringScaleRef.current, ringScaleRef.current, ringScaleRef.current);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 1.0 - (ringScaleRef.current - 0.8) / 1.7);
      }
    }
  });

  return (
    <group position={position}>
      {/* Node Enclosure */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.25, 0.15, 0.08]} />
        <meshStandardMaterial color="#181A15" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* 6dBi Dipole Antenna */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
        <meshStandardMaterial color="#2E3328" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Antenna Tip Glow */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={primaryColor} />
      </mesh>

      {/* Pulsing RF Wave Ring */}
      {isOnline && (
        <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Status LED */}
      <mesh position={[0.08, 0, 0.05]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshBasicMaterial color={isOnline ? '#B5D04D' : '#EF5350'} />
      </mesh>

      {/* 3D Floating Label HUD */}
      <Html distanceFactor={14} position={[0, -0.25, 0]} center>
        <div className="px-2.5 py-1 rounded-xl bg-[var(--ws-surface)]/95 border border-[var(--ws-border)] backdrop-blur-md shadow-xl text-center pointer-events-none whitespace-nowrap font-mono">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold">
            <span style={{ color: primaryColor }}>{node.id}</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-[var(--ws-surface-elevated)] text-slate-400">
              {node.role}
            </span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {node.rssi.toFixed(0)} dBm • {node.packet_rate}Hz
          </div>
        </div>
      </Html>
    </group>
  );
}

export function CSIBeamLinks({ txPos, rx1Pos, rx2Pos }: { txPos: [number, number, number]; rx1Pos: [number, number, number]; rx2Pos: [number, number, number] }) {
  const line1Ref = useRef<THREE.Line>(null);
  const line2Ref = useRef<THREE.Line>(null);

  const points1 = [new THREE.Vector3(...txPos), new THREE.Vector3(...rx1Pos)];
  const points2 = [new THREE.Vector3(...txPos), new THREE.Vector3(...rx2Pos)];

  const geom1 = new THREE.BufferGeometry().setFromPoints(points1);
  const geom2 = new THREE.BufferGeometry().setFromPoints(points2);

  return (
    <group>
      <line ref={line1Ref} geometry={geom1}>
        <lineDashedMaterial color="#B5D04D" dashSize={0.25} gapSize={0.15} opacity={0.6} transparent />
      </line>
      <line ref={line2Ref} geometry={geom2}>
        <lineDashedMaterial color="#7D7897" dashSize={0.25} gapSize={0.15} opacity={0.6} transparent />
      </line>
    </group>
  );
}

'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PersonState } from '@/lib/types/sensing';
import { Html } from '@react-three/drei/web/Html';

interface PersonModel3DProps {
  person: PersonState;
}

export function PersonModel3D({ person }: PersonModel3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isFall = person.fall_detected;

  // WiSense official brand palette: Lime for presence, Olive for torso core, Lavender for spatial trails, Red for fall
  const primaryColor = isFall ? '#EF5350' : '#B5D04D';
  const secondaryColor = isFall ? '#FF8A80' : '#535E25';

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, person.x, delta * 8);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, person.z, delta * 8);
      
      const targetRotX = isFall ? Math.PI / 2.2 : 0;
      const targetPosY = isFall ? 0.2 : 0.9;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 6);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, delta * 6);
    }
  });

  return (
    <group ref={groupRef} position={[person.x, isFall ? 0.2 : 0.9, person.z]}>
      {/* 1. Base Floor Beacon Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Abstract Torso Hologram (Tapered Cylinder Wireframe) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.9, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          wireframe
          transparent
          opacity={0.8}
          emissive={primaryColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* 3. Glowing Chest Core (RF Center of Mass in Deep Olive) */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={secondaryColor} />
      </mesh>

      {/* 4. Head Orb in Signal Lime */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          wireframe
          transparent
          opacity={0.85}
          emissive={primaryColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 5. Directional Indicator Arrow (only when upright & moving) */}
      {!isFall && person.velocity > 0.2 && (
        <group position={[0, -0.8, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.35, 12]} />
            <meshBasicMaterial color="#B5D04D" />
          </mesh>
        </group>
      )}

      {/* 6. Floating Holographic HUD Tag */}
      <Html distanceFactor={12} position={[0, 1.1, 0]} center>
        <div
          className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border text-center font-sans pointer-events-none whitespace-nowrap shadow-2xl transition-all ${
            isFall
              ? 'bg-status-alert text-white border-white animate-bounce'
              : 'bg-[var(--ws-surface)]/95 border-[var(--ws-border)] text-slate-900 dark:text-white shadow-lg'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-xs font-bold justify-center">
            <span className={isFall ? 'text-white' : 'text-brand-olive dark:text-brand-lime font-brand'}>{person.id}</span>
            <span className="text-[10px] text-slate-500 dark:text-brand-gray font-mono">({person.zone})</span>
          </div>
          <div className="text-[10px] mt-0.5 font-medium">
            <span className={isFall ? 'text-white font-extrabold uppercase' : 'text-slate-600 dark:text-slate-300'}>
              {person.activity}
            </span>
            <span className="text-slate-400 mx-1">•</span>
            <span className={isFall ? 'text-white font-bold' : 'text-brand-olive dark:text-brand-lime font-mono font-bold'}>
              {person.confidence.toFixed(0)}%
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function MotionTrail3D({ person, enabled }: { person: PersonState; enabled: boolean }) {
  if (!enabled || !person.trail || person.trail.length < 2) return null;

  const points = person.trail.map((p) => new THREE.Vector3(p.x, 0.05, p.z));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    // @ts-ignore
    <line geometry={geometry}>
      <lineBasicMaterial
        color={person.fall_detected ? '#EF5350' : '#B5D04D'}
        transparent
        opacity={0.65}
        linewidth={2}
      />
    </line>
  );
}

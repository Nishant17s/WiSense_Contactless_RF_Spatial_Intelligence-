'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PersonState } from '@/lib/types/sensing';

interface RFWaveFieldProps {
  people: PersonState[];
  enabled: boolean;
}

export function RFWaveField({ people, enabled }: RFWaveFieldProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = 10;
  const segments = 40;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !enabled) return;

    const t = clock.getElapsedTime();
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);

      // Base ambient RF sine wave
      let elevation = Math.sin(vertex.x * 0.8 + t * 2.0) * Math.cos(vertex.z * 0.8 + t * 1.5) * 0.08;

      // Localized ripple disturbance around each person
      people.forEach((p) => {
        const dx = vertex.x - p.x;
        const dz = vertex.z - p.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 3.0) {
          const rippleFactor = (1.0 - dist / 3.0) * (p.velocity > 0.3 ? 0.35 : 0.15);
          elevation += Math.sin(dist * 6.0 - t * 6.0) * rippleFactor;
        }
      });

      positionAttribute.setY(i, elevation);
    }

    positionAttribute.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0.08, 0]}>
      <meshStandardMaterial
        color="#B5D04D"
        wireframe
        transparent
        opacity={0.22}
        emissive="#535E25"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

export function RFParticleField({ people, enabled }: { people: PersonState[]; enabled: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 180;

  const [positions, initialY] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const initY = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9.0;
      pos[i * 3 + 1] = Math.random() * 2.2 + 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9.0;
      initY[i] = pos[i * 3 + 1];
    }
    return [pos, initY];
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !enabled) return;
    const t = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;

    for (let i = 0; i < particleCount; i++) {
      const px = posAttr.getX(i);
      const pz = posAttr.getZ(i);

      let py = initialY[i] + Math.sin(t * 1.5 + i) * 0.15;

      people.forEach((p) => {
        const dx = px - p.x;
        const dz = pz - p.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < 2.5) {
          py += Math.sin(t * 8.0 + i) * 0.12 * (p.velocity + 0.2);
        }
      });

      posAttr.setY(i, py);
    }
    posAttr.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#B5D04D"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

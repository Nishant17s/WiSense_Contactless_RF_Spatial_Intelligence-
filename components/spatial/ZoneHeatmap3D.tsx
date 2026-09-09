'use client';

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei/web/Html';
import { ZoneId } from '@/lib/types/sensing';

interface ZoneHeatmap3DProps {
  probabilities: Record<ZoneId, number>;
  enabled: boolean;
}

const ZONE_CONFIGS: { id: ZoneId; x: number; z: number }[] = [
  { id: 'A1', x: -3.0, z: -3.0 },
  { id: 'A2', x: 0.0, z: -3.0 },
  { id: 'A3', x: 3.0, z: -3.0 },
  { id: 'B1', x: -3.0, z: 0.0 },
  { id: 'B2', x: 0.0, z: 0.0 },
  { id: 'B3', x: 3.0, z: 0.0 },
  { id: 'C1', x: -3.0, z: 3.0 },
  { id: 'C2', x: 0.0, z: 3.0 },
  { id: 'C3', x: 3.0, z: 3.0 },
];

export function ZoneHeatmap3D({ probabilities, enabled }: ZoneHeatmap3DProps) {
  if (!enabled) return null;

  return (
    <group position={[0, 0.02, 0]}>
      {ZONE_CONFIGS.map((zone) => {
        const prob = probabilities[zone.id] || 0;
        const opacity = Math.max(0.04, (prob / 100) * 0.45);

        return (
          <group key={zone.id} position={[zone.x, 0, zone.z]}>
            {/* Zone Floor Tint */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.8, 2.8]} />
              <meshBasicMaterial
                color={prob > 60 ? '#B5D04D' : '#7D7897'}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Zone Border Line */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(2.8, 0.02, 2.8)]} />
              <lineBasicMaterial
                color="#B5D04D"
                transparent
                opacity={prob > 20 ? 0.6 : 0.15}
              />
            </lineSegments>

            {/* Zone Label Floating Text */}
            <Html distanceFactor={14} position={[0, 0.05, 0]} center>
              <div className="text-[10px] font-mono font-bold text-slate-400 select-none">
                {zone.id}
                {prob > 15 && (
                  <span className="text-[8.5px] text-brand-lime block text-center font-bold">
                    {prob.toFixed(0)}%
                  </span>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

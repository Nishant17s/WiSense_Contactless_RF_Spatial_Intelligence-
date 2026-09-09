'use client';

import React from 'react';
import * as THREE from 'three';

export function RoomGrid() {
  return (
    <group position={[0, -0.01, 0]}>
      {/* Primary floor plane with subtle metallic sheen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color="#11130F"
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* 3D Grid helper with brand lime/lavender accent */}
      <gridHelper
        args={[12, 24, '#B5D04D', '#2E3328']}
        position={[0, 0.01, 0]}
      />

      {/* Concentric distance radar rings in Signal Lime and Spatial Lavender */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.0, 2.02, 64]} />
        <meshBasicMaterial color="#B5D04D" opacity={0.3} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[4.0, 4.02, 64]} />
        <meshBasicMaterial color="#7D7897" opacity={0.25} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function RoomBoundaries() {
  // Corner posts for the 8m x 6m room
  const posts = [
    [-4.5, 1.25, -4.5],
    [4.5, 1.25, -4.5],
    [-4.5, 1.25, 4.5],
    [4.5, 1.25, 4.5],
  ];

  return (
    <group>
      {/* Corner boundary posts */}
      {posts.map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 2.5, 12]} />
            <meshStandardMaterial color="#2E3328" emissive="#B5D04D" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#B5D04D" />
          </mesh>
        </group>
      ))}

      {/* Top perimeter boundary lines */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(9, 2.5, 9)]}
        />
        <lineBasicMaterial color="#7D7897" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

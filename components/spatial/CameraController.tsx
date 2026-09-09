'use client';

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import * as THREE from 'three';

export type CameraViewPreset = 'perspective' | 'top_down' | 'side' | 'isometric';

interface CameraControllerProps {
  preset: CameraViewPreset;
  autoRotate: boolean;
}

export function CameraController({ preset, autoRotate }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!camera) return;

    switch (preset) {
      case 'perspective':
        camera.position.set(0, 7.5, 9.5);
        camera.lookAt(0, 0, 0);
        break;
      case 'top_down':
        camera.position.set(0, 13, 0.01);
        camera.lookAt(0, 0, 0);
        break;
      case 'side':
        camera.position.set(11, 2.5, 0);
        camera.lookAt(0, 0.5, 0);
        break;
      case 'isometric':
        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);
        break;
    }

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
    }
  }, [preset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      maxPolarAngle={Math.PI / 2.05} // Don't allow camera below floor
      minDistance={3}
      maxDistance={22}
    />
  );
}

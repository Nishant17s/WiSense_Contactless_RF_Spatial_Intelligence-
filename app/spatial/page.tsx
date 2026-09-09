'use client';

import React, { useState, useRef } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { RoomScene } from '@/components/spatial/RoomScene';
import { SpatialHUD } from '@/components/spatial/SpatialHUD';
import { CameraViewPreset } from '@/components/spatial/CameraController';

export default function SpatialPage() {
  const { state } = useSensing();
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('perspective');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showWaveField, setShowWaveField] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#05070a] ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[calc(100vh-4rem)] min-h-[600px]'
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <RoomScene
        state={state}
        cameraPreset={cameraPreset}
        autoRotate={autoRotate}
        showWaveField={showWaveField}
        showParticles={showParticles}
        showHeatmap={showHeatmap}
        showTrails={showTrails}
      />

      {/* Floating HUD Telemetry & Control Overlays */}
      <SpatialHUD
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        showWaveField={showWaveField}
        setShowWaveField={setShowWaveField}
        showParticles={showParticles}
        setShowParticles={setShowParticles}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        showTrails={showTrails}
        setShowTrails={setShowTrails}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}

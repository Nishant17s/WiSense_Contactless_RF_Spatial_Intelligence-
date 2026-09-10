'use client';

import React from 'react';
import { KPIStrip } from '@/components/dashboard/KPIStrip';
import { RoomOverview2D } from '@/components/dashboard/RoomOverview2D';
import { NodeSummaryStrip } from '@/components/dashboard/NodeSummaryStrip';

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* 1. Top KPI Row */}
      <KPIStrip />

      {/* 2. Middle Row: Room Overview 2D Radar */}
      <div className="grid grid-cols-1 gap-4">
        <RoomOverview2D />
      </div>

      {/* 3. Bottom Hardware Nodes Telemetry Strip */}
      <NodeSummaryStrip />
    </div>
  );
}

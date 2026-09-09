'use client';

import React from 'react';
import { KPIStrip } from '@/components/dashboard/KPIStrip';
import { RoomOverview2D } from '@/components/dashboard/RoomOverview2D';
import { AIIntelligencePanel } from '@/components/dashboard/AIIntelligencePanel';
import { SafetyPanel } from '@/components/dashboard/SafetyPanel';
import { OccupancyWidget } from '@/components/dashboard/OccupancyWidget';
import { RecentEventsWidget } from '@/components/dashboard/RecentEventsWidget';
import { NodeSummaryStrip } from '@/components/dashboard/NodeSummaryStrip';

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* 1. Top KPI Row */}
      <KPIStrip />

      {/* 2. Middle Row: Room Overview 2D Radar + AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-8">
          <RoomOverview2D />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <AIIntelligencePanel />
        </div>
      </div>

      {/* 3. Lower Row: Safety Monitoring + Room Occupancy + Recent Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SafetyPanel />
        <OccupancyWidget />
        <RecentEventsWidget />
      </div>

      {/* 4. Bottom Hardware Nodes Telemetry Strip */}
      <NodeSummaryStrip />
    </div>
  );
}

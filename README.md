# WiSense: Contactless RF Spatial Intelligence

> **Wi-Fi CSI • Edge AI • Contactless Indoor Spatial Intelligence & Fall Safety Monitoring**  
> Camera-free, wearable-free indoor spatial tracking, activity recognition, and fall detection powered by 5.24 GHz Wi-Fi Channel State Information (CSI) and Edge AI.

---

## 🛰️ 1. Project Overview

**WiSense** is a privacy-first spatial intelligence and safety monitoring platform that analyzes perturbations in commodity Wi-Fi RF multipath fields. By extracting 51 OFDM subcarrier amplitudes and phases at 100 Hz from ESP32-S3 transceiver nodes, WiSense detects presence, tracks continuous human movement across calibrated 3×3 room zones (A1–C3), classifies activities, and triggers millisecond fall alerts—completely without cameras, microphones, or wearables.

```
                  Wi-Fi Signal Propagation (5.24 GHz)
                                  ↓
              Human Interaction with RF Multipath Field
                                  ↓
             ESP32-S3 Nodes (1 TX-01, 2 RX-01/02 @ 100 Hz)
                                  ↓
           51 OFDM Subcarrier CSI Matrix (Amplitude + Phase)
                                  ↓
       Digital Signal Processing (Hampel Filter + Butterworth LPF)
                                  ↓
                Doppler Velocity Spectrum & FFT Shifts
                                  ↓
            Edge AI Spatial Classifier (Random Forest + XGBoost)
                                  ↓
      Presence • Room Count • Zone (A1–C3) • Velocity • Fall Alert
                                  ↓
        WiSense 3D WebGL Observatory & Tactical Command Center
```

---

## ✨ 2. Key Features

- **🛡️ 100% Privacy-Preserving**: Operates without optical lenses or audio capture, suitable for private spaces, healthcare facilities, bedrooms, and eldercare suites.
- **🌐 3D Cinematic RF Observatory**: Full-screen Three.js / WebGL 3D environment showing animated RF wave fields, Fresnel links, dynamic particle disturbances, and holographic human avatars with physics-based fall animation.
- **🎯 2D Precision Spatial Radar**: High-resolution CAD coordinate grid ($8.0\text{m} \times 6.0\text{m}$) with real-time target blips, velocity vectors, motion breadcrumb trails, and zone probability heatmaps.
- **📊 51-Subcarrier CSI Signal Lab**: Real-time 51 OFDM subcarrier amplitude and phase spectrums, Doppler velocity FFT ($-50\text{ Hz}$ to $+50\text{ Hz}$), rolling time-frequency waterfall spectrogram, and live DSP filter toggles.
- **⚡ Dual-Mode Single Source of Truth**:
  - **DEMO Mode**: 12 deterministic simulation scenarios (Kinematic walking circuits, crowd motion, fall incidents, multi-target tracking).
  - **LIVE Mode**: Strictly non-simulated real-time hardware stream via FastAPI WebSocket gateway (`ws://localhost:8000/ws/sensing`).
- **🚨 Instant Fall Detection & Dispatch**: Audio-visual alert dispatch triggered upon high-velocity downward deceleration with on-screen acknowledgment workflow.
- **📡 Hardware Network Topology**: Real-time telemetry monitoring for 3 nodes (RSSI, packet rates, noise floors, uptime, fault injection testing).

---

## 🛠️ 3. Hardware Architecture & Specifications

| Component | Node ID | Model | Frequency | Role | Mounting Position |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Transmitter** | `TX-01` | ESP32-S3-DevKitC-1U-N8R8 (8MB PSRAM) | 5.24 GHz (Ch 48) | CSI Beacon Broadcast | North Wall (Center) |
| **Receiver 1** | `RX-01` | ESP32-S3-DevKitC-1U-N8R8 (8MB PSRAM) | 5.24 GHz (Ch 48) | CSI Packet Capture @ 100Hz | South-West Corner |
| **Receiver 2** | `RX-02` | ESP32-S3-DevKitC-1U-N8R8 (8MB PSRAM) | 5.24 GHz (Ch 48) | CSI Packet Capture @ 100Hz | South-East Corner |
| **Antennas** | All | 6dBi Dual-Band Dipole + IPEX MHF1 | 2.4 / 5 GHz | High-gain spatial diversity | Wall / Corner Mount |

---

## 💻 4. Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **3D & Spatial Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`.
- **Backend & Edge Gateway**: Python 3.10+, FastAPI, Uvicorn, WebSockets, NumPy, Pydantic.
- **DSP & Signal Algorithms**: Hampel Identifier (outlier rejection), Butterworth 4th-order Low-Pass Filter, Doppler Short-Time Fourier Transform (STFT), Phase Unwrapping.

---

## 🚀 5. Quick Start Guide

### Prerequisites
- Node.js 18.x, 20.x, or 22+
- Python 3.10+ (for live hardware gateway)

### 1. Clone Repository
```bash
git clone https://github.com/rukeshsg/contactless-spatial-intelligence.git
cd contactless-spatial-intelligence
```

### 2. Install & Run Frontend
```bash
# Install frontend dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to launch the WiSense Command Center.

### 3. Run Live Hardware Gateway Backend (Optional)
```bash
# Set up Python environment
python -m venv .venv
.\.venv\Scripts\activate   # On Windows (or source .venv/bin/activate on Unix)

# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI CSI gateway
python backend/server.py
```
- Gateway Status API: `http://localhost:8000/api/v1/status`
- Real-Time WebSocket Stream: `ws://localhost:8000/ws/sensing`
- Hardware CSI Ingest Endpoint: `POST http://localhost:8000/api/v1/csi/ingest`

---

## 📁 6. Project Directory Structure

```
contactless-spatial-intelligence/
├── app/
│   ├── dashboard/          # Command Center: KPIs, 2D Radar Grid, Safety Panel
│   ├── spatial/            # 3D WebGL Cinematic RF Room Observatory
│   ├── signals/            # CSI Signal Lab: 51 Subcarriers, Doppler, Spectrogram
│   ├── nodes/              # 3-Node Topology Monitor & Fault Injection
│   ├── history/            # Spatial Event Log & CSV Analytics Export
│   ├── settings/           # Calibration, DSP & AI Threshold Settings
│   ├── layout.tsx          # Global Shell & Navigation
│   └── globals.css         # WiSense Design System Styles
├── backend/
│   ├── server.py           # FastAPI Real-Time CSI Gateway & Ingest API
│   └── requirements.txt    # Python Backend Dependencies
├── components/
│   ├── brand/              # WiSense SVG Logos & Brand Tokens
│   ├── dashboard/          # RoomOverview2D, KPIStrip, SafetyPanel
│   ├── spatial/            # RoomScene, PersonModel3D, RFWaveField, SensorNode3D
│   ├── signals/            # CSISubcarrierChart, DopplerVelocityChart, SpectrogramCanvas
│   └── layout/             # AppNavbar, AppSidebar, GlobalSafetyAlert
├── lib/
│   ├── providers/          # DataProvider (Strict DEMO vs LIVE mode logic)
│   ├── simulation/         # 12 Deterministic Kinematic Physics Scenarios
│   ├── types/              # Sensing, Spatial & Telemetry Type Definitions
│   └── utils/              # Formatting & DSP Utilities
└── README.md
```

---

## 🔒 7. Privacy & Safety Guarantee

- **Zero Cameras**: Total immunity from optical surveillance; safe for bedrooms, bathrooms, and private suites.
- **Zero Wearables**: Passive contactless sensing protecting seniors and occupants without requiring pendants, bracelets, or tags.
- **Instant Fall Alert**: Automated audio-visual dispatch triggered by sudden downward RF velocity shifts.

---

## 📄 License

This project is licensed under the MIT License.

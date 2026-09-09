# WiSense ESP32-S3 Hardware-to-Dashboard Integration Guide

This guide details the end-to-end data pipeline connecting **ESP32-S3 CSI transceiver nodes** to the **WiSense Command Platform & 3D Observatory**. It provides the concrete data contracts, endpoints, packet flow, and open hardware/firmware items needed to deploy physical hardware.

---

## 🏗️ 1. End-to-End Architecture Flow

```
[ESP32-S3 TX-01]                    [ESP32-S3 RX-01 & RX-02]
 5.24 GHz Wi-Fi Beacons ───────────► Capture 51 OFDM Subcarrier CSI (100 Hz)
                                                 │
                                                 │ HTTP POST / UDP / Serial
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │    WiSense Live Gateway (FastAPI)     │
                             │       `backend/server.py`             │
                             │                                       │
                             │  1. Ingestion: POST /api/v1/csi/ingest│
                             │  2. DSP: Hampel + Butterworth Filter  │
                             │  3. Spatial & Activity AI Inference   │
                             │  4. Broadcast: ws://localhost:8000/ws │
                             └───────────────────┬───────────────────┘
                                                 │
                                                 │ WebSocket (`/ws/sensing`)
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │       WiSense Next.js Frontend        │
                             │         `lib/providers/DataProvider`  │
                             │                                       │
                             │  • Command Center (/dashboard)        │
                             │  • 3D Spatial Observatory (/spatial)  │
                             │  • CSI Signal Lab (/signals)          │
                             │  • Node Network Telemetry (/nodes)    │
                             └───────────────────────────────────────┘
```

---

## 📡 2. Physical Node Roles & Topology

| Node ID | Role | Physical Position | Firmware Task |
| :--- | :--- | :--- | :--- |
| **`TX-01`** | Transmitter | North Wall (Center, 1.2m height) | Transmits high-rate 802.11n Wi-Fi frames @ 100 Hz on 5.24 GHz (Channel 48). |
| **`RX-01`** | Receiver | South-West Corner (1.2m height) | Captures Channel State Information (CSI) matrix from `TX-01`. |
| **`RX-02`** | Receiver | South-East Corner (1.2m height) | Captures Channel State Information (CSI) matrix from `TX-01` for triangulation. |

---

## 📥 3. Hardware Data Ingestion API

The FastAPI gateway (`backend/server.py`) provides an ingestion endpoint for incoming node packets.

### Endpoint: `POST /api/v1/csi/ingest`
- **Host**: `http://localhost:8000` (or the IP of the machine hosting the backend)
- **Content-Type**: `application/json`

### Payload Schema:
```json
{
  "node_id": "RX-01",
  "role": "RX",
  "rssi": -48.5,
  "amplitudes": [
    34.2, 35.1, 38.0, 42.5, 41.2, 39.8, 37.4, 35.6, 36.0, 38.2,
    39.5, 40.1, 41.3, 42.0, 41.8, 40.5, 39.2, 38.4, 37.8, 38.0,
    39.1, 40.2, 41.0, 41.5, 40.8, 39.7, 38.9, 38.2, 37.9, 38.5,
    39.8, 40.6, 41.2, 41.8, 41.1, 40.0, 39.3, 38.7, 38.1, 38.6,
    39.4, 40.3, 40.9, 41.4, 40.7, 39.6, 38.8, 38.0, 37.5, 38.2, 39.0
  ],
  "phases": [
    -1.82, -1.74, -1.65, -1.50, -1.35, -1.20, -1.05, -0.90, -0.75, -0.60,
    -0.45, -0.30, -0.15,  0.00,  0.15,  0.30,  0.45,  0.60,  0.75,  0.90,
     1.05,  1.20,  1.35,  1.50,  1.65,  1.80,  1.95,  2.10,  2.25,  2.40,
     2.55,  2.70,  2.85,  3.00,  3.14, -3.00, -2.85, -2.70, -2.55, -2.40,
    -2.25, -2.10, -1.95, -1.80, -1.65, -1.50, -1.35, -1.20, -1.05, -0.90, -0.75
  ],
  "fall_detected": false,
  "people": [
    {
      "id": "P01",
      "zone": "B2",
      "x": 0.5,
      "y": 0.9,
      "z": 0.2,
      "activity": "Walking",
      "velocity": 0.85,
      "confidence": 94.5
    }
  ]
}
```

#### Field Specifications:
- `node_id` *(string, required)*: `"TX-01"`, `"RX-01"`, or `"RX-02"`.
- `role` *(string, required)*: `"TX"` or `"RX"`.
- `rssi` *(float, required)*: Received signal strength in dBm (e.g. `-48.5`).
- `amplitudes` *(array of 51 floats, required)*: Amplitude values across the 51 active subcarriers.
- `phases` *(array of 51 floats, optional)*: Phase angles in radians ($-\pi$ to $+\pi$).
- `fall_detected` *(boolean, optional)*: `true` if an instantaneous fall event is detected.
- `people` *(array of objects, optional)*: Estimated targets if spatial inference runs at node or edge.

---

## ⚡ 4. Backend Processing & Live WebSocket Pipeline

1. **Ingestion & Node Heartbeat**:
   - `backend/server.py` receives CSI packets.
   - Updates active nodes table and timestamps.
   - If no packet is received for $> 3.0$ seconds, the gateway marks nodes as `STANDBY` (zero fake data).

2. **WebSocket Streaming (`ws://localhost:8000/ws/sensing`)**:
   - Connected frontend clients receive real-time JSON frames at 20–30 Hz.
   - State conforms to the frontend `NormalizedSensorState` TypeScript interface:
     - `mode`: `"LIVE"`
     - `people`: Array of tracked persons with coordinates `(x, z)` in room space $[-4.0\text{m}, +4.0\text{m}]$ and $[-3.0\text{m}, +3.0\text{m}]$.
     - `room.zone_probabilities`: Probabilities for zones `A1` through `C3`.
     - `signal.amplitude` & `signal.phase`: 51-subcarrier arrays.
     - `signal.fft`: Doppler frequency shifts ($-50\text{ Hz}$ to $+50\text{ Hz}$).
     - `safety.fall_detected`: Emergency trigger status.

---

## 🖥️ 5. How Live Readings Reach the Dashboard

1. **User toggles `LIVE` on the Navbar / Settings**:
   - `DataProvider.tsx` sets `mode = 'LIVE'`.
   - The simulation loop is **immediately halted**.
   - Current state is cleared of any demo artifacts.
   - Frontend connects to `ws://localhost:8000/ws/sensing`.

2. **Rendering on Frontend Pages**:
   - **Command Center (`/dashboard`)**:
     - 2D Precision Radar draws target blips at `(x, z)`.
     - Zone probability heatmaps tint occupied zones (e.g. `B2`).
     - Node status badges show live packet rate and RSSI.
   - **3D Spatial Observatory (`/spatial`)**:
     - Holographic avatars update position in 3D WebGL space.
     - Fresnel laser beams between TX-01 and RXs react to RSSI variance.
   - **CSI Signal Lab (`/signals`)**:
     - Real-time line charts plot the 51 subcarrier amplitudes and unwrapped phases.
     - Canvas waterfall spectrogram renders live RF frequency shifts.

3. **Offline / Standby Safety**:
   - If the backend is disconnected or nodes are not transmitting, the UI renders `LIVE CONNECTION OFFLINE / STANDBY` with zero simulated fallbacks.

---

## ❓ 6. Items Pending Confirmation from Hardware / Firmware Team

The following parameters must be confirmed with the ESP32-S3 firmware developer before final field flashing:

1. **Network Transport from Node to Gateway**:
   - [ ] Is the ESP32 sending CSI via HTTP `POST` requests, lightweight **UDP packets**, or direct **WebSocket client**?
   - *(Recommendation: UDP or lightweight WebSocket stream for lowest 100 Hz latency).*

2. **Raw Byte Structure vs. Converted Floats**:
   - [ ] Does the ESP32 firmware compute amplitude $\sqrt{I^2 + Q^2}$ and phase $\arctan2(Q, I)$ onboard, or does it stream raw raw signed `int8` / `int16` I/Q byte pairs?
   - *(If streaming raw I/Q bytes, `backend/server.py` can decode the binary buffer directly).*

3. **OFDM Subcarrier Index Mask**:
   - [ ] In ESP-IDF CSI callback, standard 20 MHz 802.11n exposes 52 to 64 subcarriers (with pilots and guard bands). Confirm the exact index mask for the 51 subcarriers used by the classifier.

4. **Edge AI Inference Placement**:
   - [ ] Will the Random Forest / XGBoost spatial classifier execute on the **ESP32-S3** (via ESP-NN / micro-inference) or on the **Python Gateway**?
   - *(If running on Gateway, the ESP32 only sends raw CSI arrays, and the Python gateway computes position `(x, z)` and fall classification).*

5. **Wi-Fi Frame Injection Mode**:
   - [ ] Confirm the transmission packet type used by `TX-01` (e.g., 802.11n Null Data Packets, ESP-NOW broadcast, or continuous UDP broadcast).

---

## 🛠️ 7. Quick Testing with Real Hardware or CLI Mock

You can test pushing real packets to the live gateway right away using `curl`:

```bash
# Ingest a real packet from RX-01 with a target in Zone B2
curl -X POST http://localhost:8000/api/v1/csi/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "RX-01",
    "role": "RX",
    "rssi": -46.2,
    "amplitudes": [42.1, 41.5, 43.0, 45.2, 44.1, 42.8, 40.5, 39.2, 38.7, 40.1, 41.2, 42.0, 43.1, 44.0, 43.8, 42.5, 41.2, 40.4, 39.8, 40.0, 41.1, 42.2, 43.0, 43.5, 42.8, 41.7, 40.9, 40.2, 39.9, 40.5, 41.8, 42.6, 43.2, 43.8, 43.1, 42.0, 41.3, 40.7, 40.1, 40.6, 41.4, 42.3, 42.9, 43.4, 42.7, 41.6, 40.8, 40.0, 39.5, 40.2, 41.0],
    "fall_detected": false,
    "people": [
      {
        "id": "P01",
        "zone": "B2",
        "x": 0.2,
        "y": 0.9,
        "z": 0.1,
        "activity": "Standing",
        "velocity": 0.05,
        "confidence": 96.0
      }
    ]
  }'
```
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in `LIVE` mode to observe the live packet render on the 2D grid and 3D observatory.

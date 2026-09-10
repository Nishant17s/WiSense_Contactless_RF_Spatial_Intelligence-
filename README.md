# WiSense: Contactless RF Spatial Intelligence

> **Wi-Fi CSI • Edge AI • Contactless Indoor Spatial Intelligence & Fall Safety Monitoring**  
> Camera-free, wearable-free indoor spatial tracking, activity recognition, and fall detection powered by 5.24 GHz Wi-Fi Channel State Information (CSI) and XGBoost Machine Learning.

---

## 🛰️ 1. Project Overview

**WiSense** is a privacy-first spatial intelligence and safety monitoring platform that analyzes perturbations in commodity Wi-Fi RF multipath fields. By extracting 51 OFDM subcarrier amplitudes and phases at 100 Hz from ESP32-S3 transceiver nodes, WiSense detects presence, tracks continuous human movement across calibrated room zones (A1–C3), classifies activities (Sitting vs Walking), and triggers millisecond fall alerts—completely without cameras, microphones, or wearables.

```text
                  Wi-Fi Signal Propagation (5.24 GHz)
                                  ↓
              Human Interaction with RF Multipath Field
                                  ↓
             ESP32-S3 Nodes (1 TX-01, 1+ RX-01 @ 100 Hz)
                                  ↓
           51 OFDM Subcarrier CSI Matrix (Amplitude + Phase)
                                  ↓
                   UDP Data Stream to Python Server
                                  ↓
             Edge AI Spatial Classifier (XGBoost) + Physics Heuristics
                                  ↓
      Presence • Occupancy Zone • Activity (Walk/Sit) • Fall Alert
                                  ↓
           WiSense Next.js 2D Radar & Tactical Command Center
```

---

## ✨ 2. Key Features

- **🛡️ 100% Privacy-Preserving**: Operates without optical lenses or audio capture, suitable for private spaces, healthcare facilities, bedrooms, and eldercare suites.
- **🎯 2D Precision Spatial Radar**: High-resolution coordinate grid with real-time target blips, live zone probabilities, and presence indicators.
- **📊 CSI Signal Processing**: Real-time temporal variance monitoring across 51 OFDM subcarriers.
- **⚡ XGBoost Machine Learning**: Capable of achieving 99%+ accuracy for spatial zone classification after a brief 5-second per-zone calibration/data collection phase.
- **🚨 Physics-Based Fall Detection**: Instant fall alerts triggered by a heuristic analysis of massive variance spikes (fast physical drops) followed by total signal stillness (lying on the floor).
- **🚶 Activity Tracking**: Accurately distinguishes between a human walking (high subcarrier phase disruption) versus sitting/standing still (low disruption).

---

## 🛠️ 3. Hardware Architecture & Specifications

| Component | Node ID | Model | Frequency | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Transmitter** | `TX-01` | ESP32-S3-DevKitC | 2.4/5.0 GHz | CSI Beacon Broadcast |
| **Receiver** | `RX-01` | ESP32-S3-DevKitC | 2.4/5.0 GHz | Promiscuous CSI Packet Capture @ 100Hz |

*Note: The system supports ambient/passive sensing. If the dedicated TX-01 node is turned off, the RX-01 node can passively ingest and analyze CSI packets from a standard home Wi-Fi router transmitting on the same channel.*

---

## 💻 4. Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide Icons.
- **Backend Edge Gateway**: Python 3.10+, Raw UDP Socket Ingestion, WebSockets (`websockets`, `asyncio`), Pandas.
- **Machine Learning**: `xgboost`, `scikit-learn` (Label Encoding, Train/Test Split, Classification).
- **Embedded Firmware**: C, ESP-IDF (Espressif IoT Development Framework), `esp_wifi` CSI promiscuous mode callbacks.

---

## 🚀 5. Quick Start Guide

### Prerequisites
- Node.js 18+
- Python 3.10+
- ESP-IDF v5.0+ (For flashing the ESP32-S3 boards)

### 1. Clone Repository
```bash
git clone https://github.com/Nishant17s/WiSense_Contactless_RF_Spatial_Intelligence-.git
cd WiSense_Contactless_RF_Spatial_Intelligence-
```

### 2. Install & Run Frontend
```bash
# Install frontend dependencies
npm install

# Run development server (Port 4000)
npm run dev -- -p 4000
```
Open [http://localhost:4000](http://localhost:4000) to launch the WiSense Dashboard.

### 3. Setup Python Backend & Train AI
```bash
# Set up Python environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# 1. Collect Data (Stand in Zone A1, run script, type 'A1')
# Repeat for 'EMPTY', 'B2', 'C3', etc.
python3 scripts/collect_training_data.py

# 2. Train the XGBoost Model
python3 scripts/train_xgboost.py

# 3. Start the Live Server (Listens on UDP 5000, Broadcasts on WS 8765)
python3 backend/server.py
```

### 4. Flash Firmware (ESP32-S3)
Ensure your laptop and ESP32s are connected to the same Wi-Fi network. Update `WIFI_SSID`, `WIFI_PASS`, and `HOST_IP` in `rx_main.c` before flashing.
```bash
# Flash TX Node
cd firmware/tx_node
idf.py build flash monitor

# Flash RX Node
cd firmware/rx_node
idf.py build flash monitor
```

---

## 🔒 6. Privacy & Safety Guarantee

- **Zero Cameras**: Total immunity from optical surveillance.
- **Zero Wearables**: Passive contactless sensing protecting seniors without pendants or bracelets.
- **Ambient RF Physics**: Utilizes invisible, low-power Wi-Fi radio waves already present in modern environments.

---

## 📄 License
This project is proprietary and confidential for SIH Hackathon evaluation.

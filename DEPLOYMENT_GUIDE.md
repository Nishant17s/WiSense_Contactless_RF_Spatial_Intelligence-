# 🚀 WiSense Complete Production Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide provides a comprehensive walkthrough for deploying the entire **WiSense: Contactless RF Spatial Intelligence** platform across **Render** and **Vercel**.

---

## 📐 1. System Architecture & Component Mapping

```
                                ESP32-S3 Transceiver Nodes
                                  (TX-01, RX-01, RX-02)
                                            │
                                            │ HTTP POST (`/api/v1/csi/ingest`)
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │                 RENDER.COM                       │
                  │   FastAPI CSI Live Gateway (Python 3.10)         │
                  │   • Real-Time WebSocket: `/ws/sensing`           │
                  │   • Status API: `/api/v1/status`                 │
                  │   • 100 Hz Ingestion & DSP Filtering Engine      │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                            │ Secure WebSocket (`wss://<app>.onrender.com/ws/sensing`)
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │                 VERCEL.COM                       │
                  │   WiSense Next.js 14 Web Platform                │
                  │   • Command Center Dashboard (/dashboard)        │
                  │   • 3D WebGL Spatial Observatory (/spatial)      │
                  │   • 51-Subcarrier CSI Signal Lab (/signals)      │
                  │   • Topology Monitor & Analytics (/nodes)        │
                  └──────────────────────────────────────────────────┘
```

---

## 🛠️ 2. Prerequisites

Before starting, ensure you have:
1. A **GitHub account** with access to your repository:  
   [`https://github.com/rukeshsg/contactless-spatial-intelligence`](https://github.com/rukeshsg/contactless-spatial-intelligence)
2. A free account on **[Render.com](https://render.com)** (sign in with GitHub).
3. A free account on **[Vercel.com](https://vercel.com)** (sign in with GitHub).

---

## 🟣 PHASE 1: Deploy Python FastAPI Gateway on Render

Render hosts the persistent Python server and manages the long-running WebSocket connections.

### Method A: 1-Click Blueprint Deployment (Recommended)

Because the repository includes `render.yaml`, Render can configure the service automatically:

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **"New +"** (top right) $\to$ Select **"Blueprint"**.
3. Connect your repository: **`rukeshsg/contactless-spatial-intelligence`**.
4. Render will read `render.yaml` and display:
   - **Service Name**: `wisense-gateway`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
5. Click **"Apply"** to begin deployment.

---

### Method B: Manual Web Service Setup

If you prefer to configure manually:

1. On the Render Dashboard, click **"New +"** $\to$ **"Web Service"**.
2. Select **"Build and deploy from a Git repository"** $\to$ Click **Next**.
3. Choose **`rukeshsg/contactless-spatial-intelligence`** and click **Connect**.
4. Configure the service settings:
   - **Name**: `wisense-gateway` *(or your custom name)*
   - **Region**: `Oregon (US West)` or `Frankfurt (EU Central)` *(choose the region closest to you)*
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.server:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Select **`Free`**.
5. Click **"Create Web Service"**.

---

### Verifying Render Deployment

1. Wait 1–2 minutes until the deployment log shows:
   ```
   INFO: Application startup complete.
   INFO: Uvicorn running on http://0.0.0.0:10000
   ==> Your service is live 🎉
   ```
2. Note your **Render Public URL**:  
   `https://wisense-gateway.onrender.com` *(replace with your actual URL)*.
3. Test the REST endpoint in your browser:
   ```
   https://wisense-gateway.onrender.com/api/v1/status
   ```
   It should return:
   ```json
   {
     "status": "ONLINE",
     "service": "WiSense CSI Gateway",
     "version": "2.4.0",
     "nodes_online": 0,
     "subcarriers": 51,
     "sample_rate_hz": 100.0,
     "hardware_streaming": false
   }
   ```
4. Note your **Production WebSocket URL**:
   ```
   wss://wisense-gateway.onrender.com/ws/sensing
   ```
   *(Note the `wss://` secure prefix).*

---

## ▲ PHASE 2: Deploy Next.js 14 Frontend on Vercel

Vercel provides edge hosting, global CDN distribution, and optimized rendering for the Next.js web application.

### Step 1: Import Project to Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** $\to$ Select **"Project"**.
3. Under **Import Git Repository**, locate **`rukeshsg/contactless-spatial-intelligence`** and click **Import**.

### Step 2: Configure Project & Build Settings
Vercel will automatically detect Next.js. Verify the defaults:
- **Framework Preset**: `Next.js`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Configure Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| **`NEXT_PUBLIC_WS_URL`** | `wss://wisense-gateway.onrender.com/ws/sensing` | Production WebSocket endpoint on Render |

*(Make sure to use your real Render domain from Phase 1).*

### Step 4: Deploy
1. Click **"Deploy"**.
2. Vercel will install dependencies, compile the 3D WebGL shaders and Next.js pages, and deploy globally.
3. Once finished (typically ~45–60 seconds), you will receive your live domain:
   ```
   https://contactless-spatial-intelligence.vercel.app
   ```

---

## 📡 PHASE 3: Connecting ESP32-S3 Hardware to Render

To transmit real-time CSI packets from physical ESP32-S3 transceivers to your live cloud platform:

1. Flash your ESP32-S3 nodes with Wi-Fi credentials connected to the internet.
2. Direct the HTTP client in the firmware to post captured 51-subcarrier arrays to your Render domain:
   - **Target URL**: `https://wisense-gateway.onrender.com/api/v1/csi/ingest`
   - **Method**: `POST`
   - **Header**: `Content-Type: application/json`

### Test Ingestion via Terminal (`curl`):
```bash
curl -X POST https://wisense-gateway.onrender.com/api/v1/csi/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "RX-01",
    "role": "RX",
    "rssi": -46.5,
    "amplitudes": [38.2, 39.1, 40.5, 42.1, 41.5, 40.2, 39.5, 38.8, 39.0, 40.2, 41.5, 42.0, 42.8, 43.5, 43.0, 42.1, 41.0, 40.2, 39.8, 40.1, 41.0, 42.1, 42.9, 43.2, 42.5, 41.8, 40.9, 40.1, 39.8, 40.4, 41.5, 42.2, 42.8, 43.1, 42.6, 41.8, 41.0, 40.5, 39.9, 40.3, 41.1, 42.0, 42.5, 43.0, 42.3, 41.5, 40.7, 40.0, 39.5, 40.1, 40.8],
    "fall_detected": false,
    "people": [
      {
        "id": "P01",
        "zone": "B2",
        "x": 0.1,
        "y": 0.9,
        "z": -0.2,
        "activity": "Walking",
        "velocity": 0.75,
        "confidence": 96.2
      }
    ]
  }'
```

---

## 🔍 PHASE 4: End-to-End Verification Checklist

| Test Item | Steps | Expected Result |
| :--- | :--- | :--- |
| **1. DEMO Simulation Mode** | Open Vercel site $\to$ Select scenario from top dropdown. | 3D room, 2D radar, and CSI signal charts animate smoothly without server lag. |
| **2. LIVE Standby Mode** | Switch to **LIVE** in top navbar with no hardware active. | UI halts simulation; displays `LIVE STANDBY (Awaiting ESP32 stream)` and `0 People`. |
| **3. LIVE Hardware Feed** | Send the `curl` test packet above while in **LIVE** mode. | Target `P01` instantly appears on 2D grid and 3D WebGL observatory in Zone `B2`. |
| **4. 3D WebGL Controls** | Navigate to `/spatial` $\to$ Rotate/orbit camera. | Smooth 60 FPS Three.js rendering with orbital controls and zone heatmaps. |
| **5. CSI Spectrogram Canvas** | Navigate to `/signals` $\to$ Toggle Hampel/Butterworth filters. | 51-subcarrier line graph and rolling waterfall spectrogram render in real time. |

---

## ⚠️ Troubleshooting & Tips

### 1. Render Free Tier Spin-Down (Cold Starts)
- On Render's Free tier, services spin down after 15 minutes of inactivity. The first request may take 30–45 seconds to wake up.
- **Solution**: For 24/7 continuous low-latency monitoring, upgrade to Render Starter ($7/mo) or ping `https://wisense-gateway.onrender.com/api/v1/status` periodically via a cron service (e.g., cron-job.org / UptimeRobot).

### 2. WebSocket SSL Handshake (`wss://`)
- Always use **`wss://`** (secure WebSocket) in production on Vercel. Browser security blocks unencrypted `ws://` connections from HTTPS sites.

### 3. Updating Frontend Environment Variables
- If you change `NEXT_PUBLIC_WS_URL` in Vercel settings, navigate to **Deployments** $\to$ click the **three dots (...)** on the latest deployment $\to$ select **"Redeploy"** for changes to take effect.

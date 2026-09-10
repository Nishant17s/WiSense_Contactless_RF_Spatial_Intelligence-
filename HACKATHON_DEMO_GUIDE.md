# 🏆 WiSense: Ultimate Hackathon Demo Day Guide

This document is your step-by-step tactical playbook for setting up the hardware, calibrating the AI, and blowing the judges away at your SIH presentation. 

---

## 🛑 Phase 1: The "New Room" Wipe (CRITICAL)
Because your AI model is currently trained on the exact physics and walls of your bedroom, **it will fail in the hackathon hall if you do not wipe the old data.** 

Before you collect any new data at the venue, you **MUST** delete the old CSV file so the bedroom data doesn't mix with the hackathon hall data.
1. Navigate to `backend/data/`
2. **Delete** the `csi_training_data.csv` file. 
*(Don't worry, the collection script will automatically create a fresh one).*

---

## 💻 Phase 2: Hardware & IP Setup (The New PC)
If you are running the demo on a new PC, its IP address has changed. The ESP32s need to know where to send the data.
1. **Find your new PC's IP Address** (e.g., `192.168.x.x`).
2. Open `firmware/rx_node/main/rx_main.c`.
3. Change **Line 21**: `#define HOST_IP "YOUR_NEW_IP_ADDRESS"`
4. Plug in your RX Node and flash it:
   ```bash
   cd firmware/rx_node
   idf.py build flash
   ```
5. *(Optional)* If the Wi-Fi network at the venue is different, make sure to update the `WIFI_SSID` and `WIFI_PASS` in the same file before flashing!
6. Plug in the TX Node (no need to flash if the Wi-Fi hasn't changed, but if the Wi-Fi changed, update its `WIFI_SSID` and re-flash).

---

## 🧠 Phase 3: Calibrating the Edge AI (The Arena)
Set up your physical space. Place the TX node on one side of your demo area, and the RX node on the other side. Do not move them once this step begins.

1. Ensure the Python environment is active (`source .venv/bin/activate`).
2. Run the collection script:
   ```bash
   python3 scripts/collect_training_data.py
   ```
3. **Collect Data for exactly 4 labels:**
   - Stand in the top left. Label: **`A1`**
   - Stand in the middle. Label: **`B2`**
   - Stand in the bottom right. Label: **`C3`**
   - Step completely out of the sensing zone. Label: **`EMPTY`**
4. Train the brain on the fresh venue data:
   ```bash
   python3 scripts/train_xgboost.py
   ```
   *(Verify that your accuracy hits ~99% and that it only detected 4 classes).*

---

## 🚀 Phase 4: Launching the Command Center
1. **Start the Frontend (Terminal 1):**
   ```bash
   npm run dev -- -p 4000
   ```
2. **Start the Backend (Terminal 2):**
   ```bash
   source .venv/bin/activate
   python3 backend/server.py
   ```
3. Open your browser to [http://localhost:4000](http://localhost:4000).

---

## 🎤 Phase 5: Pitching to the Judges
When the judges arrive, keep the dashboard on the main screen and have your teammate physically act out the scenarios. 

**Hit these exact talking points:**
1. **"This is 100% Contactless and Privacy-Preserving."**
   > *"We are not using cameras, microphones, or wearables. We are passively extracting 51 OFDM subcarriers from commodity 5GHz Wi-Fi. Our AI maps the disruption of these invisible radio waves."*
2. **Demonstrate Spatial Classification (XGBoost):**
   > *"Watch as my teammate walks to Zone A1. Our Edge XGBoost classifier recognizes the exact RF multipath signature of that physical coordinate with 99% accuracy."*
3. **Demonstrate Activity Tracking (Physics Heuristics):**
   > *"Notice the Activity panel. When he walks, he breaks the phase of the RF waves, generating high temporal variance. When he stands perfectly still, the variance drops, and the dashboard instantly switches to 'Sitting/Still'. We mathematically prove presence without cameras."*
4. **Demonstrate the Fall Alert (Life-saving Tech):**
   > *"Now, watch this."* (Teammate drops quickly to the floor and stays still). *"A fall creates a massive variance spike—followed by total stillness. Our DSP algorithm detects this exact physics profile and triggers a millisecond Fall Alert dispatch."*

---

**Good luck. You have a world-class prototype. Go crush it.**

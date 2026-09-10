import socket
import struct
import numpy as np
import csv
import os
import time

PORT = 5000
DATA_FILE = "backend/data/csi_training_data.csv"

def collect_data():
    print("\n=============================================")
    print("  WiSense Edge AI - Data Collection Utility  ")
    print("=============================================\n")
    print("This script will listen to the ESP32 UDP stream and record")
    print("Wi-Fi signatures for specific zones in the room.")
    print("Make sure the backend 'server.py' is NOT running right now.\n")

    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    file_exists = os.path.isfile(DATA_FILE)

    label = input("Enter the Zone Label (e.g., A1, B2, EMPTY, STANDING_A1, SITTING_B3): ").strip().upper()
    if not label:
        print("Invalid label. Exiting.")
        return

    frames_to_collect = 500
    print(f"\n[GET READY] Please stand in Zone {label}.")
    print("Starting collection in 5 seconds...")
    for i in range(5, 0, -1):
        print(i)
        time.sleep(1)

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.bind(("0.0.0.0", PORT))
    except OSError:
        print("\n[ERROR] Port 5000 is already in use!")
        print("Please stop the backend server.py before running data collection.")
        return
    
    print(f"\n[RECORDING] Collecting {frames_to_collect} frames for '{label}'...")

    collected = 0
    with open(DATA_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        
        # Write header if new file
        if not file_exists:
            headers = ["label"] + [f"subcarrier_{i}" for i in range(51)]
            writer.writerow(headers)

        while collected < frames_to_collect:
            data, addr = sock.recvfrom(2048)
            HEADER_SIZE = 20
            if len(data) < HEADER_SIZE: continue

            magic = struct.unpack("<I", data[:4])[0]
            if magic != 0xC5110001: continue

            iq_data_bytes = data[HEADER_SIZE:]
            iq_array = np.frombuffer(iq_data_bytes, dtype=np.int8)
            
            if len(iq_array) < 2: continue
            
            I = iq_array[0::2]
            Q = iq_array[1::2]
            
            min_len = min(len(I), len(Q))
            I = I[:min_len].astype(np.float32)
            Q = Q[:min_len].astype(np.float32)
            
            amplitudes = np.sqrt(I**2 + Q**2).tolist()
            
            if len(amplitudes) >= 51:
                amplitudes = amplitudes[:51]
            else:
                amplitudes = amplitudes + [0.0] * (51 - len(amplitudes))

            row = [label] + amplitudes
            writer.writerow(row)
            collected += 1
            
            if collected % 50 == 0:
                print(f"  Progress: {collected}/{frames_to_collect} frames")

    sock.close()
    print(f"\n[SUCCESS] Saved {frames_to_collect} frames for '{label}' to {DATA_FILE}")
    print("Run this script again for different zones, or run train_xgboost.py when finished.")

if __name__ == "__main__":
    try:
        collect_data()
    except KeyboardInterrupt:
        print("\nCollection aborted.")

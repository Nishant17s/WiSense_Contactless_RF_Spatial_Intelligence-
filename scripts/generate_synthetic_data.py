import csv
import numpy as np
import os

DATA_FILE = "backend/data/csi_training_data.csv"

def generate_synthetic_data():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    
    labels = ["EMPTY", "A1", "B2", "C3"]
    frames_per_label = 500
    
    # Base amplitude curve (simulating typical Wi-Fi channel response)
    base_amps = np.array([12.0 + np.sin(i * 0.2) * 5.0 for i in range(51)])
    
    with open(DATA_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        headers = ["label"] + [f"subcarrier_{i}" for i in range(51)]
        writer.writerow(headers)
        
        for label in labels:
            for _ in range(frames_per_label):
                # Add base noise
                amps = base_amps + np.random.normal(0, 0.5, 51)
                
                # Apply zone-specific distortion (simulating human blockage)
                if label == "A1":
                    # Deep fade in lower subcarriers
                    amps[5:15] -= np.random.normal(6.0, 1.0, 10)
                elif label == "B2":
                    # Deep fade in middle subcarriers
                    amps[20:30] -= np.random.normal(7.0, 1.0, 10)
                elif label == "C3":
                    # Deep fade in upper subcarriers
                    amps[35:45] -= np.random.normal(5.0, 1.0, 10)
                # EMPTY stays as base_amps
                
                # Ensure no negative amplitudes
                amps = np.clip(amps, 0.0, None)
                
                row = [label] + amps.tolist()
                writer.writerow(row)
                
    print(f"Successfully generated {len(labels) * frames_per_label} rows of synthetic training data at {DATA_FILE}")

if __name__ == "__main__":
    generate_synthetic_data()

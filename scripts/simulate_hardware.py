import time
import urllib.request
import json
import random
import math

URL = "http://localhost:8080/api/v1/csi/ingest"

def post_data(payload):
    req = urllib.request.Request(URL, method="POST")
    req.add_header('Content-Type', 'application/json')
    data = json.dumps(payload).encode('utf-8')
    try:
        urllib.request.urlopen(req, data=data, timeout=1)
    except Exception as e:
        print(f"Failed to send payload: {e}")

def simulate():
    t = 0
    print(f"Starting hardware simulation sending to {URL}...")
    while True:
        try:
            # Generate dummy 51-subcarrier CSI data
            amplitudes = [abs(math.sin(t + i*0.1) * 10 + 20 + random.uniform(-2, 2)) for i in range(51)]
            phases = [math.cos(t + i*0.1) * 3 + random.uniform(-0.2, 0.2) for i in range(51)]
            
            # Simulate a person walking in a circle across zones
            x = math.sin(t*0.5) * 2.5
            y = math.cos(t*0.5) * 2.5
            
            # Map coordinates to a simple zone
            if y > 1: row = "A"
            elif y < -1: row = "C"
            else: row = "B"
            
            if x > 1: col = "3"
            elif x < -1: col = "1"
            else: col = "2"
            
            zone = f"{row}{col}"
            
            payload = {
                "node_id": "TX-01",
                "role": "TX",
                "rssi": -45.0 + random.uniform(-2, 2),
                "amplitudes": amplitudes,
                "phases": phases,
                "people": [
                    {
                        "id": "person_1",
                        "zone": zone,
                        "activity": "Walking",
                        "confidence": 98.5,
                        "x": x,
                        "y": y,
                        "velocity": 1.2
                    }
                ],
                "fall_detected": random.random() < 0.01  # 1% chance of fall per tick just for demo
            }
            post_data(payload)
            
            # Also send pings for RX nodes so they show as ONLINE
            rx1_payload = {
                "node_id": "RX-01",
                "role": "RX",
                "rssi": -55.0,
                "amplitudes": [],
            }
            post_data(rx1_payload)
            
            rx2_payload = {
                "node_id": "RX-02",
                "role": "RX",
                "rssi": -58.0,
                "amplitudes": [],
            }
            post_data(rx2_payload)
            
        except Exception as e:
            print(f"Outer loop error: {e}")
        
        t += 0.1
        time.sleep(0.1)

if __name__ == "__main__":
    simulate()

"""
WiSense Live Ingest Test Script
Streams continuous simulated hardware CSI packets to your Render or Local backend.
Usage:
  python scripts/test_live_stream.py --url https://wisense-gateway-yv5j.onrender.com/api/v1/csi/ingest
"""

import urllib.request
import json
import time
import math
import argparse

def main():
    parser = argparse.ArgumentParser(description="Stream live CSI packets to WiSense Gateway")
    parser.add_argument(
        "--url",
        default="https://wisense-gateway-yv5j.onrender.com/api/v1/csi/ingest",
        help="Target ingest endpoint (Render or Local)",
    )
    parser.add_argument("--rate", type=float, default=10.0, help="Packets per second (Hz)")
    args = parser.parse_args()

    print("=" * 60)
    print("🛰️  WiSense Live Hardware Stream Tester")
    print(f"Target URL: {args.url}")
    print(f"Stream Rate: {args.rate} Hz (~{int(1000/args.rate)}ms delay)")
    print("Press CTRL+C to stop streaming.")
    print("=" * 60)

    t = 0.0
    delay = 1.0 / args.rate
    packet_count = 0

    while True:
        try:
            t += 0.08
            packet_count += 1

            # 1. Calculate continuous room kinematics
            # Target P01: Orbiting from Zone B2 -> A2 -> A1 -> B1 -> C1 -> C2 -> C3 -> B3 -> B2
            x = round(2.8 * math.sin(t * 0.7), 2)
            z = round(2.0 * math.cos(t * 0.7), 2)

            # Determine Zone based on (x, z)
            col = "1" if x < -1.0 else ("2" if x < 1.0 else "3")
            row = "A" if z < -1.0 else ("B" if z < 1.0 else "C")
            current_zone = f"{row}{col}"

            # Calculate synthetic CSI subcarrier amplitudes (51 OFDM subcarriers)
            amplitude = [
                round(38.0 + math.cos((k - 25) * 0.25) * 6 + math.sin(t * 2 + k * 0.1) * 4, 2)
                for k in range(51)
            ]
            phases = [
                round((k - 25) * 0.08 + math.sin(t * 1.5 + k * 0.2) * 0.3, 3)
                for k in range(51)
            ]

            payload = {
                "node_id": "RX-01",
                "role": "RX",
                "rssi": round(-45.0 + math.sin(t * 0.5) * 3, 1),
                "amplitudes": amplitude,
                "phases": phases,
                "fall_detected": False,
                "people": [
                    {
                        "id": "P01",
                        "zone": current_zone,
                        "x": x,
                        "y": 0.9,
                        "z": z,
                        "activity": "Walking",
                        "velocity": 0.85,
                        "confidence": 96.5,
                    }
                ],
            }

            # POST JSON payload
            req = urllib.request.Request(
                args.url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    print(
                        f"\r[Packet #{packet_count:04d}] Sent: Target P01 @ Zone {current_zone} (X: {x:+0.2f}m, Z: {z:+0.2f}m) | RSSI: {payload['rssi']} dBm",
                        end="",
                        flush=True,
                    )

            time.sleep(delay)

        except KeyboardInterrupt:
            print("\n\n⏹️ Stream stopped by user.")
            break
        except Exception as e:
            print(f"\n❌ Error sending packet: {e}")
            time.sleep(1.0)

if __name__ == "__main__":
    main()

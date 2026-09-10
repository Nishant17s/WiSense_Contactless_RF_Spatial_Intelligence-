import re

file_path = "/Users/nishant/Documents/sih-dashboard/contactless-spatial-intelligence/backend/server.py"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update HardwareState initialization
content = content.replace(
    '"TX-01": {"online": False, "last_seen": 0, "rssi": -95.0, "rate": 0},',
    '"TX-01": {"online": False, "last_seen": 0, "rssi": -95.0, "rate": 0, "ip": "192.168.4.101"},'
)
content = content.replace(
    '"RX-01": {"online": False, "last_seen": 0, "rssi": -95.0, "rate": 0},',
    '"RX-01": {"online": False, "last_seen": 0, "rssi": -95.0, "rate": 0, "ip": "192.168.4.102"},'
)
content = content.replace(
    '"RX-02": {"online": False, "last_seen": 0, "rssi": -95.0, "rate": 0},',
    '"RX-02": {"online": False, "last_seen": 0, "rssi": -95.0, "rate": 0, "ip": "192.168.4.103"},'
)

# 2. Update datagram_received to capture IP
old_rx_update = """        if node_str in hw_state.active_nodes:
            hw_state.active_nodes[node_str]["online"] = True
            hw_state.active_nodes[node_str]["last_seen"] = now
            hw_state.active_nodes[node_str]["rssi"] = float(rssi)
            
            # Since RX is receiving, TX must be online
            hw_state.active_nodes["TX-01"]["online"] = True
            hw_state.active_nodes["TX-01"]["last_seen"] = now
            hw_state.active_nodes[node_str]["rate"] = 100"""

new_rx_update = """        if node_str in hw_state.active_nodes:
            hw_state.active_nodes[node_str]["online"] = True
            hw_state.active_nodes[node_str]["last_seen"] = now
            hw_state.active_nodes[node_str]["rssi"] = float(rssi)
            hw_state.active_nodes[node_str]["ip"] = addr[0]  # Dynamically track IP
            
            # Since RX is receiving, TX must be online
            hw_state.active_nodes["TX-01"]["online"] = True
            hw_state.active_nodes["TX-01"]["last_seen"] = now
            hw_state.active_nodes[node_str]["rate"] = 100"""
content = content.replace(old_rx_update, new_rx_update)

# 3. Add Config API Endpoint and Payload Model
api_insert_idx = content.find("class CSIIngestPayload(BaseModel):")
api_code = """import socket

class ConfigPayload(BaseModel):
    node_id: str
    ssid: str
    password: str

@app.post("/api/v1/config/wifi")
async def config_wifi(payload: ConfigPayload):
    if payload.node_id not in hw_state.active_nodes:
        return {"status": "error", "message": "Unknown node"}
    
    target_ip = hw_state.active_nodes[payload.node_id].get("ip", "")
    if not target_ip:
        return {"status": "error", "message": "Node IP unknown (not seen yet)"}
        
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    msg = f"{payload.ssid},{payload.password}".encode('utf-8')
    sock.sendto(msg, (target_ip, 5001))
    sock.close()
    
    return {"status": "ok", "message": f"Config sent to {target_ip}"}

"""
if "ConfigPayload" not in content:
    content = content[:api_insert_idx] + api_code + content[api_insert_idx:]

# 4. Update WebSocket Payload to use dynamic IP
content = content.replace('"ip_address": "192.168.4.101",', '"ip_address": hw_state.active_nodes["TX-01"].get("ip", "192.168.4.101"),')
content = content.replace('"ip_address": "192.168.4.102",', '"ip_address": hw_state.active_nodes["RX-01"].get("ip", "192.168.4.102"),')
content = content.replace('"ip_address": "192.168.4.103",', '"ip_address": hw_state.active_nodes["RX-02"].get("ip", "192.168.4.103"),')

with open(file_path, "w") as f:
    f.write(content)

print("Backend patched successfully.")

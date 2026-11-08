"""
WasteWise Backend Server & UI Runner
Smart Waste Management & Circular Economy Enterprise Platform
"""
import socket
import os
import sys
import threading
import time
import webbrowser
from pathlib import Path
import uvicorn

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

def find_available_port(preferred: int = 8000, fallbacks = (8001, 8080, 8081, 8888, 8008)) -> int:
    if not is_port_in_use(preferred):
        return preferred
    for port in fallbacks:
        if not is_port_in_use(port):
            return port
    return preferred

def open_browser(url: str, delay: float = 1.2):
    def _open():
        time.sleep(delay)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=_open, daemon=True).start()

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    target_port = find_available_port(8000)
    app_url = f"http://127.0.0.1:{target_port}"

    print("\n" + "=" * 65)
    print("      WASTEWISE: SMART WASTE & CIRCULAR ECONOMY PLATFORM")
    print("      AI + Computer Vision + IoT + Geospatial + Marketplace")
    print("=" * 65)
    print(f"\n [✓] WasteWise Live Console: {app_url}")
    print(f" [✓] REST API Swagger Docs: {app_url}/docs")
    print(f" [✓] AI Classifier:        {app_url}/api/ai/classify")
    print(f" [✓] IoT Smart Bins:       {app_url}/api/bins")
    print(f" [✓] CVRP Logistics Fleet:  {app_url}/api/logistics/tasks")
    print(f" [✓] Digital Waste Bank:    {app_url}/api/waste-bank/account")
    print("\n Membuka browser otomatis dalam 1 detik...\n")

    open_browser(app_url)

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=target_port,
        reload=False,
        log_level="info"
    )

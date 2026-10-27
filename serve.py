"""
VibeFX Currency Converter (v1.0.0) - Android Dev Server
Serves the PWA locally with MIME types and displays local LAN IP + ASCII QR Code
so you can scan and open it immediately in Chrome on your Android device.
"""

import http.server
import socket
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and service worker headers
        self.send_header('Service-Worker-Allowed', '/')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    local_url = f"http://{local_ip}:{PORT}"
    loopback_url = f"http://localhost:{PORT}"

    print("=" * 64)
    print("  🚀 VibeFX Currency Converter (v1.0.0) - Mobile Dev Server")
    print("=" * 64)
    print(f"\n  📱 Local Network URL for Chrome on Android:")
    print(f"     👉 {local_url}")
    print(f"\n  💻 PC Desktop Browser:")
    print(f"     👉 {loopback_url}\n")

    try:
        import qrcode
        qr = qrcode.QRCode(border=1)
        qr.add_data(local_url)
        qr.make(fit=True)
        print("  📷 Scan this QR code with your Android phone camera to open:")
        qr.print_ascii(invert=True)
    except Exception as e:
        pass

    print("-" * 64)
    print("  💡 Chrome Android Tips:")
    print("     1. Ensure your phone is connected to the same Wi-Fi network.")
    print("     2. Open the URL above in Chrome on Android.")
    print("     3. Tap 'Install' on the banner or ⋮ > 'Add to Home screen'.")
    print("     4. Once installed, it works completely offline!")
    print("-" * 64)
    print("  Press Ctrl+C to stop the server.\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped. Have fun converting!")
            sys.exit(0)

if __name__ == '__main__':
    main()

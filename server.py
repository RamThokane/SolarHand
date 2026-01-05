# Simple Python HTTP Server for SolarHand
# Run this script to start a local server

import http.server
import socketserver
import webbrowser
import os

PORT = 8080

# Change to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

# Add MIME types for JavaScript modules
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
})

print(f"""
╔══════════════════════════════════════════════════════════════╗
║  🌌 Interactive Solar System - Hand Gesture Control           ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Server running at: http://localhost:{PORT}                      ║
║                                                                ║
║  Opening in your default browser...                            ║
║                                                                ║
║  Press Ctrl+C to stop the server                               ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
""")

# Open browser
webbrowser.open(f'http://localhost:{PORT}')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Thanks for exploring the solar system!")
        httpd.shutdown()

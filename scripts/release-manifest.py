import json
import os
import sys

version, directory = sys.argv[1:3]
repo = os.environ.get("GITHUB_REPOSITORY", "B-Divyesh/sf-point-and-speak-desktop")
base = f"https://github.com/{repo}/releases/download/{version}"
assets = sorted(name for name in os.listdir(directory) if name not in {"SHA256SUMS", "latest.json"})
urls = {name: f"{base}/{name}" for name in assets}
platforms = {
    "linux": [url for name, url in urls.items() if name.endswith((".AppImage", ".deb"))],
    "macos": [url for name, url in urls.items() if name.endswith(".dmg")],
    "windows": [url for name, url in urls.items() if name.endswith((".msi", ".exe"))],
}
print(json.dumps({"version": version, "platforms": platforms, "assets": urls}, indent=2))

#!/bin/sh
set -eu
repo="B-Divyesh/sf-point-and-speak-desktop"
api="https://api.github.com/repos/$repo/releases/latest"
release_json="$(mktemp)"
checksum_file="$(mktemp)"
trap 'rm -f "$release_json" "$checksum_file"' EXIT
curl -fsSL "$api" -o "$release_json"
asset_url="$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(next((a["browser_download_url"] for a in d["assets"] if a["name"].endswith(".AppImage")), ""))' "$release_json")"
sum_url="$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(next((a["browser_download_url"] for a in d["assets"] if a["name"]=="SHA256SUMS"), ""))' "$release_json")"
if [ -z "$asset_url" ] || [ -z "$sum_url" ]; then echo "Linux download is still being published." >&2; exit 1; fi
name="${asset_url##*/}"
target_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
mkdir -p "$target_dir"
download="$target_dir/$name"
curl -fL "$asset_url" -o "$download"
curl -fsSL "$sum_url" -o "$checksum_file"
expected="$(awk -v n="$name" '$2==n || $2=="*"n {print $1}' "$checksum_file")"
actual="$(sha256sum "$download" | awk '{print $1}')"
if [ -z "$expected" ] || [ "$expected" != "$actual" ]; then rm -f "$download"; echo "Checksum did not match. Nothing was installed." >&2; exit 1; fi
chmod +x "$download"
link="$target_dir/point-and-speak"
ln -sf "$download" "$link"
echo "Installed $link and verified SHA256. Run: point-and-speak"

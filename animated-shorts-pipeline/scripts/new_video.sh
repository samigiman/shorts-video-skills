#!/usr/bin/env bash
# usage: ./new_video.sh /path/to/workspace K  -> links the engine and writes index<K>.html
set -e; WS=$1; K=$2; HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$WS"; [ -e "$WS/engine" ] || ln -s "$HERE/engine" "$WS/engine"
sed "s/KEY/$K/g" "$HERE/engine/template.html" > "$WS/index$K.html"
echo "ready: $WS/index$K.html  (now write $WS/scenes$K.js)"

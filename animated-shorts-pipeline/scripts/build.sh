#!/usr/bin/env bash
# usage: ./build.sh K NAME   (run inside the video workspace) -> $OUT/NAME.mp4
set -e; K=$1; NAME=$2; OUT=${OUT:-out}; mkdir -p "$OUT"; HERE=$(dirname "$0")
D=$(python3 -c "import json;print(json.load(open('t$K.json'))[-1]['e']+4.2)"); N=$(python3 -c "print(int($D*30))"); H=$((N/2))
python3 "$HERE/render.py" 0 $H p${K}1.mp4 $K > l${K}1.txt 2>&1 &
python3 "$HERE/render.py" $H $N p${K}2.mp4 $K > l${K}2.txt 2>&1 &
wait
printf "file p${K}1.mp4\nfile p${K}2.mp4\n" > list$K.txt
ffmpeg -y -loglevel error -f concat -i list$K.txt -i v$K.wav -i m$K.wav -filter_complex "[1:a]aresample=44100[v];[2:a]volume=0.22[m];[v][m]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t $D -movflags +faststart "$OUT/$NAME.mp4"
grep -h ERR l${K}1.txt l${K}2.txt | head -3 || true
echo built "$OUT/$NAME.mp4"

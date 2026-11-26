---
name: animated-shorts-pipeline
description: Build finished vertical (1080x1920, 30 fps) animated explainer videos for TikTok, Reels and Shorts from a script and a voiceover — Canvas 2D scenes rendered frame by frame with Playwright, word-synced captions aligned from the audio itself, music ducked under speech, and a cover image. Use this whenever someone wants a short animated science/tech/history explainer, a "did you know" video, a faceless TikTok channel video, a reply video to a viewer comment, or asks to turn a script and voiceover into a finished MP4, even if they never mention canvas or Playwright.
---

# Animated shorts pipeline

Turns a script plus a voiceover file into a finished vertical MP4 and a cover PNG. Every frame is drawn by code, so there are no stock clips, no logos and no licensing worries, and every beat can be animated exactly to the words.

The pipeline was built and battle-tested on a daily science channel (50+ videos). Its defaults reflect what that audience responded to: a strong hook in the first 2 seconds, lots of motion, very little on-screen text, captions that never cover the visuals.

## Requirements

- Python 3 with `numpy`, `Pillow`, `playwright` (+ `playwright install chromium`, or system Chrome: scripts launch `channel='chrome'`; drop that argument to use bundled Chromium)
- `ffmpeg`, `node` (for `node --check`)
- Fonts installed system-wide: Poppins (captions/stamps) and Inter Display. Any bold sans works; change the font names in `engine/core.js` if needed.
- Royalty-free music tracks you are allowed to use, saved as `lib/<mood>.wav` (44.1 kHz mono), e.g. `lib/mysterious.wav`, `lib/curious.wav`. None are bundled.

## Files

```
scripts/
  new_video.sh    set up a workspace: links engine/, writes index<K>.html
  align.py        word timings from the voiceover's silences (no ASR, free)
  fixal.py        re-spread word timings over a time range when alignment slips
  mkcaps.py       caption chunks -> caps<K>.js (spoken numbers -> digits via rep<K>.json)
  libmusic.py     loop + level + fade + duck a music track -> m<K>.wav
  shot.py         render chosen timestamps to shots/ for review
  sheet.py        12-up contact sheets of those shots
  render.py       render a frame range to H.264 (build.sh runs two halves in parallel)
  build.sh        final MP4: video + voice + music -> $OUT/NAME.mp4
  cover.py        cover PNG from index<K>C.html
  scene_helpers.js  extra helpers (ck, xm, QM, chip, brainI, clockI, pad) to paste on top of a scenes file
  engine/         canvas drawing library, overlay (brand, progress ruler, captions), brand.js
assets/
  example_scenesWF.js   a complete real scenes file (Wi-Fi name origin video)
  example_coverWF.js    a matching cover
```

Each video gets a short key `K` (e.g. `WF`). Everything for that video is named after it: `K.txt`, `scenesK.js`, `indexK.html`, `vK.wav`, `mK.wav`, `tK.json`, `wK.json`, `capsK.js`.

Edit `engine/brand.js` once: channel name, @handle, and the follow-button labels in your language.

## Workflow

### 1. Script → caption units

Write `K.txt` as plain text (no voice tags). Numbers are written as words, because TTS reads digits badly; captions show digits later via `repK.json`.

Units are split with this regex, and scenes are keyed to unit indices, so print them before writing scenes:

```python
import re; t=open('K.txt').read().strip()
for i,u in enumerate(re.findall(r'[^,.?!:]+[,.?!:]+"?|[^,.?!:]+$',t)): print(i,u.strip())
```

Avoid lots of tiny comma fragments — every unit is a place the aligner has to find a pause.

### 2. Voiceover → timings

Put the voiceover at `new/K.mp3` (see the `elevenlabs-voiceover-handoff` skill for generating and fetching it).

```bash
ffmpeg -y -i new/K.mp3 -af "atempo=1.0,highpass=f=70,loudnorm=I=-15:TP=-1.2:LRA=9" -ar 44100 -ac 1 vK.wav
python3 scripts/align.py K new/K.mp3 1.0      # -> (units, matched, duration)
```

`align.py` finds pauses with an RMS threshold and matches unit boundaries to them with dynamic programming (strong punctuation is expensive to skip, commas are cheap), then spreads words inside a unit by character length. It costs nothing and is accurate to roughly a syllable when the voice pauses at punctuation. If you speed the voice up with `atempo`, pass the same tempo to `align.py`.

**Check the result.** Print unit starts and durations. A unit that is suspiciously short (0.2 s for six words) next to one that is far too long means a boundary snapped to the wrong pause. Fix it by re-spreading that range between two trusted anchors:

```bash
python3 scripts/fixal.py K 10:13:25.25:37.0     # units 10..13 spread over 25.25s..37.0s
```

If many units fail to match, lower `MINP` in `align.py` (0.05 s suits fast voices, 0.09 s slower ones).

### 3. Captions and music

```bash
echo '[["iki min altıda","2006-da"],["min dəfə","1000 dəfə"]]' > repK.json   # optional, longest first
python3 scripts/mkcaps.py K
MUSIC_LIB=lib python3 scripts/libmusic.py K mysterious
```

### 4. Scenes

```bash
scripts/new_video.sh ./work K
```

Write `scenesK.js`: one function per beat, each starting with `TT=a;` and a background, ending with the scene list and ruler. Copy `scripts/scene_helpers.js` to the top. Study `assets/example_scenesWF.js` first; it shows the whole shape. The tail looks like this:

```js
function SO(a){outro(a,ue(LAST)+0.3)}
const SC=camWrapM([[0,S0],[u(5)-0.15,S1],[u(8)-0.15,S2],[ue(LAST)+0.2,SO]],[0,'iris','zoom','glitch','whip']);
const MS=[[u(5),'1999'],[u(8),'Agency']];          // progress-ruler labels
const OV0=u(5)-0.1, OV1=u(23)-0.2, END=UE[UE.length-1]+4.2;  // overlay on/off
```

Timing helpers: `u(i)` start of unit i, `ue(i)` end, `ST(i)` stamp progress from unit i. Drawing: `sbg`, `txt`, `rrect`, `circ`, `line`, `glow`, `person`, `earth`, `brainI`, `chip`, `stampX` (tilted label), `countUp`, `spring`, `drawOn`, `slam`, `follow` (animated follow button), `outro`.

Layout rules that keep videos readable:
- Stamps at y≈420 (top) or y≈1150–1250. Captions sit at y≈1440; keep every other label above ~1260 so captions never cover it.
- One short stamp per beat. Motion carries the explanation, not text.
- After the hook, call `follow(a,u(i),540,860)` for the "follow us" beat.
- For a reply video, leave the screen centre (y 420–1150) empty for ~4 s while the viewer's question is read, so the creator can place the platform's comment sticker there.
- Draw shapes, not emoji (emoji do not render in headless Chrome), and never draw real logos, brand marks or known characters.

`node --check scenesK.js` after every edit.

### 5. Review before building

```bash
python3 scripts/shot.py K 1 4 8 12 ...        # ~one timestamp per unit midpoint
python3 scripts/sheet.py K                    # -> shots/sheetK0.png, sheetK1.png
```

Look at every sheet. Typical fixes: labels overlapping captions, a stamp too wide (shrink `size`), objects drifting off screen, empty beats where the voice talks but nothing moves, a stamp that appears before the narration reaches it. Re-shoot only what you changed.

### 6. Build and verify

```bash
OUT=out scripts/build.sh K NAME
ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 out/NAME.mp4
```

Video-stream duration must equal the container duration; a short video stream means one render half crashed (`grep ERR lK1.txt lK2.txt`, fix, re-run only that half with `render.py`). On a 2-CPU machine, build several videos sequentially in the background (`nohup ... &`) rather than in parallel.

### 7. Cover

Write `coverK.js` overriding `window.render` (see `assets/example_coverWF.js`), add `<script src="coverK.js"></script>` after `main3.js` in a copy `indexKC.html`, then `OUT=out python3 scripts/cover.py K:NAME_cover`. Three stacked lines of big text with a thick black stroke plus one large visual reads best as a thumbnail.

## Splicing a sentence without re-voicing

To add or replace one sentence (a fresh fact, a correction), generate only that sentence, then:

1. Decode the original to WAV; find a true silence near the cut by RMS at 10 ms steps (alignment word ends can be 30–60 ms off; cutting inside an onset clicks).
2. `atrim` the original into before/after, trim leading/trailing silence from the insert, add 6 ms fades and ~0.25 s padding, `concat`.
3. Update `K.txt`, re-run `align.py` on the new WAV, then shift every `u(n)`/`ue(n)`/`ST(n)` with `n >=` the insert point in the scenes file by the number of inserted units. A regex over the scene body (not the helpers) does it; also update literal index lists such as `[11,12,13].filter(...)`.

## Delivering

Send the MP4s and covers in small batches (a dozen files in one message may not render on mobile). With each video give: the structure, verified facts with sources, any simplification or unverified point, the TTS credits spent, every file that landed on the user's computer, and a ready caption with hashtags.

---
name: elevenlabs-voiceover-handoff
description: Generate voiceovers with the ElevenLabs connector without wasting credits, and get the audio into a sandbox that cannot reach ElevenLabs' CDN — price first, one take, batch several scripts, fetch through the user's Chrome as a single bundle, stage it from Downloads, split it, and splice in single sentences instead of re-voicing. Use whenever a video, podcast or narration task needs ElevenLabs speech, whenever generated audio must be moved from elevenlabsusercontent.com into the workspace, or when a user is careful about their ElevenLabs credit balance.
---

# ElevenLabs voiceover handoff

Two problems keep coming up when ElevenLabs speech feeds a local pipeline:

1. **Credits.** A generation costs roughly one credit per character of text, and the default is two takes. Users notice when credits disappear without warning.
2. **Access.** The workspace shell usually cannot download from `elevenlabsusercontent.com` (network allowlist), and the connector returns signed URLs, not files.

This skill handles both.

## 1. Price before you spend

- Write the final script first and count characters (`wc -m`). Tags such as `[excited]` count too.
- Call `creative_generate_speech` with `estimate_only: true` and the exact prompt. It returns the credit cost and charges nothing.
- Tell the user the number before generating ("≈1,400 credits"). If the real estimate is higher than a number you already gave, say so in one line before continuing.
- Always pass `generations_count: 1`. Two takes doubles the cost, and the first take is almost always usable.
- If a call fails, do not retry blindly: a second call starts and charges a second generation.

Trim before paying. Long scripts are the main cost driver; a 1,700-character script that becomes 1,350 saves ~20%.

## 2. Voice and model

- `voice_id` must come from `creative_list_voices` or the user. Voice IDs do not carry over between accounts or workspaces; if a saved ID fails, list voices again rather than guessing.
- `eleven_v4` supports inline direction tags (`[curious]`, `[mysterious]`, `[excited]`, `[serious]`, `[calm]`). One tag per paragraph is enough.
- Spell out what TTS reads badly: numbers as words, acronyms phonetically ("Si-plas-plas" for C++, "Ay-Tripl-İ" for IEEE). Map them back to digits/symbols in the captions afterwards.
- Pass a `flow_id` you own and reuse it. If a stored flow returns "You do not have access", omit `flow_id` once (a new flow is created) and reuse that one from then on.

## 3. Batch, then fetch once

Generate all scripts for a batch first (several `creative_generate_speech` calls in one turn), then call `creative_get_flow_run_status` **once** with all `session_ids`. Each completed generation has a signed `content_url` valid for a few hours.

The workspace cannot download it directly, so use the user's browser:

1. Open one of the signed URLs in a new Claude in Chrome tab (`navigate`).
2. Run JavaScript in that tab that fetches every URL, concatenates the blobs, and triggers one download. Return the individual sizes — you need them to split:

```js
const U=[/* other signed urls */];
const bs=[await fetch(location.href).then(r=>r.blob())];
for(const u of U) bs.push(await fetch(u).then(r=>r.blob()));
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(bs));
a.download='batch.bin';document.body.appendChild(a);a.click();
await new Promise(r=>setTimeout(r,5000));
bs.map(b=>b.size)
```

3. Close the tab.
4. Find the file in `~/Downloads`. Chrome often leaves it under a hidden temporary name such as `.com.google.Chrome.XXXXXX`; look for the entry whose size equals the sum of the returned sizes. Stage it with `device_stage_files`.
5. Split by the byte sizes (MP3 frames are self-contained, so concatenated files cut cleanly):

```python
d=open(staged,'rb').read(); sizes=[1082964,1025704,1047438]
o=0
for k,n in zip(['A','B','C'],sizes): open(f'new/{k}.mp3','wb').write(d[o:o+n]); o+=n
```

One bundle means one file on the user's computer instead of many. Tell the user its name and size so they can delete it.

If Chrome is not connected (e.g. the user is on their phone), give them the signed link to download and attach, and note that it expires.

## 4. Process

```bash
ffmpeg -y -i new/K.mp3 -af "atempo=1.0,highpass=f=70,loudnorm=I=-15:TP=-1.2:LRA=9" -ar 44100 -ac 1 vK.wav
```

Speed up only voices that drag (`atempo` 1.05–1.12); keep cloned voices of a real person at 1.0. Word timings can come free from silence alignment (see `animated-shorts-pipeline`) instead of paid transcription.

## 5. Change a line without re-voicing

When new information arrives after voicing (a breaking update, a correction), generate only the new sentence(s) — usually 100–200 credits instead of the whole script — and splice:

1. Decode the original to WAV. Measure RMS in 10 ms windows around the intended cut and choose the middle of a real silence.
2. Trim the insert's leading/trailing silence (`silenceremove` + `areverse`), add a 6 ms fade-in and ~0.25 s padding.
3. Cut the original with `atrim` (never `-ss` on MP3, which is not sample-accurate), add 6 ms fades at the cut, `concat` the three parts.
4. Re-align the full file and shift any timing-dependent indices.

## 6. Report

When delivering, state: credits per generation and total, the voice used, and every file downloaded to the user's computer (name, size, that it can be deleted).

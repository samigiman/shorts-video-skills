# Claude skills for short-form explainer videos

Three [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) extracted from producing 50+ animated science explainers for a TikTok channel ("Necə Oldu?", Azerbaijani).

| Skill | What it does |
|---|---|
| [`animated-shorts-pipeline`](animated-shorts-pipeline/) | Script + voiceover → finished 1080×1920 MP4: Canvas 2D scenes rendered with Playwright, free word-sync from silence alignment, ducked music, cover PNG. Includes the full drawing engine. |
| [`elevenlabs-voiceover-handoff`](elevenlabs-voiceover-handoff/) | Credit-safe ElevenLabs voiceovers: price first, one take, batch, fetch through Chrome as one bundle, split, splice single sentences. |
| [`fact-checked-shorts-scripting`](fact-checked-shorts-scripting/) | Topic ideas, provocative-but-true hooks, sourced scripts, neutral handling of sensitive topics, comment fact-checks, posting kits. |

## Install

Copy a skill folder into `~/.claude/skills/` (Claude Code) or upload it as a skill in Claude. The pipeline needs Python 3 (numpy, Pillow, playwright), ffmpeg, node, the Poppins / Inter Display fonts, and your own royalty-free music in `lib/<mood>.wav`.

Set your channel name and handle in `animated-shorts-pipeline/scripts/engine/brand.js`.

## Notes

- No music, voice or logo assets are included.
- Example scenes are in Azerbaijani; the engine is language-agnostic (captions wrap by measured width).

MIT License.

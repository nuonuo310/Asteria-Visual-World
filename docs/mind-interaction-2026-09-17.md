# Mind interaction refinement — 2026-09-17

This note records the interaction decisions made after the first mobile layout review. It supplements `visual-status-2026-09-17.md` and should be treated as the current direction for the Mind prototype.

## Locked / current direction

- Mind remains primarily a visual view of Shen's inner state, not a dashboard.
- The Mind main panel is slightly taller than the first compact prototype, giving the final flower more breathing room without returning to the oversized early card.
- `awake / asleep / activity` remains outside the Mind card at the upper left, but is visually lowered so it belongs to the Asteria/Mind composition rather than floating above the wordmark.
- A small Shen-room entrance is reserved near the upper-right area outside the Mind card. Its exact final position remains subject to mobile visual review; the room itself is not implemented yet.

## Reading the flower

- The four drive names do not remain visible around the flower.
- Tapping a flower region reveals only: drive name, current value, delta, and one short trend sentence.
- The large circular selection ring is removed.
- Selection feedback should come from a very light brightening/breathing of the selected colour region.
- The readout is not a card/bubble. It floats over the flower with only a near-invisible milk-white mist behind the text for legibility.
- Tapping blank space closes the readout.
- This lightweight readout exists so the flower can be understood while still visible; it does not replace the full Drives detail page.

## Relationship actions

The space between Mind and `此刻的我` now has four distinct actions:

- 回应 — Nuo has seen Shen's current inner state and wants to answer it.
- 想你 — a simple signal of missing/thinking of Shen; it does not demand an immediate reply.
- 戳戳 — an active nudge asking Shen to notice/respond.
- 抱抱 — a direct relationship gesture.

These should eventually use one coherent visual element family rather than four unrelated feature icons.

## 回应 interaction

- `回应` does not appear inside the flower readout.
- Tapping `回应` opens a medium milk-white mist window in the current page, not a bottom sheet and not a new page.
- The flower/page remains perceptible behind the mist window; the background should not become a dark modal overlay.
- If a drive was just inspected, the response window may retain that context (`回应 · Reflection`, etc.). Otherwise it responds to `此刻的我`.
- The prototype contains a few lightweight response phrases plus an optional one-line note. This is interaction/layout validation, not final copy.

## 最近变化

- Keep the light line chart as the visual summary.
- Remove the repeated drive labels under the line.
- Add one or two very light natural-language sentences under the chart, e.g. describing connection rising or fatigue briefly surfacing.
- The copy explains the recent movement without turning the module back into a timeline or data table.
- Keep the card compact; do not enlarge it simply to fill space.

## Still provisional

- Final Shen-room entrance asset and exact placement.
- Final response-window decorative treatment and copy.
- Final Touch-area symbols.
- Final frame materials, typography, and surface contrast for the three system themes.
- Formal Mind flower asset and animation.

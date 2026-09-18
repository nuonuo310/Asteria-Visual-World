# Asteria Elements v1

This layer extracts the reusable visual grammar already proven by locked Home and Mind. It does **not** redesign those pages.

## Ownership split

Use CSS / HTML for:
- frames, borders, radii, shadows, gradients, spacing;
- default / selected / accent state;
- typography hierarchy and theme colour.

Use reusable SVG shapes only where a repeated hand-drawn silhouette matters:
- four-point semantic spark;
- room door;
- moon / cycle mark;
- soft bow / tie;
- paper corner;
- separated-drive mini flower;
- paired relationship trace.

## Semantic rules

- **Four-point spark**: exactly one when marking the most important current conclusion / context. Never generic decoration.
- **Door**: only for a real room / place entrance.
- **Moon**: time, cycle, Memory, or night context.
- **Bow**: tactile/gift/keepsake detail, sparse.
- **Paper**: notes, letters, diary fragments; not a generic card icon.
- **Mini flower**: one drive at a time; colour belongs to the drive.
- **Relationship trace**: always paired. It encodes after-effect / resonance, never relationship quality or score.

## States

All shared elements use four states:
- `quiet`: background / ambient presence.
- `default`: readable but secondary.
- `selected`: stronger outline/colour, local glow only.
- `accent`: meaningful current emphasis.

Do not animate by default. If motion is added later, it should be slow breathing/flow, never heartbeat blinking unless the semantic is actually heartbeat.

## Files

- `assets/asteria-elements-v1.svg` — reusable SVG symbol sprite.
- `asteria-elements.css` — theme/state sizing and shared code-owned surface recipe.
- `elements-v1.html` — isolated review sheet; not linked into Home/Mind navigation.

## Next asset pass

Still intentionally unresolved:
- official Mind master flower;
- higher-detail door unique to Shen/Nuo rooms;
- final paper grain / physical texture;
- room-specific keepsakes.

Those should be designed after the v1 grammar is accepted, not guessed here.

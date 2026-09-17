# Asteria-Visual-World

A local-first visual world for Asteria — bringing its home, conversations, mind, memory, letters, diary, studio, and shared traces into one living interface.

## Current visual work

Home and Mind now have a locked mobile-first visual / interaction baseline. The next engineering phase can begin moving those locked surfaces away from hard-coded prototype data while unfinished modules remain untouched.

- Home: `index.html` — structure / content skeleton locked; surface assets and real data may continue to evolve.
- Mind: `mind.html` — visual structure and current interaction language locked.
- Current visual status / lock baseline: [docs/visual-status-2026-09-18.md](docs/visual-status-2026-09-18.md)
- Previous construction record: [docs/visual-status-2026-09-17.md](docs/visual-status-2026-09-17.md)

The current system preview keeps three very-light background themes (Pearl Warm White, Misty Pink White, Lavender Gray White). Mind keeps its own fixed pink / mist-purple / light-blue / warm-apricot-gold color family; state changes are expressed through intensity, diffusion, clustering, transparency, and motion rather than replacing the hue family.

## Implementation boundary

For locked Home / Mind surfaces, the intended direction is:

`locked UI -> view data contract -> local store -> runtime events/actions`

Unconfirmed Chat, Memory, Shen/Nuo room structures should not be frozen into code merely to make the data layer look complete.
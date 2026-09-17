# Home / Mind View Store v1

Status: **foundation slice — review branch, not yet wired into locked UI**  
Branch: `codex/home-mind-data-foundation`

## Why this exists

Home and Mind now have a locked visual / interaction baseline. Their next implementation step should not be to bind page code directly to Continuum internals. The visual world needs a small stable boundary that can accept local prototype data now and Runtime-produced data later.

The first slice therefore adds `view-store.js` and deliberately changes **no visual behavior**.

## Scope

v1 supports only:

- `home`
- `mind`

It does not define or guess schemas for Chat, Memory, Shen room, Nuo room, Heartbeat, Ongoing Threads, Diary, or action execution.

## Envelope

Each stored surface uses a versioned envelope:

```js
{
  schemaVersion: 1,
  surface: 'mind',
  revision: 3,
  updatedAt: '2026-09-18T...',
  source: 'local',
  payload: { /* surface-owned view data */ }
}
```

The envelope is intentionally generic. The next slice can define the **known, already-approved** Home / Mind payload fields without making the store depend on Runtime implementation details.

## API

`window.AsteriaViewStore` exposes:

- `read(surface, fallback)` — returns a cloned payload or fallback.
- `readEnvelope(surface)` — returns envelope metadata + payload.
- `write(surface, payload, { source })` — replaces one surface payload and increments revision.
- `patch(surface, partial, { source })` — shallow-patches an object payload.
- `clear(surface)` — removes one surface snapshot.
- `subscribe(surface, listener)` — same-page change subscription.

Cross-tab changes are forwarded through the browser `storage` event. Same-page writes emit `asteria:view-store-change`.

## Failure behavior

- Unknown surfaces are rejected instead of silently creating future schemas.
- Malformed / wrong-version local data is ignored and the caller can fall back to the current prototype data.
- `localStorage` write failures return `{ ok: false, error }`; the UI is not forced to crash.
- Values are cloned at the boundary so page code does not mutate the stored object by reference.

## Planned next slice

Only after review:

1. Define the minimal payload fields already visible in locked Home / Mind.
2. Move current hard-coded prototype values behind adapters while preserving pixel / interaction output.
3. Load from `AsteriaViewStore` first, with the existing prototype snapshot as fallback.
4. Later add a Runtime adapter that writes the same view payload contract.

This keeps the dependency direction:

`Runtime -> adapter -> View Store -> locked UI`

not:

`locked UI -> Continuum internals`

The first slice stops here intentionally so sleeping-time work does not silently decide unfinished product semantics.
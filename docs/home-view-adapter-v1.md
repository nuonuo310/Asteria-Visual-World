# Home view adapter v1 (2026-09-21)

Home's locked visual structure stays unchanged. The browser loads `view-store.js` and `home-view.js` before `app.js`. Without a valid Home snapshot, the existing prototype content remains visible. This is a **view-only data bridge**, not shared-device sync, an editing UI, or a connection to Continuum.

To supply actual view data, a future authorized producer can call:

```js
AsteriaViewStore.patch('home', {
  daysTogether: 257, // optional; calculate from the agreed start date upstream
  relationshipTrace: '...',
  note: { title: 'To. Nuo', body: '...', reply: { from: 'From. Shen', body: '...' } },
  chatCount: 0, // only when a real source can provide it
  footprints: [{ label: 'Together', time: '20:18', text: '...' }]
}, { source: 'authorized-view-producer' });
```

All fields are optional; absent/invalid fields fall back to the original prototype values. Footprints accept 0–3 entries, preserving the agreed short Home summary. Text is inserted using `textContent`, never HTML. `AsteriaViewStore.clear('home')` restores the original prototype values. Same-page and cross-tab store notifications update the view; browser localStorage does not synchronize across devices.

This slice deliberately does not infer an anniversary date, invent messages, create room routes, or connect fake chat counts to real data. Existing Home calendar and footprint expansion remain intact. Manual browser/device acceptance is still required.

/* Asteria Visual World — local view-store boundary, v1.
   Scope is deliberately limited to already locked Home and Mind surfaces.
   This module knows nothing about Continuum internals, Heartbeat, Memory, Chat,
   or room schemas. Runtime adapters can replace the producer later without
   forcing the visual layer to change its storage contract. */
(() => {
  'use strict';

  const SCHEMA_VERSION = 1;
  const PREFIX = 'asteria.visual.view.v1';
  const SUPPORTED = new Set(['home', 'mind']);
  const listeners = new Map();

  function assertSurface(surface) {
    if (!SUPPORTED.has(surface)) {
      throw new Error(`Unsupported Asteria view surface: ${surface}`);
    }
  }

  function keyFor(surface) {
    assertSurface(surface);
    return `${PREFIX}:${surface}`;
  }

  function clone(value) {
    if (value == null) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function parseEnvelope(raw, surface) {
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      if (!value || value.schemaVersion !== SCHEMA_VERSION || value.surface !== surface) return null;
      if (!Object.prototype.hasOwnProperty.call(value, 'payload')) return null;
      return value;
    } catch (_) {
      return null;
    }
  }

  function readEnvelope(surface) {
    const key = keyFor(surface);
    try {
      return parseEnvelope(localStorage.getItem(key), surface);
    } catch (_) {
      return null;
    }
  }

  function read(surface, fallback = null) {
    const envelope = readEnvelope(surface);
    return envelope ? clone(envelope.payload) : clone(fallback);
  }

  function notify(surface, envelope) {
    const detail = envelope ? clone(envelope) : null;
    (listeners.get(surface) || new Set()).forEach((listener) => listener(detail));
    window.dispatchEvent(new CustomEvent('asteria:view-store-change', {
      detail: { surface, envelope: detail }
    }));
  }

  function write(surface, payload, options = {}) {
    assertSurface(surface);
    if (payload === undefined) throw new TypeError('Asteria view payload cannot be undefined');

    const previous = readEnvelope(surface);
    const envelope = {
      schemaVersion: SCHEMA_VERSION,
      surface,
      revision: previous ? previous.revision + 1 : 1,
      updatedAt: new Date().toISOString(),
      source: options.source || 'local',
      payload: clone(payload)
    };

    try {
      localStorage.setItem(keyFor(surface), JSON.stringify(envelope));
    } catch (error) {
      return { ok: false, error };
    }

    notify(surface, envelope);
    return { ok: true, envelope: clone(envelope) };
  }

  function patch(surface, partial, options = {}) {
    if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
      throw new TypeError('Asteria view patch must be an object');
    }
    const current = read(surface, {});
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      throw new TypeError(`Cannot patch non-object ${surface} payload`);
    }
    return write(surface, { ...current, ...clone(partial) }, options);
  }

  function clear(surface) {
    const key = keyFor(surface);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return { ok: false, error };
    }
    notify(surface, null);
    return { ok: true };
  }

  function subscribe(surface, listener) {
    assertSurface(surface);
    if (typeof listener !== 'function') throw new TypeError('listener must be a function');
    if (!listeners.has(surface)) listeners.set(surface, new Set());
    listeners.get(surface).add(listener);
    return () => listeners.get(surface)?.delete(listener);
  }

  window.addEventListener('storage', (event) => {
    if (!event.key || !event.key.startsWith(`${PREFIX}:`)) return;
    const surface = event.key.slice(PREFIX.length + 1);
    if (!SUPPORTED.has(surface)) return;
    notify(surface, parseEnvelope(event.newValue, surface));
  });

  window.AsteriaViewStore = Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    surfaces: Object.freeze([...SUPPORTED]),
    read,
    readEnvelope: (surface) => clone(readEnvelope(surface)),
    write,
    patch,
    clear,
    subscribe
  });
})();
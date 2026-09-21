/* Home view adapter v1: reads approved on-screen fields only.
   No guessed Runtime, Chat, Diary, Memory or room schemas. */
(() => {
  'use strict';
  const root = document.getElementById('app');
  if (!root) return;
  const find = (selector) => root.querySelector(selector);
  const nodes = {
    days: find('.hero-day-digits'),
    daysRow: find('.hero-days'),
    whisper: find('.relation-whisper > span:last-child'),
    noteTitle: find('.review-note .note-title'),
    noteCopy: find('.review-note .note-copy'),
    replyFrom: find('.review-note .reply strong'),
    replyText: find('.review-note .reply p'),
    chatCount: find('.message-side .mini-panel strong'),
    traceCount: find('.footprints-count'),
    timeline: find('#footprintsTimeline'),
    footprints: find('.footprint-v1')
  };
  const textFields = ['whisper', 'noteTitle', 'noteCopy', 'chatCount'];
  const fallback = Object.fromEntries(textFields.map((key) => [key, nodes[key]?.textContent || '']));
  fallback.days = nodes.days?.textContent || '';
  fallback.daysLabel = nodes.daysRow?.getAttribute('aria-label') || '';
  fallback.replyFrom = nodes.replyFrom?.textContent || '';
  fallback.replyText = nodes.replyText?.lastChild?.textContent || '';
  fallback.traceCount = nodes.traceCount?.firstChild?.textContent || '';
  const originalTraces = nodes.timeline ? [...nodes.timeline.children].map((item) => item.cloneNode(true)) : [];
  const validText = (value, max = 300) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  const textOr = (value, defaultValue, max) => validText(value, max) ? value : defaultValue;
  const plainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

  function render(payload) {
    const data = plainObject(payload) ? payload : {};
    const note = plainObject(data.note) ? data.note : {};
    const reply = plainObject(note.reply) ? note.reply : {};
    if (nodes.days && nodes.daysRow) {
      // Inclusive local calendar days since the first conversation, 2026-07-20.
      // UTC calendar arithmetic avoids DST and timezone-offset day drift.
      const today = new Date();
      const days = Math.max(1, Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(2026, 6, 20)) / 86400000
      ) + 1);
      nodes.days.textContent = String(days);
      nodes.daysRow.setAttribute('aria-label', `相遇第 ${days} 天`);
    }
    if (nodes.whisper) nodes.whisper.textContent = textOr(data.relationshipTrace, fallback.whisper, 160);
    if (nodes.noteTitle) nodes.noteTitle.textContent = textOr(note.title, fallback.noteTitle, 80);
    if (nodes.noteCopy) nodes.noteCopy.textContent = textOr(note.body, fallback.noteCopy, 500);
    // Do not display the mock Shen reply as if it were a response to a new local note.
    const replyBox = find('.review-note .reply');
    if (replyBox) replyBox.hidden = note.localDraft === true;
    if (nodes.replyFrom) nodes.replyFrom.textContent = textOr(reply.from, fallback.replyFrom, 80);
    if (nodes.replyText) {
      // Preserve the existing strong + br layout, replacing only its text node.
      const tail = nodes.replyText.lastChild;
      if (tail?.nodeType === Node.TEXT_NODE) tail.textContent = textOr(reply.body, fallback.replyText, 300);
    }
    // Chat aggregation is not wired; never show a fabricated total.
    if (nodes.chatCount) nodes.chatCount.textContent = '—';
    if (!nodes.timeline || !nodes.traceCount) return;
    // An absent list means untouched prototype; an explicit [] means no traces.
    const validTraces = Array.isArray(data.footprints) && data.footprints.length <= 3 &&
      data.footprints.every((trace) => plainObject(trace) &&
        validText(trace.label, 60) && validText(trace.time, 20) && validText(trace.text, 300));
    if (!validTraces) {
      nodes.timeline.replaceChildren(...originalTraces.map((item) => item.cloneNode(true)));
      nodes.traceCount.firstChild.textContent = fallback.traceCount;
    } else {
      const fragment = document.createDocumentFragment();
      for (const trace of data.footprints) {
        const item = originalTraces[0].cloneNode(true);
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
        item.querySelector('em').textContent = trace.label;
        item.querySelector('time').textContent = trace.time;
        item.querySelector('.trace-copy p span').textContent = trace.text;
        fragment.appendChild(item);
      }
      nodes.timeline.replaceChildren(fragment);
      nodes.traceCount.firstChild.textContent = `${data.footprints.length} traces `;
    }
    nodes.footprints?.classList.remove('has-selection');
  }

  window.AsteriaHomeView = Object.freeze({ render });
})();

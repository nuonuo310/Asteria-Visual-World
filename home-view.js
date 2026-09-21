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
  const localDate = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
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
    // Four permanent visual modules, one per category. Only verified dated
    // feed events may replace the neutral placeholders; never invent daily life.
    const categories = ['together', 'forYou', 'littleOnes', 'broughtHome'];
    const feed = plainObject(data.todayFeed) ? data.todayFeed : null;
    const validEvents = !!(feed && feed.date === localDate() && Array.isArray(feed.events)
      && feed.events.length <= 3 && feed.events.every(event =>
        plainObject(event) && categories.includes(event.category)
        && validText(event.time, 5) && /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)
        && validText(event.text, 180) && validText(event.source, 120)
        && event.source !== 'home-local-footprints'));
    const events = validEvents ? feed.events : [];
    for (const category of categories) {
      const card = nodes.timeline.querySelector(`[data-category="${category}"]`);
      if (!card) continue;
      const event = events.find(entry => entry.category === category);
      const copy = card.querySelector('.trace-copy p');
      if (!copy) continue;
      copy.replaceChildren();
      card.classList.toggle('is-empty', !event);
      if (event) {
        const time = document.createElement('time');
        time.textContent = event.time;
        const separator = document.createElement('span');
        separator.textContent = ' · ';
        const description = document.createElement('span');
        description.textContent = event.text;
        copy.append(time, separator, description);
      } else {
        const time = document.createElement('time');
        time.textContent = '—:—';
        time.setAttribute('aria-label', '暂无事件时间');
        const separator = document.createElement('span');
        separator.className = 'trace-separator';
        separator.textContent = ' · ';
        separator.setAttribute('aria-hidden', 'true');
        const placeholder = document.createElement('span');
        placeholder.textContent = '等待今天的真实记录';
        copy.append(time, separator, placeholder);
      }
    }
    nodes.traceCount.firstChild.textContent = `${events.length} traces `;
    nodes.footprints?.classList.remove('has-selection');
  }

  window.AsteriaHomeView = Object.freeze({ render });
})();

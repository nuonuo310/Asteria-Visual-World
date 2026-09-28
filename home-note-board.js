/* Home note preview. Message storage and the existing editor/archive belong to app.js. */
(() => {
  'use strict';
  const board = document.querySelector('.review-note');
  const store = window.AsteriaViewStore;
  if (!board || !store) return;

  const editButton = board.querySelector('#noteEdit');
  const historyButton = board.querySelector('#noteHistory');
  const head = document.createElement('div');
  head.className = 'note-board-head';
  head.innerHTML = '<span aria-hidden="true">✦</span><span>Our Notes</span>';
  const surface = document.createElement('div');
  surface.className = 'note-board-surface';
  surface.setAttribute('aria-live','polite');
  const lamp = document.createElement('div');
  lamp.className = 'note-board-lamp';
  lamp.setAttribute('aria-hidden','true');
  const meta = document.createElement('span');
  meta.className = 'note-board-count';
  board.replaceChildren(head,surface,lamp,meta);
  for (const [button,glyph,label] of [[editButton,'✎','写留言'],[historyButton,'→','翻看留言']]) {
    if (!button) continue;
    button.textContent = glyph;
    button.setAttribute('aria-label',label);
    button.title = label;
    board.appendChild(button);
  }
  board.classList.add('note-board');

  const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone:'Asia/Shanghai', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hour12:false
  });
  const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit'
  });
  const HISTORY_SEEN_KEY = 'asteria.visual.notes.seen-history-replies.v1';
  const displayTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = Object.fromEntries(timeFormatter.formatToParts(date).map(part => [part.type,part.value]));
    return `${parts.month}.${parts.day} · ${parts.hour}:${parts.minute}`;
  };
  const dayKey = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = Object.fromEntries(dayFormatter.formatToParts(date).map(part => [part.type,part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  };
  const replyKey = (card,reply) => reply.id || `${card.id}:${reply.author}:${reply.createdAt}:${reply.body}`;
  const readSnapshot = () => {
    const cards = store.read('home')?.messageCards;
    const valid = Array.isArray(cards) ? cards.filter(card =>
      card && typeof card.body === 'string' && ['Nuo','Shen'].includes(card.author)
    ) : [];
    const latestNuo = valid.slice().reverse().find(card => card.author === 'Nuo') || null;
    const latestStandaloneShen = valid.slice().reverse().find(card => card.author === 'Shen') || null;
    const currentReply = latestNuo && Array.isArray(latestNuo.replies)
      ? latestNuo.replies.slice().reverse().find(reply =>
        reply && reply.author === 'Shen' && typeof reply.body === 'string'
      ) || null
      : null;
    const entries = [];
    if (latestNuo) entries.push({
      id:latestNuo.id, author:'Nuo', body:latestNuo.body,
      createdAt:latestNuo.createdAt, reply:false
    });
    if (currentReply) entries.push({
      id:currentReply.id, author:'Shen', body:currentReply.body,
      createdAt:currentReply.createdAt, reply:true, replyTo:latestNuo.id
    });
    else if (latestStandaloneShen && (!latestNuo || new Date(latestStandaloneShen.createdAt) > new Date(latestNuo.createdAt))) {
      entries.push({
        id:latestStandaloneShen.id, author:'Shen', body:latestStandaloneShen.body,
        createdAt:latestStandaloneShen.createdAt, reply:false
      });
    }

    const today = dayKey(new Date().toISOString());
    let todayCount = 0;
    const historicalReplyKeys = [];
    valid.forEach(card => {
      if (dayKey(card.createdAt) === today) todayCount += 1;
      (Array.isArray(card.replies) ? card.replies : []).forEach(reply => {
        if (!reply || typeof reply.body !== 'string' || !['Nuo','Shen'].includes(reply.author)) return;
        if (dayKey(reply.createdAt) === today) todayCount += 1;
        if (reply.author === 'Shen' && (!latestNuo || card.id !== latestNuo.id)) {
          historicalReplyKeys.push(replyKey(card,reply));
        }
      });
    });
    return {
      entries,
      todayCount,
      historicalReplyKeys,
      currentReplyKey:currentReply ? replyKey(latestNuo,currentReply) : ''
    };
  };
  const readSeenReplies = () => {
    try {
      const value = JSON.parse(localStorage.getItem(HISTORY_SEEN_KEY) || '[]');
      return new Set(Array.isArray(value) ? value : []);
    } catch (_) {
      return new Set();
    }
  };
  const saveSeenReplies = seen => {
    try { localStorage.setItem(HISTORY_SEEN_KEY,JSON.stringify([...seen].slice(-400))); } catch (_) {}
  };
  const hasSeenReplyState = () => {
    try { return localStorage.getItem(HISTORY_SEEN_KEY) !== null; } catch (_) { return false; }
  };
  let seenReplies = readSeenReplies();
  let historyKeys = [];
  let initializedHistorySeen = hasSeenReplyState();
  function renderEntry(entry) {
    const article = document.createElement('article');
    article.className = `note-board-entry note-board-entry--${entry.author.toLowerCase()}${entry.author === 'Shen' ? ' note-board-entry--second' : ''}`;
    const name = document.createElement('span');
    name.className = 'note-board-author';
    name.textContent = `${entry.author} · ${entry.reply ? '回复' : '留言'}`;
    const body = document.createElement('p');
    body.className = 'note-board-copy';
    body.textContent = entry.body;
    article.append(name,body);
    const time = displayTime(entry.createdAt);
    if (time) {
      const stamp = document.createElement('time');
      stamp.className = 'note-board-time';
      stamp.dateTime = entry.createdAt;
      stamp.textContent = time;
      article.appendChild(stamp);
    }
    return article;
  }
  function makeDivider() {
    const divider = document.createElement('div');
    divider.className = 'note-board-divider';
    divider.setAttribute('aria-hidden','true');
    divider.innerHTML = '<i></i><span>✦</span><i></i>';
    return divider;
  }
  function render() {
    const {entries,todayCount,historicalReplyKeys,currentReplyKey} = readSnapshot();
    historyKeys = historicalReplyKeys;
    if (!initializedHistorySeen) {
      historicalReplyKeys.forEach(key => seenReplies.add(key));
      saveSeenReplies(seenReplies);
      initializedHistorySeen = true;
    }
    if (currentReplyKey && !seenReplies.has(currentReplyKey)) {
      seenReplies.add(currentReplyKey);
      saveSeenReplies(seenReplies);
    }
    historyButton?.classList.toggle('has-history-update',historicalReplyKeys.some(key => !seenReplies.has(key)));
    surface.replaceChildren();
    surface.dataset.count = String(entries.length);
    meta.textContent = todayCount ? `${todayCount} 条今日留言` : '';
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'note-board-empty';
      empty.textContent = '写给彼此的话，会在这里亮起。';
      surface.appendChild(empty);
      return;
    }
    const nuo = entries.find(entry => entry.author === 'Nuo');
    const shen = entries.find(entry => entry.author === 'Shen');
    if (nuo) {
      surface.appendChild(renderEntry(nuo));
      surface.appendChild(makeDivider());
    }
    if (shen) surface.appendChild(renderEntry(shen));
  }

  let readTimeout;
  function glowForReading() {
    board.classList.add('is-reading');
    clearTimeout(readTimeout);
    readTimeout = setTimeout(() => board.classList.remove('is-reading'), 4000);
  }
  surface.addEventListener('pointerdown',glowForReading);
  surface.addEventListener('focusin',glowForReading);
  editButton?.addEventListener('click',() => board.classList.add('is-writing'));
  const dialog = document.getElementById('noteDialog');
  if (dialog) {
    new MutationObserver(() => board.classList.toggle('is-writing',!dialog.hidden))
      .observe(dialog,{attributes:true,attributeFilter:['hidden']});
  }
  window.addEventListener('asteria:note-history-opened',() => {
    historyKeys.forEach(key => seenReplies.add(key));
    saveSeenReplies(seenReplies);
    historyButton?.classList.remove('has-history-update');
  });
  render();
  store.subscribe('home',() => { render(); glowForReading(); });
})();

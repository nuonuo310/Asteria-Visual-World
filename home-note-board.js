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
  const displayTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = Object.fromEntries(timeFormatter.formatToParts(date).map(part => [part.type,part.value]));
    return `${parts.month}.${parts.day} · ${parts.hour}:${parts.minute}`;
  };
  const readNotes = () => {
    const cards = store.read('home')?.messageCards;
    if (!Array.isArray(cards)) return [];
    const entries = [];
    cards.forEach(card => {
      if (!card || typeof card.body !== 'string' || !['Nuo','Shen'].includes(card.author)) return;
      entries.push({author:card.author,body:card.body,createdAt:card.createdAt,reply:false});
      if (!Array.isArray(card.replies)) return;
      card.replies.forEach(reply => {
        if (reply && typeof reply.body === 'string' && ['Nuo','Shen'].includes(reply.author)) {
          entries.push({author:reply.author,body:reply.body,createdAt:reply.createdAt,reply:true});
        }
      });
    });
    return entries.slice(-2);
  };
  function render() {
    const entries = readNotes();
    surface.replaceChildren();
    surface.dataset.count = String(entries.length);
    meta.textContent = entries.length ? `${entries.length} 条近讯` : '';
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'note-board-empty';
      empty.textContent = '写给彼此的话，会在这里亮起。';
      surface.appendChild(empty);
      return;
    }
    entries.forEach((entry,index) => {
      const article = document.createElement('article');
      article.className = `note-board-entry note-board-entry--${entry.author.toLowerCase()}${index ? ' note-board-entry--second' : ''}`;
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
      surface.appendChild(article);
      if (index === 0) {
        const divider = document.createElement('div');
        divider.className = 'note-board-divider';
        divider.setAttribute('aria-hidden','true');
        divider.innerHTML = '<i></i><span>✦</span><i></i>';
        surface.appendChild(divider);
      }
    });
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
  render();
  store.subscribe('home',() => { render(); glowForReading(); });
})();

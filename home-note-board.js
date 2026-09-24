/* Current-note board prototype. Existing localStorage/history/write behavior remains
   owned by app.js; this layer renders its latest four cards as a stable composition. */
(() => {
  'use strict';
  const board = document.querySelector('.review-note');
  const store = window.AsteriaViewStore;
  if (!board || !store) return;

  const editButton = board.querySelector('#noteEdit');
  const historyButton = board.querySelector('#noteHistory');
  const head = document.createElement('div');
  head.className = 'note-board-head';
  head.textContent = '✦ Our Notes';
  const surface = document.createElement('div');
  surface.className = 'note-board-surface';
  surface.setAttribute('aria-live', 'polite');
  board.replaceChildren(head, surface);
  if (editButton) {
    editButton.textContent = '✎';
    editButton.setAttribute('aria-label', '写留言');
    editButton.title = '写留言';
    board.appendChild(editButton);
  }
  if (historyButton) {
    historyButton.textContent = '→';
    historyButton.setAttribute('aria-label', '翻看留言');
    historyButton.title = '翻看留言';
    board.appendChild(historyButton);
  }
  board.classList.add('note-board');

  const safeCards = () => {
    const cards = store.read('home')?.messageCards;
    return Array.isArray(cards)
      ? cards.filter(card => card && typeof card.body === 'string' && ['Nuo','Shen'].includes(card.author)).slice(-4)
      : [];
  };
  const previewCards = [
    { id:'preview-nuo', author:'Nuo', to:'Shen', body:'今天也想留一点话。', preview:true },
    { id:'preview-shen', author:'Shen', to:'Nuo', body:'我一直都在这里。', preview:true }
  ];
  const layouts = {
    1:[{x:15,y:7,w:70,h:78}],
    2:[{x:1,y:3,w:57,h:61},{x:42,y:35,w:58,h:63}],
    3:[{x:1,y:1,w:48,h:49},{x:51,y:18,w:48,h:49},{x:7,y:51,w:54,h:48}],
    4:[{x:1,y:1,w:45,h:45},{x:53,y:6,w:46,h:45},{x:2,y:54,w:46,h:44},{x:47,y:49,w:52,h:50}]
  };
  const hash = value => {
    let result = 2166136261;
    for (const char of String(value)) {
      result ^= char.charCodeAt(0);
      result = Math.imul(result,16777619);
    }
    return result >>> 0;
  };
  const jitter = (seed,shift,amplitude) => (((seed >>> shift) & 255) / 255 - .5) * amplitude;
  const formatTime = (value,detailed = false) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = part => String(part).padStart(2,'0');
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return detailed ? `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${time}` : time;
  };
  function place(article,card,slot,index,count) {
    const seed = hash(card.id || `${card.author}-${card.createdAt || index}`);
    const move = count === 1 ? .8 : count === 2 ? 2.4 : 1.8;
    const x = Math.max(0,Math.min(100 - slot.w,slot.x + jitter(seed,0,move)));
    const y = Math.max(0,Math.min(100 - slot.h,slot.y + jitter(seed,8,move)));
    const rotation = jitter(seed,16,count === 1 ? 3 : 4.8);
    article.style.setProperty('--note-x',`${x.toFixed(2)}%`);
    article.style.setProperty('--note-y',`${y.toFixed(2)}%`);
    article.style.setProperty('--note-w',`${slot.w}%`);
    article.style.setProperty('--note-h',`${slot.h}%`);
    article.style.setProperty('--note-rotation',`${rotation.toFixed(2)}deg`);
    article.style.setProperty('--note-z',String(2 + index));
  }
  function render() {
    const saved = safeCards();
    const cards = saved.length ? saved : previewCards;
    const count = Math.max(1,Math.min(4,cards.length));
    const flowerIndex = cards.findIndex(card => card.author === 'Nuo');
    surface.dataset.count = String(count);
    surface.replaceChildren();
    cards.forEach((card,index) => {
      const article = document.createElement('article');
      const paper = card.author === 'Shen' ? 'shen' : 'nuo';
      const flower = index === flowerIndex && card.author === 'Nuo' ? ' has-flower' : '';
      const mirrored = (hash(card.id || index) & 1) === 1 ? ' is-mirrored' : '';
      const latest = index === cards.length - 1 ? ' is-latest' : '';
      article.className = `paper-note paper-note--${paper}${flower}${mirrored}${latest}${card.preview ? ' is-preview' : ''}`;
      place(article,card,layouts[count][index],index,count);
      const to = document.createElement('span');
      to.className = 'paper-note-to';
      to.textContent = `To. ${card.to}`;
      const copy = document.createElement('p');
      copy.className = 'paper-note-copy';
      copy.textContent = card.body;
      article.append(to,copy);
      if (!card.preview && card.createdAt) {
        const meta = document.createElement('small');
        meta.className = 'paper-note-meta';
        meta.textContent = formatTime(card.createdAt,count === 1);
        article.appendChild(meta);
      }
      surface.appendChild(article);
    });
  }
  render();
  store.subscribe('home',render);
})();

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
  head.innerHTML = '<strong>今天留下的纸</strong><small>最近 4 张</small>';
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
    1:[{x:6,y:2,w:88,h:94}],
    2:[{x:1,y:1,w:64,h:69},{x:36,y:29,w:63,h:69}],
    3:[{x:1,y:1,w:56,h:58},{x:43,y:12,w:56,h:58},{x:20,y:43,w:58,h:57}],
    4:[{x:1,y:1,w:50,h:50},{x:49,y:4,w:50,h:49},{x:4,y:48,w:50,h:49},{x:49,y:49,w:50,h:49}]
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
  const formatTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})
      .format(date).replace('/','.');
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
    article.style.setProperty('--note-z',String(2 + ((seed >>> 24) % count)));
  }
  function render() {
    const saved = safeCards();
    const cards = saved.length ? saved : previewCards;
    const count = Math.max(1,Math.min(4,cards.length));
    surface.dataset.count = String(count);
    surface.replaceChildren();
    cards.forEach((card,index) => {
      const article = document.createElement('article');
      const paper = card.author === 'Shen' ? 'shen' : 'nuo';
      article.className = `paper-note paper-note--${paper}${card.preview ? ' is-preview' : ''}`;
      place(article,card,layouts[count][index],index,count);
      const to = document.createElement('span');
      to.className = 'paper-note-to';
      to.textContent = `To. ${card.to}`;
      const copy = document.createElement('p');
      copy.className = 'paper-note-copy';
      copy.textContent = card.body;
      article.append(to,copy);
      if (!card.preview) {
        const meta = document.createElement('small');
        meta.className = 'paper-note-meta';
        meta.textContent = `From. ${card.author}${card.createdAt ? `\n${formatTime(card.createdAt)}` : ''}`;
        article.appendChild(meta);
      }
      surface.appendChild(article);
    });
    head.querySelector('small').textContent = saved.length ? `${saved.length} / 4` : '纸张样式预览';
  }
  render();
  store.subscribe('home',render);
})();

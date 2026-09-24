/* Flower-paper visual review. Existing localStorage/history/write behavior stays owned by app.js. */
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
  if (editButton) board.appendChild(editButton);
  if (historyButton) board.appendChild(historyButton);
  board.classList.add('note-board');

  const safeCards = () => {
    const cards = store.read('home')?.messageCards;
    return Array.isArray(cards) ? cards.filter(card => card && typeof card.body === 'string' && ['Nuo','Shen'].includes(card.author)).slice(-4) : [];
  };
  const previewCards = [
    { author:'Nuo', to:'Shen', body:'Nuo 的纸张样式预览', preview:true },
    { author:'Shen', to:'Nuo', body:'Shen 的纸张样式预览', preview:true }
  ];
  const formatTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date).replace('/','.');
  };
  function render() {
    const saved = safeCards();
    const cards = saved.length ? saved : previewCards;
    surface.replaceChildren();
    cards.forEach(card => {
      const article = document.createElement('article');
      const paper = card.author === 'Shen' ? 'shen' : 'nuo';
      article.className = `paper-note paper-note--${paper}${card.preview ? ' is-preview' : ''}`;
      const to = document.createElement('span');
      to.className = 'paper-note-to';
      to.textContent = `To. ${card.to}`;
      const copy = document.createElement('p');
      copy.className = 'paper-note-copy';
      copy.textContent = card.body;
      article.append(to, copy);
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
  store.subscribe('home', render);
})();

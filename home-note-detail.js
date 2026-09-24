/* Direct note archive: selectable day above, paper carousel below. */
(() => {
  'use strict';
  const store = window.AsteriaViewStore;
  const openButton = document.getElementById('noteHistory');
  if (!store || !openButton) return;

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit'
  });
  const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone:'Asia/Shanghai', hour:'2-digit', minute:'2-digit', hour12:false
  });
  const parts = (formatter,date) => Object.fromEntries(
    formatter.formatToParts(date).map(part => [part.type,part.value])
  );
  const dayKey = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const p = parts(dateFormatter,date);
    return p.year + '-' + p.month + '-' + p.day;
  };
  const displayDate = key => key ? key.replaceAll('-',' · ') : 'Our Notes';
  const displayTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const p = parts(dateFormatter,date);
    return p.month + '.' + p.day + ' ' + timeFormatter.format(date);
  };
  const hash = value => {
    let result = 2166136261;
    for (const char of String(value)) {
      result ^= char.charCodeAt(0);
      result = Math.imul(result,16777619);
    }
    return result >>> 0;
  };
  const validCards = () => {
    const cards = store.read('home')?.messageCards;
    return Array.isArray(cards) ? cards.filter(card =>
      card && typeof card.body === 'string'
      && ['Nuo','Shen'].includes(card.author)
      && ['Nuo','Shen','Us'].includes(card.to)
      && dayKey(card.createdAt)
    ) : [];
  };
  const groupCards = () => {
    const groups = new Map();
    validCards().forEach(card => {
      const key = dayKey(card.createdAt);
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(card);
    });
    groups.forEach(cards => cards.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)));
    return groups;
  };

  const backdrop = document.createElement('div');
  backdrop.className = 'note-detail-backdrop';
  backdrop.hidden = true;
  backdrop.innerHTML = [
    '<section class="note-detail-page" role="dialog" aria-modal="true" aria-labelledby="noteDetailDate">',
      '<header class="note-detail-topbar">',
        '<button class="note-detail-close" type="button" aria-label="返回大厅">‹</button>',
        '<div class="note-detail-date-nav">',
          '<button class="note-detail-day-arrow note-detail-day-prev" type="button" aria-label="上一个有留言的日期">‹</button>',
          '<label class="note-detail-date-wrap">',
            '<select class="note-detail-date-select" id="noteDetailDate" aria-label="选择留言日期"></select>',
          '</label>',
          '<button class="note-detail-day-arrow note-detail-day-next" type="button" aria-label="下一个有留言的日期">›</button>',
        '</div>',
        '<span class="note-detail-count" aria-live="polite"></span>',
      '</header>',
      '<div class="note-detail-stage">',
        '<button class="note-detail-arrow note-detail-arrow--prev" type="button" aria-label="上一张留言">‹</button>',
        '<div class="note-detail-papers"></div>',
        '<button class="note-detail-arrow note-detail-arrow--next" type="button" aria-label="下一张留言">›</button>',
      '</div>',
      '<footer class="note-detail-footer"><div class="note-detail-dots" aria-label="当天留言位置"></div></footer>',
    '</section>'
  ].join('');
  document.body.appendChild(backdrop);

  const page = backdrop.querySelector('.note-detail-page');
  const closeButton = backdrop.querySelector('.note-detail-close');
  const dateSelect = backdrop.querySelector('.note-detail-date-select');
  const dayPrev = backdrop.querySelector('.note-detail-day-prev');
  const dayNext = backdrop.querySelector('.note-detail-day-next');
  const counter = backdrop.querySelector('.note-detail-count');
  const papers = backdrop.querySelector('.note-detail-papers');
  const dots = backdrop.querySelector('.note-detail-dots');
  const notePrev = backdrop.querySelector('.note-detail-arrow--prev');
  const noteNext = backdrop.querySelector('.note-detail-arrow--next');
  const stage = backdrop.querySelector('.note-detail-stage');
  let groups = new Map();
  let dates = [];
  let selectedDate = '';
  let noteIndex = 0;
  let touchStartX = null;
  let touchStartY = null;

  function makePaper(card,index,current,flowerIndex) {
    const article = document.createElement('article');
    const seed = hash(card.id || card.author + '-' + card.createdAt);
    const paper = card.author === 'Shen' ? 'shen' : 'nuo';
    const flower = paper === 'nuo' && index === flowerIndex ? ' has-flower' : '';
    const mirror = paper === 'nuo' && (seed & 1) ? ' is-mirrored' : '';
    const offset = index - current;
    const peek = offset ? ' is-peek' : '';
    const side = offset < 0 ? ' is-prev' : offset > 0 ? ' is-next' : '';
    article.className = 'note-detail-paper note-detail-paper--' + paper + flower + mirror + peek + side;
    article.style.setProperty('--detail-rotate',((((seed >>> 8) & 255) / 255 - .5) * 2.2).toFixed(2) + 'deg');
    if (offset) article.setAttribute('aria-hidden','true');

    const to = document.createElement('strong');
    to.className = 'note-detail-to';
    to.textContent = 'To. ' + card.to;
    const copy = document.createElement('p');
    copy.className = 'note-detail-copy';
    copy.textContent = card.body;
    const time = document.createElement('time');
    time.className = 'note-detail-time';
    time.dateTime = card.createdAt;
    time.textContent = displayTime(card.createdAt);
    article.append(to,copy,time);
    return article;
  }

  function renderDates(preferred) {
    groups = groupCards();
    dates = [...groups.keys()].sort();
    dateSelect.replaceChildren();
    if (!dates.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Our Notes';
      dateSelect.appendChild(option);
      selectedDate = '';
      renderPapers();
      return;
    }
    dates.slice().reverse().forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = displayDate(key);
      dateSelect.appendChild(option);
    });
    selectedDate = dates.includes(preferred) ? preferred : dates[dates.length - 1];
    dateSelect.value = selectedDate;
    noteIndex = Math.max(0,(groups.get(selectedDate)?.length || 1) - 1);
    renderPapers();
  }

  function renderPapers() {
    papers.replaceChildren();
    dots.replaceChildren();
    const cards = groups.get(selectedDate) || [];
    const dayPosition = dates.indexOf(selectedDate);
    dayPrev.disabled = dayPosition <= 0;
    dayNext.disabled = dayPosition < 0 || dayPosition >= dates.length - 1;

    if (!cards.length) {
      counter.textContent = '0 / 0';
      notePrev.disabled = true;
      noteNext.disabled = true;
      const empty = document.createElement('p');
      empty.className = 'note-detail-empty';
      empty.textContent = '这里还没有留下纸条。';
      papers.appendChild(empty);
      return;
    }

    noteIndex = Math.max(0,Math.min(noteIndex,cards.length - 1));
    counter.textContent = (noteIndex + 1) + ' / ' + cards.length;
    notePrev.disabled = noteIndex === 0;
    noteNext.disabled = noteIndex === cards.length - 1;
    const flowerIndex = cards.findIndex(card => card.author === 'Nuo');
    [noteIndex - 1,noteIndex,noteIndex + 1].forEach(index => {
      if (cards[index]) papers.appendChild(makePaper(cards[index],index,noteIndex,flowerIndex));
    });
    if (cards.length <= 8) cards.forEach((card,index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'note-detail-dot' + (index === noteIndex ? ' is-active' : '');
      dot.setAttribute('aria-label','第 ' + (index + 1) + ' 张留言');
      dot.addEventListener('click',() => {
        noteIndex = index;
        renderPapers();
      });
      dots.appendChild(dot);
    });
  }

  function stepDay(amount) {
    const position = dates.indexOf(selectedDate) + amount;
    if (position < 0 || position >= dates.length) return;
    selectedDate = dates[position];
    dateSelect.value = selectedDate;
    noteIndex = Math.max(0,(groups.get(selectedDate)?.length || 1) - 1);
    renderPapers();
  }
  function stepNote(amount) {
    const cards = groups.get(selectedDate) || [];
    const next = noteIndex + amount;
    if (next < 0 || next >= cards.length) return;
    noteIndex = next;
    renderPapers();
  }
  function openDetail(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    renderDates(selectedDate);
    backdrop.hidden = false;
    document.body.classList.add('note-detail-open');
    closeButton.focus({preventScroll:true});
  }
  function closeDetail() {
    backdrop.hidden = true;
    document.body.classList.remove('note-detail-open');
    openButton.focus({preventScroll:true});
  }

  openButton.addEventListener('click',openDetail,true);
  closeButton.addEventListener('click',closeDetail);
  backdrop.addEventListener('click',event => {
    if (event.target === backdrop) closeDetail();
  });
  dateSelect.addEventListener('change',() => {
    selectedDate = dateSelect.value;
    noteIndex = Math.max(0,(groups.get(selectedDate)?.length || 1) - 1);
    renderPapers();
  });
  dayPrev.addEventListener('click',() => stepDay(-1));
  dayNext.addEventListener('click',() => stepDay(1));
  notePrev.addEventListener('click',() => stepNote(-1));
  noteNext.addEventListener('click',() => stepNote(1));
  stage.addEventListener('touchstart',event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },{passive:true});
  stage.addEventListener('touchend',event => {
    if (touchStartX == null) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;
    if (Math.abs(dx) < 42 || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
    stepNote(dx < 0 ? 1 : -1);
  },{passive:true});
  page.addEventListener('keydown',event => {
    if (event.key === 'Escape') closeDetail();
    if (event.key === 'ArrowLeft') stepNote(-1);
    if (event.key === 'ArrowRight') stepNote(1);
  });
  store.subscribe('home',() => {
    if (!backdrop.hidden) renderDates(selectedDate);
  });
})();
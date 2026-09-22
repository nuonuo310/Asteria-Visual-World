(() => {
  const root = document.getElementById('app');
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarClose = document.getElementById('calendarClose');
  const monthPanel = document.getElementById('monthPanel');
  const toast = document.getElementById('toast');
  let toastTimer;

  // The approved new WebP currently has an incomplete binary upload.
  // Keep the earlier verified preview visible instead of leaving an empty hero.
  const heroImage = root.querySelector('.home-hero-art img');
  if (heroImage) {
    heroImage.addEventListener('error', async () => {
      try {
        const fragments = await Promise.all([1, 2, 3, 4, 5].map(async (part) => {
          const response = await fetch(`./assets/hero-data/part-${part}.txt?v=20260919-2`);
          if (!response.ok) throw new Error(`Hero fragment ${part}: ${response.status}`);
          return response.text();
        }));
        const base64 = fragments.join('').replace(/\s+/g, '');
        if (base64.length !== 27312) throw new Error('Incomplete fallback hero');
        heroImage.src = `data:image/webp;base64,${base64}`;
      } catch (error) {
        console.error('Home hero fallback unavailable', error);
      }
    }, { once: true });
  }



  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
  }

  function setCalendar(open) {
    monthPanel.hidden = !open;
    calendarToggle.setAttribute('aria-expanded', String(open));
  }
  calendarToggle.addEventListener('click', () => setCalendar(monthPanel.hidden));
  calendarClose.addEventListener('click', () => setCalendar(false));

  // Calendar presentation only. Event sources must provide approved, public records.
  const monthLabel = document.getElementById('calendarMonthLabel');
  const monthGrid = monthPanel.querySelector('.month-grid');
  const monthPrevious = document.getElementById('calendarPrevious');
  const monthNext = document.getElementById('calendarNext');
  const calendarDetails = document.getElementById('calendarDetails');
  const calendarReminder = document.getElementById('calendarReminder');
  const heroDays = root.querySelector('.hero-days');
  const calendarToday = () => new Date();
  let displayedMonth = new Date(calendarToday().getFullYear(), calendarToday().getMonth(), 1);
  const pad = n => String(n).padStart(2, '0');
  const dateKey = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
  const dayDistance = (from, to) => Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000);
  const validEvent = event => event && typeof event === 'object'
    && /^\d{4}-\d{2}-\d{2}$/.test(event.date)
    && Number.isFinite(Date.parse(event.date + 'T00:00:00'))
    && typeof event.title === 'string' && event.title.trim()
    && ['anniversary', 'birthday', 'letter', 'wish', 'special'].includes(event.type)
    && event.public === true && event.available !== false;
  // Other modules may publish approved event snapshots; never infer visibility from a title.
  function approvedEvents() {
    const source = window.AsteriaHomeCalendarEvents;
    const records = typeof source?.list === 'function' ? source.list() : [];
    return Array.isArray(records) ? records.filter(validEvent) : [];
  }
  const eventSymbols = { anniversary: '✦', birthday: '♡', letter: '✉', wish: '◇', special: '✧' };
  const eventNames = { anniversary: '纪念日', birthday: '生日', letter: '信件', wish: '愿望', special: '特别内容' };
  function renderReminder(events, today) {
    if (!calendarReminder) return;
    const upcoming = events.map(event => {
      const [y, m, d] = event.date.split('-').map(Number);
      return { event, distance: dayDistance(today, new Date(y, m - 1, d)) };
    }).filter(item => item.distance >= 0 && item.distance <= 3)
      .sort((a, b) => a.distance - b.distance);
    const next = upcoming[0];
    calendarReminder.textContent = next ? (next.distance === 0
      ? `今天 · ${next.event.title}`
      : `${next.distance} 天后 · ${next.event.title}`) : '';
    if (heroDays) heroDays.classList.toggle('is-anniversary', events.some(event =>
      event.type === 'anniversary' && event.date === dateKey(today.getFullYear(), today.getMonth(), today.getDate())));
  }
  function renderCalendar() {
    if (!monthLabel || !monthGrid) return;
    const today = calendarToday();
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const events = approvedEvents();
    monthLabel.textContent = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(displayedMonth);
    monthGrid.replaceChildren();
    for (const day of ['一', '二', '三', '四', '五', '六', '日']) {
      const weekday = document.createElement('span');
      weekday.className = 'weekday';
      weekday.textContent = day;
      monthGrid.appendChild(weekday);
    }
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthLength = new Date(year, month + 1, 0).getDate();
    const previousLength = new Date(year, month, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + monthLength) / 7) * 7;
    for (let cell = 0; cell < cellCount; cell += 1) {
      const day = cell - firstWeekday + 1;
      if (day < 1 || day > monthLength) {
        const filler = document.createElement('span');
        filler.className = 'muted calendar-filler';
        filler.textContent = String(day < 1 ? previousLength + day : day - monthLength);
        monthGrid.appendChild(filler);
        continue;
      }
      const key = dateKey(year, month, day);
      const matches = events.filter(event => event.date === key);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-date';
      button.setAttribute('aria-label', `${key}，${matches.length} 件事件`);
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        button.classList.add('selected');
        button.setAttribute('aria-current', 'date');
      }
      const number = document.createElement('span');
      number.textContent = String(day);
      button.appendChild(number);
      if (matches.length) {
        const icons = document.createElement('span');
        icons.className = 'calendar-event-icons';
        icons.setAttribute('aria-hidden', 'true');
        icons.textContent = matches.slice(0, 2).map(event => eventSymbols[event.type]).join('');
        button.appendChild(icons);
        if (matches.length > 2) button.classList.add('has-more-events');
      }
      button.addEventListener('click', () => {
        monthGrid.querySelectorAll('.calendar-date.is-viewed').forEach(node => node.classList.remove('is-viewed'));
        calendarDetails.replaceChildren();
        if (!matches.length) {
          calendarDetails.hidden = true;
          return;
        }
        button.classList.add('is-viewed');
        const heading = document.createElement('strong');
        heading.textContent = `${month + 1} 月 ${day} 日`;
        calendarDetails.appendChild(heading);
        {
          matches.forEach(event => {
            const line = document.createElement('p');
            line.textContent = `${eventSymbols[event.type]} ${eventNames[event.type]} · ${event.title}`;
            calendarDetails.appendChild(line);
          });
        }
        calendarDetails.hidden = false;
      });
      monthGrid.appendChild(button);
    }
    calendarDetails.hidden = true;
    renderReminder(events, today);
  }
  monthPrevious?.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  monthNext?.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  renderCalendar();
  calendarToggle.addEventListener('click', () => {
    if (!monthPanel.hidden) renderCalendar();
  });
  window.addEventListener('asteria:calendar-events-updated', renderCalendar);

  // Only expand the agreed Today footprint section on demand.
  const footprintsToggle = document.getElementById('footprintsToggle');
  const footprintsPanel = document.getElementById('footprintsPanel');
  const footprintsTimeline = document.getElementById('footprintsTimeline');
  if (footprintsToggle && footprintsPanel) {
    footprintsToggle.addEventListener('click', () => {
      const open = footprintsPanel.hidden;
      footprintsPanel.hidden = !open;
      footprintsToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const footprints = root.querySelector('.footprint-v1');
  function toggleFootprint(card) {
    const cards = [...root.querySelectorAll('[data-footprint]')];
    const wasActive = card.classList.contains('is-active');
    cards.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });
    if (!wasActive) {
      card.classList.add('is-active');
      card.setAttribute('aria-pressed', 'true');
    }
    if (footprints) footprints.classList.toggle('has-selection', !wasActive);
  }
  // Delegate so view-store updates can replace mock traces without losing tap/keyboard behavior.
  if (footprintsTimeline) {
    footprintsTimeline.addEventListener('click', (event) => {
      const card = event.target.closest('[data-footprint]');
      if (card && footprintsTimeline.contains(card)) toggleFootprint(card);
    });
    footprintsTimeline.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-footprint]');
      if (!card || !footprintsTimeline.contains(card)) return;
      event.preventDefault();
      toggleFootprint(card);
    });
  }

  // Home renders a validated, surface-owned snapshot. With no store data the
  // locked mock remains pixel-identical; no Runtime or room schemas are assumed.
  const homeView = window.AsteriaHomeView;
  const viewStore = window.AsteriaViewStore;
  if (homeView && viewStore) {
    const renderHome = () => homeView.render(viewStore.read('home'));
    renderHome();
    viewStore.subscribe('home', renderHome);
  }

  // Local-only note editor; use the existing Home view-store, never imply shared sync.
  const noteDialog = document.getElementById('noteDialog');
  const noteForm = document.getElementById('noteForm');
  const noteEdit = document.getElementById('noteEdit');
  const noteCancel = document.getElementById('noteCancel');
  const noteInput = document.getElementById('noteInput');
  const noteAuthor = document.getElementById('noteAuthor');
  let noteReturnFocus = null;
  function closeNote() {
    noteDialog.hidden = true;
    noteReturnFocus?.focus();
  }
  noteEdit?.addEventListener('click', () => {
    noteReturnFocus = document.activeElement;
    const saved = viewStore?.read('home');
    const note = saved?.note;
    noteAuthor.value = note?.localDraft && note.title === 'To. Shen' ? 'Nuo'
      : note?.localDraft && note.title === 'To. Nuo' ? 'Shen' : 'Nuo';
    noteInput.value = note?.localDraft && typeof note.body === 'string' ? note.body : '';
    noteDialog.hidden = false;
    noteInput.focus();
  });
  noteCancel?.addEventListener('click', closeNote);
  noteDialog?.addEventListener('click', (event) => {
    if (event.target === noteDialog) closeNote();
  });
  noteDialog?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeNote(); }
    if (event.key === 'Tab') {
      const focusable = [...noteDialog.querySelectorAll('button,textarea,select')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  noteForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const body = noteInput.value.trim();
    if (!body || body.length > 180) { showToast('请输入 1–180 字的留言'); return; }
    if (!viewStore) { showToast('本地存储暂不可用'); return; }
    const from = noteAuthor.value === 'Shen' ? 'Shen' : 'Nuo';
    const to = from === 'Nuo' ? 'Shen' : 'Nuo';
    const result = viewStore.patch('home', { note: {
      title: `To. ${to}`, body, localDraft: true, author: from
    } }, { source: 'home-local-note-editor' });
    if (!result.ok) { showToast('保存失败，请检查浏览器存储空间'); return; }
    closeNote();
    showToast('留言已保存在这台设备');
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      renderCalendar();
      if (homeView && viewStore) homeView.render(viewStore.read('home'));
    }
  });

  root.querySelectorAll('[data-room]').forEach((button) => {
    button.addEventListener('click', () => showToast(`${button.dataset.room} 尚未接入`));
  });

  // Wish entry is a read-only glimpse; editing belongs to the independent page.
  const activeWish = document.getElementById('activeWish');
  function renderActiveWish() {
    if (!activeWish || !window.AsteriaWishes) return;
    const active = window.AsteriaWishes.list().filter(w => w.status === 'active')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    activeWish.textContent = active ? `正在进行 · ${active.title}` : '暂时没有正在进行的愿望';
  }
  renderActiveWish();
  window.addEventListener('storage', (event) => {
    if (event.key === window.AsteriaWishes?.storageKey) renderActiveWish();
  });
  window.addEventListener('pageshow', renderActiveWish);

  const themeButtons = [...root.querySelectorAll('[data-theme-choice]')];
  function setTheme(choice) {
    document.body.classList.remove('theme-b','theme-c');
    if (choice === '2') document.body.classList.add('theme-b');
    if (choice === '3') document.body.classList.add('theme-c');
    themeButtons.forEach((item) => item.classList.toggle('active', item.dataset.themeChoice === choice));
    try { localStorage.setItem('asteria-theme', choice); } catch (_) {}
  }
  let savedTheme = '1';
  try { savedTheme = localStorage.getItem('asteria-theme') || '1'; } catch (_) {}
  if (!['1','2','3'].includes(savedTheme)) savedTheme = '1';
  setTheme(savedTheme);
  themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.themeChoice)));

  const navRoutes = { Home: 'index.html', Mind: 'mind.html' };
  root.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.nav;
      const route = navRoutes[target];
      if (route) {
        if (target !== 'Home') window.location.href = route;
        return;
      }
      root.querySelectorAll('[data-nav]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      showToast(`${target} 仍在装修`);
    });
  });
})();

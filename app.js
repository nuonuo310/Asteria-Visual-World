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

  // Render the current local month without changing the approved calendar surface.
  // The original September markup is a fallback if JavaScript is unavailable.
  const monthLabel = document.getElementById('calendarMonthLabel');
  const monthGrid = monthPanel.querySelector('.month-grid');
  function renderCurrentMonth(now = new Date()) {
    if (!monthLabel || !monthGrid) return;
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthLength = new Date(year, month + 1, 0).getDate();
    const previousLength = new Date(year, month, 0).getDate();
    const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(now);
    monthLabel.textContent = `${monthName} ${year}`;
    monthGrid.replaceChildren();
    for (const day of ['一', '二', '三', '四', '五', '六', '日']) {
      const weekday = document.createElement('span');
      weekday.className = 'weekday';
      weekday.textContent = day;
      monthGrid.appendChild(weekday);
    }
    // Fixed six-week grid preserves the prototype's calendar height.
    for (let cell = 0; cell < 42; cell += 1) {
      const day = cell - firstWeekday + 1;
      const dateCell = document.createElement('i');
      if (day < 1) {
        dateCell.textContent = String(previousLength + day);
        dateCell.className = 'muted';
      } else if (day > monthLength) {
        dateCell.textContent = String(day - monthLength);
        dateCell.className = 'muted';
      } else {
        dateCell.textContent = String(day);
        if (day === now.getDate()) {
          dateCell.className = 'selected';
          dateCell.setAttribute('aria-current', 'date');
        }
      }
      monthGrid.appendChild(dateCell);
    }
  }
  renderCurrentMonth();
  calendarToggle.addEventListener('click', () => {
    if (!monthPanel.hidden) renderCurrentMonth();
  });

  // Only expand the agreed Today footprint section on demand.
  const footprintsToggle = document.getElementById('footprintsToggle');
  const footprintsTimeline = document.getElementById('footprintsTimeline');
  if (footprintsToggle && footprintsTimeline) {
    footprintsToggle.addEventListener('click', () => {
      const open = footprintsTimeline.hidden;
      footprintsTimeline.hidden = !open;
      footprintsToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const footprintCards = [...root.querySelectorAll('[data-footprint]')];
  const footprints = root.querySelector('.footprint-v1');
  function toggleFootprint(card) {
    const wasActive = card.classList.contains('is-active');
    footprintCards.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });
    if (!wasActive) {
      card.classList.add('is-active');
      card.setAttribute('aria-pressed', 'true');
    }
    if (footprints) footprints.classList.toggle('has-selection', !wasActive);
  }
  footprintCards.forEach((card) => {
    card.addEventListener('click', () => toggleFootprint(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFootprint(card);
      }
    });
  });

  root.querySelectorAll('[data-room]').forEach((button) => {
    button.addEventListener('click', () => showToast(`${button.dataset.room} 尚未接入`));
  });

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

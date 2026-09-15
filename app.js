(() => {
  const root = document.getElementById('app');
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.getElementById('photoPlaceholder');
  const stage = document.getElementById('photoStage');
  const overlay = document.getElementById('photoOverlay');
  const sideToggle = document.getElementById('sideToggle');
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const editorToggle = document.getElementById('editorToggle');
  const photoControls = document.getElementById('photoControls');
  const photoReset = document.getElementById('photoReset');
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarClose = document.getElementById('calendarClose');
  const monthPanel = document.getElementById('monthPanel');
  const toast = document.getElementById('toast');

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let toastTimer;
  let baseWidth = 0;
  let baseHeight = 0;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  function renderPhoto() {
    photoPreview.style.width = baseWidth ? `${baseWidth}px` : 'auto';
    photoPreview.style.height = baseHeight ? `${baseHeight}px` : 'auto';
    photoPreview.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`;
  }

  function fitPhoto() {
    if (!photoPreview.naturalWidth || !photoPreview.naturalHeight) return;
    const box = stage.getBoundingClientRect();
    const cover = Math.max(box.width / photoPreview.naturalWidth, box.height / photoPreview.naturalHeight);
    baseWidth = photoPreview.naturalWidth * cover;
    baseHeight = photoPreview.naturalHeight * cover;
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    renderPhoto();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
  }

  photoInput.addEventListener('change', () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件');
      photoInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      photoPreview.src = String(reader.result || '');
      photoPreview.style.display = 'block';
      photoPlaceholder.style.display = 'none';
      photoPreview.onload = () => {
        fitPhoto();
        showToast('照片只在当前浏览器预览');
      };
    };
    reader.readAsDataURL(file);
  });

  editorToggle.addEventListener('click', () => {
    const open = photoControls.hidden;
    photoControls.hidden = !open;
    editorToggle.setAttribute('aria-expanded', String(open));
  });

  photoReset.addEventListener('click', fitPhoto);

  sideToggle.addEventListener('click', () => {
    const left = overlay.classList.contains('side-left');
    overlay.classList.toggle('side-left', !left);
    overlay.classList.toggle('side-right', left);
  });

  zoomIn.addEventListener('click', () => {
    scale = Math.min(3.5, +(scale + .1).toFixed(2));
    renderPhoto();
  });

  zoomOut.addEventListener('click', () => {
    scale = Math.max(.35, +(scale - .1).toFixed(2));
    renderPhoto();
  });

  photoPreview.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    photoPreview.setPointerCapture(e.pointerId);
  });
  photoPreview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    renderPhoto();
  });
  photoPreview.addEventListener('pointerup', () => dragging = false);
  photoPreview.addEventListener('pointercancel', () => dragging = false);

  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2 || !photoPreview.naturalWidth) return;
    const [a, b] = e.touches;
    pinchStartDistance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    pinchStartScale = scale;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 2 || !pinchStartDistance) return;
    e.preventDefault();
    const [a, b] = e.touches;
    const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    scale = Math.max(.35, Math.min(3.5, pinchStartScale * distance / pinchStartDistance));
    renderPhoto();
  }, { passive: false });

  stage.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinchStartDistance = 0;
  }, { passive: true });

  function setCalendar(open) {
    monthPanel.hidden = !open;
    calendarToggle.setAttribute('aria-expanded', String(open));
  }
  calendarToggle.addEventListener('click', () => setCalendar(monthPanel.hidden));
  calendarClose.addEventListener('click', () => setCalendar(false));


  const footprintCards = root.querySelectorAll('[data-footprint]');
  const footprintsBoard = root.querySelector('.footprints-board');
  footprintCards.forEach((card) => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('is-active');
      footprintCards.forEach((item) => item.classList.remove('is-active'));
      if (!wasActive) card.classList.add('is-active');
      if (footprintsBoard) {
        footprintsBoard.classList.toggle('has-selection', !wasActive);
      }
    });
  });


  root.querySelectorAll('[data-room]').forEach((button) => {
    button.addEventListener('click', () => showToast(`${button.dataset.room} 尚未接入`));
  });

  const themeButtons = root.querySelectorAll('[data-theme-choice]');
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.themeChoice;
      document.body.classList.toggle('theme-b', choice === 'b');
      themeButtons.forEach((item) => item.classList.toggle('active', item === button));
    });
  });

  root.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-nav]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      if (button.dataset.nav !== 'Home') showToast(`${button.dataset.nav} 仍在装修`);
    });
  });
})();

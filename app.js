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
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarClose = document.getElementById('calendarClose');
  const monthPanel = document.getElementById('monthPanel');
  const traceToggle = document.getElementById('traceToggle');
  const tracePanel = document.getElementById('tracePanel');
  const toast = document.getElementById('toast');

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let toastTimer;

  function renderPhoto() {
    photoPreview.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`;
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
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      renderPhoto();
      showToast('照片只在当前浏览器预览');
    };
    reader.readAsDataURL(file);
  });

  sideToggle.addEventListener('click', () => {
    const left = overlay.classList.contains('side-left');
    overlay.classList.toggle('side-left', !left);
    overlay.classList.toggle('side-right', left);
  });

  zoomIn.addEventListener('click', () => {
    scale = Math.min(2.2, +(scale + .1).toFixed(2));
    renderPhoto();
  });

  zoomOut.addEventListener('click', () => {
    scale = Math.max(.8, +(scale - .1).toFixed(2));
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
    offsetX = Math.max(-120, Math.min(120, e.clientX - startX));
    offsetY = Math.max(-100, Math.min(100, e.clientY - startY));
    renderPhoto();
  });
  photoPreview.addEventListener('pointerup', () => dragging = false);
  photoPreview.addEventListener('pointercancel', () => dragging = false);

  function setCalendar(open) {
    monthPanel.hidden = !open;
    calendarToggle.setAttribute('aria-expanded', String(open));
  }
  calendarToggle.addEventListener('click', () => setCalendar(monthPanel.hidden));
  calendarClose.addEventListener('click', () => setCalendar(false));

  traceToggle.addEventListener('click', () => {
    const open = tracePanel.hidden;
    tracePanel.hidden = !open;
    traceToggle.setAttribute('aria-expanded', String(open));
  });

  root.querySelectorAll('[data-room]').forEach((button) => {
    button.addEventListener('click', () => showToast(`${button.dataset.room} 尚未接入`));
  });

  root.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-nav]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      if (button.dataset.nav !== 'Home') showToast(`${button.dataset.nav} 仍在装修`);
    });
  });
})();

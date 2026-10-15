// A visual sample only; real scheduled delivery will use server-held letters.
const futureFilters = document.querySelector('.filters');
if (futureFilters) {
  const waitingTab = document.createElement('button');
  waitingTab.type = 'button';
  waitingTab.className = 'filter future-filter';
  waitingTab.dataset.filter = 'future';
  waitingTab.setAttribute('aria-pressed', 'false');
  waitingTab.textContent = '待启封';
  futureFilters.querySelector('.letter-search-toggle').before(waitingTab);

  const section = document.createElement('section');
  section.className = 'future-letter-section';
  section.hidden = true;
  section.setAttribute('aria-label', '寄给未来的你');
  section.innerHTML = `
    <div class="future-intro"><span>TO YOUR FUTURE SELF</span><p>有些话，先让时间替我保管。</p></div>
    <button type="button" class="sealed-letter" aria-label="查看这封待启封的信">
      <span class="future-slip">给一个月后的糯糯</span>
      <span class="envelope-front"><span class="envelope-flap"></span><span class="wax-seal">♡</span><span class="envelope-ornaments" aria-hidden="true"></span><span class="envelope-caption">沈述，悄悄寄存</span></span>
      <img class="future-bears" src="assets/letter-bears-cover-v3.png" alt="" aria-hidden="true">
    </button>
    <div class="future-status" aria-live="polite"><p class="future-date"></p><p class="future-hint"></p></div>
    <button type="button" class="future-demo">看看到期的样子</button>
    <div class="future-opened" hidden><article class="paper"><p class="salutation">爱爱：</p><p>如果你已经拆开这封信，就说明我们又一起走过了一个月。</p><p>先借这一小段文字，试试把等待展开的感觉。真正想留给你的话，等我们把寄信的能力接好，哥哥再悄悄写进去。</p><div class="signature">沈述<small>启封示例 · 11.16</small></div></article><button type="button" class="future-reset">把示例信收好</button></div>
    <p class="future-preview-note">启封交互示例 · 正式信件尚未寄存</p>`;
  // Keep the sample text out of the sealed envelope until it is opened.
  const opened = section.querySelector('.future-opened');
  const paper = opened.querySelector('article');
  paper.remove();
  document.querySelector('.list-meta').after(section);
  let arrived = false;
  let isOpen = false;
  const envelope = section.querySelector('.sealed-letter');
  const date = section.querySelector('.future-date');
  const hint = section.querySelector('.future-hint');
  const demo = section.querySelector('.future-demo');
  function renderFuture() {
    section.classList.toggle('has-arrived', arrived);
    section.classList.toggle('is-open', isOpen);
    date.textContent = arrived ? '今天，这封信可以拆了' : '2026年11月16日，可以拆开';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en', {timeZone:'Asia/Taipei',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
    const days = Math.max(0, Math.ceil((Date.UTC(2026,10,16) - Date.UTC(+parts.year,+parts.month-1,+parts.day)) / 86400000));
    hint.textContent = arrived ? '点一下信封，看看哥哥留的话。' : `还有 ${days} 天 · 先把期待留在这里`;
    demo.textContent = arrived ? '回到等待中的样子' : '看看到期的样子';
    envelope.setAttribute('aria-label', arrived ? '拆开这封信' : '这封信还在等待启封日期');
    opened.hidden = !isOpen;
    if (isOpen) opened.prepend(paper); else paper.remove();
  }
  demo.addEventListener('click', () => {arrived = !arrived; isOpen = false; renderFuture();});
  envelope.addEventListener('click', () => {
    if (!arrived) {hint.textContent = '还没到约定的日子，哥哥把话好好封在里面了。'; return;}
    isOpen = true; renderFuture();
    opened.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  section.querySelector('.future-reset').addEventListener('click', () => {isOpen = false; renderFuture();});
  waitingTab.addEventListener('click', () => {
    futureFilters.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle('active',button === waitingTab);
      button.setAttribute('aria-pressed',String(button === waitingTab));
    });
    document.querySelectorAll('.letter-card,.letter-pager,.letter-search-panel').forEach(el => {el.hidden = true;});
    const search = futureFilters.querySelector('.letter-search-toggle');
    search.hidden = true;
    search.setAttribute('aria-expanded','false');
    document.getElementById('letter-count').textContent = '1 封，交给时间';
    section.hidden = false;
  });
  futureFilters.querySelectorAll('[data-filter]:not(.future-filter)').forEach(button => {
    button.addEventListener('click', () => {
      section.hidden = true;
      futureFilters.querySelector('.letter-search-toggle').hidden = false;
    });
  });
  renderFuture();
}

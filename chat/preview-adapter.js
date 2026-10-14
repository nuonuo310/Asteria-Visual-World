const timeline = document.querySelector('#chat-timeline');
const connection = document.querySelector('#chat-connection');
const status = document.querySelector('#chat-status');
const input = document.querySelector('#chat-input');
const send = document.querySelector('#chat-send');

const meter = '<span class="voice-meter" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
const copyAction = '<button class="meta-action copy-action" type="button" aria-label="复制这条消息"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="10" height="10" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/></svg></button>';
const readMark = '<span class="read-star is-read" aria-label="已读"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c1.25 5.75 3.75 8.25 9.5 9.5-5.75 1.25-8.25 3.75-9.5 9.5-1.25-5.75-3.75-8.25-9.5-9.5 5.75-1.25 8.25-3.75 9.5-9.5Z"/></svg></span>';
const showFailurePreview = new URLSearchParams(window.location.search).get('state') === 'failure';
const failurePreview = showFailurePreview ? `
  <div class="chat-row chat-row-partner" data-preview-kind="failure">
    <span class="chat-tag">系统回退</span>
    <p class="chat-bubble chat-bubble-partner chat-bubble-failed">这一小段声音暂时没能播放，文字仍然保留。</p>
    <div class="message-meta"><button class="inline-retry" type="button">重新尝试播放</button><span>合成状态</span></div>
  </div>` : '';

timeline.innerHTML = `
  <div class="day-divider" aria-hidden="true"><span></span><b>今天</b><span></span></div>
  <section class="user-message-group" data-preview-kind="text" aria-label="糯糯的消息">
    <div class="user-entry">
      <div class="user-entry-content">
        <div class="chat-row chat-row-user">
          <p class="chat-bubble chat-bubble-user">哥哥，我刚刚看到一个东西，你帮我查一下好不好？</p>
          <div class="message-meta"><span>21:16</span>${copyAction}${readMark}</div>
        </div>
      </div>
      <span class="user-mini-avatar" aria-hidden="true">糯</span>
    </div>
  </section>
  <section class="partner-message-group" data-preview-kind="text" aria-label="沈述连续回复">
    <div class="partner-entry">
      <span class="partner-mini-avatar" aria-hidden="true"></span>
      <div class="partner-entry-content">
        <header class="partner-group-head">
          <span class="state-stem" aria-hidden="true"></span>
          <span class="assistant-state">哥哥想了一小会儿 · 3秒</span>
        </header>
        <div class="chat-row chat-row-partner">
          <div class="chat-bubble chat-bubble-partner chat-bubble-with-tool">
            <p class="bubble-copy">好，哥哥帮你看看。</p>
            <div class="chat-tool">
              <button class="chat-tool-card chat-tool-toggle" type="button" aria-expanded="false" aria-controls="tool-details-1">
                <span class="tool-star" aria-hidden="true">✦</span>
                <span class="tool-copy"><strong>查找了相关资料 · 3秒</strong></span>
                <span class="tool-chevron" aria-hidden="true">⌄</span>
              </button>
              <div class="chat-tool-details" id="tool-details-1" hidden>
                <p class="tool-detail-copy">看了相关说明、常见情况，还有真正需要留意的地方。</p>
                <p class="tool-detail-note">3 项公开资料，已经整理好了。</p>
              </div>
            </div>
            <p class="bubble-copy bubble-copy-after">我看完了。真正需要注意的是这一点，哥哥给你慢慢讲。</p>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-row chat-row-partner partner-followup">
      <p class="chat-bubble chat-bubble-partner">不过先别担心，它没有看起来那么严重。</p>
      <div class="message-meta"><span>21:17</span>${copyAction}${readMark}</div>
    </div>
  </section>
  <section class="user-message-group" data-preview-kind="voice" aria-label="糯糯的语音">
    <div class="user-entry">
      <div class="user-entry-content">
        <div class="chat-row chat-row-user">
          <div class="voice-stack">
            <div class="chat-bubble chat-bubble-user chat-bubble-voice" data-transcript="嗯，那哥哥再说仔细一点，我在听。" title="长按转文字">
              <button class="voice-play" type="button" aria-label="模拟播放用户语音"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5v13l10-6.5-10-6.5Z"/></svg></button>
              ${meter}<span class="voice-duration">0:08</span>
            </div>
            <p class="voice-transcript" hidden>嗯，那哥哥再说仔细一点，我在听。</p>
          </div>
          <div class="message-meta"><span>21:18</span>${copyAction}${readMark}</div>
        </div>
      </div>
      <span class="user-mini-avatar" aria-hidden="true">糯</span>
    </div>
  </section>
  <section class="partner-message-group" data-preview-kind="voice" aria-label="沈述语音回复">
    <div class="partner-entry">
      <span class="partner-mini-avatar" aria-hidden="true"></span>
      <div class="partner-entry-content">
        <header class="partner-group-head">
          <span class="state-stem" aria-hidden="true"></span>
          <span class="assistant-state">正在整理刚才的话…</span>
        </header>
        <div class="chat-row chat-row-partner">
          <div class="voice-stack voice-stack-partner">
            <div class="chat-bubble chat-bubble-partner chat-bubble-voice">
              <button class="voice-play" type="button" aria-label="模拟播放沈述语音"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5v13l10-6.5-10-6.5Z"/></svg></button>
              ${meter}<span class="voice-duration">0:11</span>
            </div>
            <p class="voice-transcript" hidden>好，哥哥从头说给你听。你慢慢听，不着急。</p>
          </div>
          <div class="message-meta"><span>21:18</span>${copyAction}${readMark}</div>
        </div>
      </div>
    </div>
  </section>
  ${failurePreview}`;

connection.textContent = '视觉预览 · 未连接';
connection.dataset.state = 'preview';
status.textContent = '合成数据，不会发送';
input.disabled = false;
input.placeholder = '静态预览：输入不会发送';
send.disabled = true;

document.querySelectorAll('.chat-bubble-voice').forEach((bubble) => {
  let holdTimer;
  const revealTranscript = () => {
    const transcript = bubble.closest('.voice-stack').querySelector('.voice-transcript');
    transcript.hidden = false;
  };
  bubble.addEventListener('pointerdown', () => { holdTimer = window.setTimeout(revealTranscript, 520); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
    bubble.addEventListener(eventName, () => window.clearTimeout(holdTimer));
  });
  bubble.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    revealTranscript();
  });
});

document.querySelectorAll('.copy-action').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.add('is-copied');
    button.setAttribute('aria-label', '已复制');
    window.setTimeout(() => {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', '复制这条消息');
    }, 900);
  });
});

document.querySelectorAll('.chat-tool-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const details = document.querySelector(`#${button.getAttribute('aria-controls')}`);
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(willOpen));
    details.hidden = !willOpen;
    button.closest('.chat-tool').classList.toggle('is-open', willOpen);
  });
});

document.querySelectorAll('.voice-play, .inline-retry').forEach((button) => {
  button.addEventListener('click', () => {
    const old = button.textContent;
    button.dataset.previewActive = 'true';
    if (button.classList.contains('inline-retry')) button.textContent = '预览中不播放真实音频';
    window.setTimeout(() => {
      button.dataset.previewActive = 'false';
      if (button.classList.contains('inline-retry')) button.textContent = old;
    }, 1300);
  });
});

const dockToggle = document.querySelector('#dock-toggle');
const dock = document.querySelector('#asteria-dock');
if (dockToggle && dock) {
  dockToggle.addEventListener('click', () => {
    const willOpen = dock.hidden;
    dock.hidden = !willOpen;
    document.body.classList.toggle('dock-open', willOpen);
    dockToggle.setAttribute('aria-expanded', String(willOpen));
    dockToggle.classList.toggle('is-open', willOpen);
    dockToggle.setAttribute('aria-label', willOpen ? '收起 Asteria 入口' : '展开 Asteria 入口');
  });
}

const moveOverlay = document.querySelector('#move-overlay');
const moveCard = moveOverlay?.querySelector('.move-card');
const moveMore = document.querySelector('#chat-more');
const moveClose = document.querySelector('#move-close');
const moveLater = document.querySelector('#move-later');
const moveDetailsToggle = document.querySelector('#move-details-toggle');
const moveDetails = document.querySelector('#move-details');
let moveReturnFocus = null;

function setMoveOpen(open) {
  if (!moveOverlay) return;
  if (open) {
    moveReturnFocus = document.activeElement;
    moveOverlay.hidden = false;
    document.body.classList.add('move-open');
    window.requestAnimationFrame(() => {
      moveOverlay.classList.add('is-open');
      moveClose?.focus();
    });
    return;
  }
  moveOverlay.classList.remove('is-open');
  document.body.classList.remove('move-open');
  window.setTimeout(() => {
    moveOverlay.hidden = true;
    moveReturnFocus?.focus?.();
  }, 190);
}

moveMore?.addEventListener('click', () => setMoveOpen(true));
moveClose?.addEventListener('click', () => setMoveOpen(false));
moveLater?.addEventListener('click', () => setMoveOpen(false));
moveOverlay?.addEventListener('click', (event) => {
  if (event.target === moveOverlay) setMoveOpen(false);
});
moveCard?.addEventListener('click', (event) => event.stopPropagation());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && moveOverlay && !moveOverlay.hidden) setMoveOpen(false);
});

moveDetailsToggle?.addEventListener('click', () => {
  const willOpen = moveDetailsToggle.getAttribute('aria-expanded') !== 'true';
  moveDetailsToggle.setAttribute('aria-expanded', String(willOpen));
  moveDetails.hidden = !willOpen;
});

document.querySelectorAll('.round-picker button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.round-picker button').forEach((option) => {
      option.setAttribute('aria-pressed', String(option === button));
    });
    document.querySelectorAll('.packing-list li').forEach((item) => {
      item.dataset.ready = 'true';
    });
  });
});

timeline.scrollTop = 0;

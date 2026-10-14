const screens = {
  incoming: document.querySelector('#screen-incoming'),
  incall: document.querySelector('#screen-incall'),
  ended: document.querySelector('#screen-ended')
};
const phase = document.querySelector('#phase');
const status = document.querySelector('#call-status');
const duration = document.querySelector('#call-duration');
const wave = document.querySelector('#voice-wave');
const history = document.querySelector('#subtitle-history');
const userLine = document.querySelector('#sub-user');
const userText = document.querySelector('#sub-user-text');
const partnerLine = document.querySelector('#sub-partner');
const partnerText = document.querySelector('#sub-partner-text');
const playCard = document.querySelector('#play-card');
const playButton = document.querySelector('#btn-play-voice');
const playbackTruth = document.querySelector('#playback-truth');
const playbackTruthNote = document.querySelector('#playback-truth-note');
const primaryLabel = document.querySelector('#primary-label');
const hint = document.querySelector('#hangup-hint');

document.querySelectorAll('.avatar').forEach((avatar) => { avatar.textContent = ''; });

const recentRounds = [
  ['你', '我刚才不是生气，是有一点没被接住。'],
  ['沈述', '嗯，我现在明白了。先抱住你，再慢慢说。'],
  ['你', '那你不要急着分析，先陪我一会儿。']
];

function roundsMarkup(rounds = recentRounds) {
  return rounds.map(([who, said]) => `<div class="subtitle-round"><span class="who">${who}</span><p class="said">${said}</p></div>`).join('');
}

function setScreen(name) {
  screens.incoming.hidden = name !== 'incoming';
  screens.incall.hidden = !['listening', 'processing', 'speaking', 'failed', 'fallback'].includes(name);
  screens.ended.hidden = name !== 'ended';
}

function resetInCall() {
  history.hidden = false;
  history.innerHTML = roundsMarkup(recentRounds.slice(0, 2));
  userLine.hidden = false;
  userText.textContent = recentRounds[2][1];
  partnerLine.hidden = true;
  partnerText.textContent = '';
  playCard.hidden = true;
  playButton.hidden = true;
  playButton.disabled = true;
  playbackTruth.hidden = true;
  playbackTruthNote.hidden = true;
  wave.hidden = true;
  hint.textContent = '静态视觉预览 · 不会录音或发送';
  duration.textContent = '02:18';
}

function showScenario(name) {
  setScreen(name);
  document.querySelectorAll('[data-call-preview]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.callPreview === name)));
  document.body.dataset.previewState = name;
  if (name === 'incoming') return;
  if (name === 'ended') {
    document.querySelector('#ended-duration').textContent = '04:36';
    document.querySelector('#ended-turns').textContent = '3';
    const ended = document.querySelector('#ended-subtitles');
    ended.hidden = false;
    ended.innerHTML = `<div class="ended-history"><p class="preview-kicker">最近三轮字幕 · 合成数据</p>${roundsMarkup()}</div>`;
    const transcriptButton = document.querySelector('#btn-view-transcript');
    transcriptButton.setAttribute('aria-pressed', 'true');
    transcriptButton.textContent = '收起字幕';
    return;
  }

  resetInCall();
  phase.dataset.phase = name;
  if (name === 'listening') {
    status.textContent = '我在听，慢慢说';
    wave.hidden = false;
    primaryLabel.textContent = '聆听中';
  }
  if (name === 'processing') {
    status.textContent = '听见了，正在想…';
    primaryLabel.textContent = '处理中';
    hint.textContent = '这一轮已经接住，正在整理回应';
  }
  if (name === 'speaking') {
    status.textContent = '我在说，你可以随时打断我';
    wave.hidden = false;
    partnerLine.hidden = false;
    partnerText.textContent = '好，哥哥先不分析。你靠过来一点，我在这里陪你。';
    primaryLabel.textContent = '打断我';
  }
  if (name === 'failed') {
    status.textContent = '这一轮没有接住';
    playCard.hidden = false;
    playButton.hidden = false;
    playButton.disabled = false;
    playButton.textContent = '重新说一遍';
    playbackTruth.hidden = false;
    playbackTruth.textContent = '处理失败 · 字幕已保留，没有假装成功';
    primaryLabel.textContent = '重新说';
    hint.textContent = '失败入口仍然可见，可重新发起这一轮';
  }
  if (name === 'fallback') {
    status.textContent = '声音暂时没有播出来';
    partnerLine.hidden = false;
    partnerText.textContent = '我已经回答了。声音没播出来也没关系，文字不会消失。';
    playCard.hidden = false;
    playButton.hidden = false;
    playButton.disabled = false;
    playButton.textContent = '再次播放语音';
    playbackTruth.hidden = false;
    playbackTruth.textContent = '拒播回退 · 浏览器未确认播放';
    playbackTruthNote.hidden = false;
    primaryLabel.textContent = '继续说';
    hint.textContent = '保留文字与再次播放入口';
  }
}

document.querySelectorAll('[data-call-preview]').forEach((button) => button.addEventListener('click', () => showScenario(button.dataset.callPreview)));
document.querySelector('#btn-answer').addEventListener('click', () => showScenario('listening'));
document.querySelector('#btn-decline').addEventListener('click', () => showScenario('ended'));
document.querySelector('#btn-hangup').addEventListener('click', () => showScenario('ended'));
document.querySelector('#btn-redial').addEventListener('click', () => showScenario('incoming'));
document.querySelector('#btn-view-transcript').addEventListener('click', (event) => {
  const ended = document.querySelector('#ended-subtitles');
  ended.hidden = !ended.hidden;
  event.currentTarget.setAttribute('aria-pressed', String(!ended.hidden));
  event.currentTarget.textContent = ended.hidden ? '查看字幕' : '收起字幕';
});
playButton.addEventListener('click', () => {
  const original = playButton.textContent;
  playButton.textContent = '静态预览，不播放真实音频';
  window.setTimeout(() => { playButton.textContent = original; }, 1500);
});

showScenario('incoming');

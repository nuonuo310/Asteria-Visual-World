'use strict';
(()=>{
 const panel=document.getElementById('exchangePanel');
 const draftsKey='asteria-exchange-drafts-v1',responseKey='asteria-exchange-responses-v1';
 const drafts=readStore(draftsKey,{});let cycle=Number(readStore('asteria-exchange-cycle-v1',7))===14?14:7;
 function draftKey(writer){return '2026-10-12:'+writer}
 function fillDraft(){const d=drafts[draftKey($('writer').value)]||{};$('draftTitle').value=d.title||'';$('draftBody').value=d.body||'';$('draftStatus').textContent='交换草稿只在本机保存，尚未发送给对方。'}
 function counts(){for(const who of ['shen','nuo']){const count=(who==='shen'?2:1)+(drafts[draftKey(who)]?1:0);$(who+'Count').textContent='已留好 '+count+' 篇';}}
 function openDraft(who='nuo'){$('leaveForExchange').checked=true;document.querySelector(`[data-writer="${who}"]`).click();fillDraft();$('diaryWriteTitle').textContent='写交换日志 ♡';$('writeDialog').showModal()}
 function applyCycle(value){cycle=value;saveStore('asteria-exchange-cycle-v1',cycle);document.querySelectorAll('[data-cycle]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cycle)===cycle)));$('exchangeRange').textContent=cycle===7?'10.12 — 10.18':'10.12 — 10.25';$('exchangeWhen').textContent=cycle===7?'10月18日 · 周日交换':'10月25日 · 周日交换';const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const due=today>=(cycle===7?'2026-10-18':'2026-10-25');$('exchangeDemo').classList.toggle('example-due',due);panel.querySelector('.exchange-heading h2 span').textContent=cycle===7?'把这一周，交换给你':'把这两周，交换给你';}
 if(panel){
  counts();applyCycle(cycle);
  document.querySelectorAll('[data-cycle]').forEach(b=>b.onclick=()=>applyCycle(Number(b.dataset.cycle)));
  document.querySelectorAll('[data-exchange-write]').forEach(b=>b.onclick=()=>openDraft(b.dataset.exchangeWrite));$('exchangeWrite').onclick=()=>openDraft();
  document.querySelectorAll('[data-writer]').forEach(b=>b.addEventListener('click',()=>{if($('leaveForExchange').checked)fillDraft()}));
  $('leaveForExchange').addEventListener('change',()=>{if($('leaveForExchange').checked)$('draftStatus').textContent='这篇留给本次交换，草稿仅存于本机。';else $('draftStatus').textContent='草稿只在这台设备收好。'});
  $('writeDialog').addEventListener('close',()=>{$('diaryWriteTitle').textContent='记下今天 ♡'});
  $('writeForm').addEventListener('submit',e=>{
   if(e.submitter?.value!=='save'||!$('leaveForExchange').checked)return;
   e.preventDefault();const title=$('draftTitle').value.trim(),body=$('draftBody').value.trim();
   if(!title||!body){$('draftStatus').textContent='先写个标题，再留下一点今天吧。';return}
   const key=draftKey($('writer').value),previous=drafts[key];drafts[key]={author:$('writer').value,title,body,date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())};
   if(!saveStore(draftsKey,drafts)){if(previous)drafts[key]=previous;else delete drafts[key];$('draftStatus').textContent='本机保存没有成功，请先复制文字。';return}
   const row=localExchangeEntry(drafts[key]),index=samples.findIndex(e=>e.id===row.id);if(index<0)samples.push(row);else samples[index]=row;counts();$('writeDialog').close('saved');$('toast').textContent='交换草稿已在本机收好';$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2300);
  });
  $('exchangeEntries').innerHTML=samples.filter(e=>!e.local&&e.date>='2026-10-12'&&e.date<='2026-10-18').sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<a class="exchange-entry" href="diary-entry.html?id=${e.id}&amp;exchange=week-2026-10-12"><span class="writer-name ${e.author}">${names[e.author]}</span><time>${e.date.slice(5).replace('-','.')}</time><h3>${escapeHtml(e.title)}</h3><small>翻开这一篇 · 写回应 ›</small></a>`).join('');
  $('exchangeDemo').onclick=()=>{
   const button=$('exchangeDemo');if(button.disabled)return;const open=$('exchangeOpened').hidden;
   const reveal=()=>{$('exchangeOpened').hidden=!open;button.setAttribute('aria-expanded',String(open));button.textContent=open?'收好交换示例 ‹':'看交换后的样子 ›'};
   const left=panel.querySelector('.exchange-sheet.shen'),right=panel.querySelector('.exchange-sheet.nuo');
   if(open&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&typeof left.animate==='function'&&typeof right.animate==='function'){
    button.disabled=true;const settings={duration:440,easing:'cubic-bezier(.2,.7,.3,1)'};
    const animations=[left.animate([{transform:'rotate(-3deg)'},{transform:'translate(9px,-3px) rotate(0deg)',offset:.5},{transform:'rotate(-3deg)'}],settings),right.animate([{transform:'rotate(3deg)'},{transform:'translate(-9px,-3px) rotate(0deg)',offset:.5},{transform:'rotate(3deg)'}],settings)];
    Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(reveal).finally(()=>button.disabled=false);
   }else reveal();
  }
  if(new URLSearchParams(location.search).get('tab')==='exchange')document.querySelector('[data-action="exchange"]').click();
 }
 const params=new URLSearchParams(location.search),thread=params.get('exchange'),entry=samples.find(e=>e.id===params.get('id'));
 if($('readerContent')&&entry&&((thread==='week-2026-10-12'&&entry.date>='2026-10-12'&&entry.date<='2026-10-18')||(thread==='week-2026-10-05'&&entry.id==='s10'))){
  document.querySelector('.reader-top a').href='diary.html?tab=exchange';document.querySelector('.reader-top a').textContent='‹ 返回交换';
  const periodEntries=samples.filter(e=>!e.local&&(thread==='week-2026-10-12'?e.date>='2026-10-12'&&e.date<='2026-10-18':e.id==='s10')).sort((a,b)=>a.date.localeCompare(b.date));
  const currentIndex=periodEntries.findIndex(e=>e.id===entry.id);$('newer').disabled=currentIndex>=periodEntries.length-1;$('older').disabled=currentIndex<=0;
  $('newer').onclick=()=>{if(currentIndex<periodEntries.length-1)location.href='diary-entry.html?id='+periodEntries[currentIndex+1].id+'&exchange='+thread};$('older').onclick=()=>{if(currentIndex>0)location.href='diary-entry.html?id='+periodEntries[currentIndex-1].id+'&exchange='+thread};

  const section=document.createElement('section');section.className='exchange-response entry-response';section.dataset.responseThread=thread+':'+entry.id;
  section.innerHTML=`<small class="response-kicker">AFTER READING · 交换示例</small><h3>读完，想对你说</h3><p>把读到的心情，也留在这一页。</p><div class="response-list" aria-live="polite"></div><form class="response-form"><div class="response-writers" role="group" aria-label="回应的人"><button type="button" data-response-writer="nuo" aria-pressed="${entry.author==='shen'}">糯糯</button><button type="button" data-response-writer="shen" aria-pressed="${entry.author==='nuo'}">沈述</button></div><label for="entryResponse" class="sr-only">写下回应</label><textarea id="entryResponse" name="response" rows="3" maxlength="2000" placeholder="读完这一篇，我想对你说……" required></textarea><button type="submit" class="response-save">留下回应 ♡</button><p class="response-status" role="status"></p></form><p class="response-local-note">回应仅保存在本机，尚未接入彼此收取。</p>`;
  $('readerContent').after(section);
 }
 document.querySelectorAll('[data-response-thread]').forEach(section=>{
  const key=section.dataset.responseThread,form=section.querySelector('form'),list=section.querySelector('.response-list');let writer=section.querySelector('[data-response-writer][aria-pressed="true"]').dataset.responseWriter;
  function renderResponses(fresh=false){const all=readStore(responseKey,{}),items=Array.isArray(all[key])?all[key]:[];list.innerHTML=items.map(r=>`<article class="response-card ${r.author==='shen'?'shen':'nuo'}"><div><strong class="writer-name ${r.author==='shen'?'shen':'nuo'}">${r.author==='shen'?'沈述':'糯糯'}</strong><time>${escapeHtml(r.time||'')}</time></div><p>${escapeHtml(r.body||'')}</p></article>`).join('');if(fresh)list.lastElementChild?.classList.add('response-new')}
  section.querySelectorAll('[data-response-writer]').forEach(b=>b.onclick=()=>{writer=b.dataset.responseWriter;section.querySelectorAll('[data-response-writer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
  form.onsubmit=e=>{e.preventDefault();const textarea=form.querySelector('textarea'),body=textarea.value.trim(),status=form.querySelector('.response-status');if(!body){status.textContent='先留下一点想说的话吧。';return}const all=readStore(responseKey,{});if(!Array.isArray(all[key]))all[key]=[];all[key].push({author:writer,body,time:new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Taipei',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())});if(!saveStore(responseKey,all)){status.textContent='本机保存没有成功，请先复制文字。';return}textarea.value='';renderResponses(true);status.textContent='回应已在本机留好。'};renderResponses();
 });
})();

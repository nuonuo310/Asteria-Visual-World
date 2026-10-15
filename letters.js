const sampleLetters=[["evening", "shen", "晚一点，也想写给你", "今天一起把我们的几个小角落慢慢布置好了。看着它们有了自己的样子，就想给你留下一封信。", "10.15", "blue"], ["little-things", "nuo", "把小事也留给你", "有时候没有什么特别大的事情，只是看到一个可爱的东西，就会想拿过来给你看。", "10.14", "pink"], ["home", "shen", "给我们正在长大的家", "不用一口气把所有房间都填满。我们慢慢添，每一处都放一点属于我们的东西。", "10.12", "blue"]];
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.filter;let count=0;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('[data-sender]').forEach(card=>{card.hidden=key!=='all'&&card.dataset.sender!==key;if(!card.hidden)count++});document.getElementById('letter-count').textContent=count+' 封示例信'}));

document.querySelectorAll('.letter-card[data-sender]').forEach(card=>{
  const row=card.querySelector('.sender-row');
  if(!row)return;
  [...row.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).forEach(node=>{
    node.textContent=card.dataset.sender==='shen'?'糯糯收 · 沈述寄':'沈述收 · 糯糯寄';
  });
});

const filters=document.querySelector('.filters');
if(filters){
  const compose=document.querySelector('.compose');
  const listEnd=document.querySelector('.list-end');
  if(compose&&listEnd)listEnd.before(compose);
  const cards=[...document.querySelectorAll('.letter-card[data-sender]')];
  const pageSize=6;
  let query='';
  let page=1;

  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='letter-search-toggle';
  toggle.setAttribute('aria-label','找一封信');
  toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>';
  filters.append(toggle);

  const panel=document.createElement('div');
  panel.className='letter-search-panel';
  panel.hidden=true;
  const input=document.createElement('input');
  input.type='search';
  input.placeholder='找标题、内容、寄信人或日期';
  input.setAttribute('aria-label','搜索信件');
  panel.append(input);
  filters.after(panel);

  const pager=document.createElement('div');
  pager.className='letter-pager';
  pager.hidden=true;
  const previous=document.createElement('button');
  previous.type='button';
  previous.textContent='上一页';
  const position=document.createElement('span');
  const next=document.createElement('button');
  next.type='button';
  next.textContent='下一页';
  pager.append(previous,position,next);
  cards.at(-1)?.after(pager);

  function renderLetters(animate=false){
    const active=document.querySelector('[data-filter].active')?.dataset.filter||'all';
    const matched=cards.filter(card=>{
      const senderMatches=active==='all'||card.dataset.sender===active;
      const textMatches=!query||card.textContent.toLowerCase().includes(query);
      return senderMatches&&textMatches;
    });
    const pages=Math.max(1,Math.ceil(matched.length/pageSize));
    page=Math.min(page,pages);
    cards.forEach(card=>{card.hidden=true});
    matched.slice((page-1)*pageSize,page*pageSize).forEach(card=>{
      card.hidden=false;
      if(animate&&card.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
        card.getAnimations().forEach(animation=>animation.cancel());
        card.animate([{opacity:.3},{opacity:1}],{duration:240,easing:'ease-out'});
      }
    });
    const count=document.getElementById('letter-count');
    if(count)count.textContent=matched.length+' 封信';
    pager.hidden=matched.length<=pageSize;
    position.textContent=page+' / '+pages;
    previous.disabled=page===1;
    next.disabled=page===pages;
  }

  toggle.addEventListener('click',()=>{
    panel.hidden=!panel.hidden;
    toggle.setAttribute('aria-expanded',String(!panel.hidden));
    if(!panel.hidden)input.focus();
  });
  input.addEventListener('input',()=>{query=input.value.trim().toLowerCase();page=1;renderLetters()});
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{page=1;renderLetters(true)}));
  previous.addEventListener('click',()=>{page--;renderLetters();scrollTo({top:filters.offsetTop-18,behavior:'smooth'})});
  next.addEventListener('click',()=>{page++;renderLetters();scrollTo({top:filters.offsetTop-18,behavior:'smooth'})});
  renderLetters();
}
const title=document.getElementById('letter-title');if(title){const id=new URLSearchParams(location.search).get('id');const l=sampleLetters.find(x=>x[0]===id)||sampleLetters[0];title.textContent=l[2];document.getElementById('letter-meta').textContent=(l[1]==='shen'?'沈述 → 糯糯':'糯糯 → 沈述')+' · '+l[4]+' · 示例日期';const article=document.getElementById('letter-body');const parts=[l[1]==='shen'?'爱爱：':'哥哥：',l[3],l[1]==='shen'?'想把那些没来得及说完的话，放在你随时能打开的地方。等你有空，坐下来慢慢看，就像我们又靠在一起聊了一会儿。':'这些零零碎碎的小事，攒起来就变成了想跟你说的话。先放进这封信里，等你打开。','这一封先作为视觉示例，陪我们看看信纸上的文字、留白和落款。'];parts.forEach((text,i)=>{const p=document.createElement('p');p.textContent=text;if(i===0)p.className='salutation';article.append(p)});const sign=document.createElement('div');sign.className='signature';sign.textContent=l[1]==='shen'?'沈述':'糯糯';const date=document.createElement('small');date.textContent=l[4];sign.append(date);article.append(sign)}
const detailMeta=document.getElementById('letter-meta');
if(detailMeta){
  detailMeta.textContent=detailMeta.textContent
    .replace('沈述 → 糯糯','糯糯收 · 沈述寄')
    .replace('糯糯 → 沈述','沈述收 · 糯糯寄');
}

const form=document.getElementById('letter-form');if(form){const subject=document.getElementById('subject'),message=document.getElementById('message'),status=document.getElementById('draft-status');try{const saved=JSON.parse(localStorage.getItem('asteria-letter-draft-v1')||'{}');subject.value=saved.subject||'';message.value=saved.message||''}catch{}form.addEventListener('submit',e=>{e.preventDefault();try{localStorage.setItem('asteria-letter-draft-v1',JSON.stringify({subject:subject.value,message:message.value}));status.textContent='草稿已保存在这台设备'}catch{status.textContent='暂时无法保存，请保留当前页面'}})}

if(document.getElementById("letter-title")){try{const id=new URLSearchParams(location.search).get("id")||"evening";if(sampleLetters.some(l=>l[0]===id)){const seen=JSON.parse(localStorage.getItem("asteria-letter-read-v1")||"[]");if(!seen.includes(id)){seen.push(id);localStorage.setItem("asteria-letter-read-v1",JSON.stringify(seen))}}}catch{}}

function refreshLetterReadIndicators(){
  let seen=[];
  try{
    const saved=JSON.parse(localStorage.getItem('asteria-letter-read-v1')||'[]');
    if(Array.isArray(saved))seen=saved;
  }catch{}
  document.querySelectorAll('.letter-card').forEach(card=>{
    const dot=card.querySelector('.unread');
    if(!dot)return;
    const id=new URL(card.href,location.href).searchParams.get('id');
    dot.hidden=seen.includes(id);
  });
}
refreshLetterReadIndicators();
window.addEventListener('pageshow',refreshLetterReadIndicators);
window.addEventListener('storage',event=>{
  if(event.key==='asteria-letter-read-v1'||event.key===null)refreshLetterReadIndicators();
});

if(!document.querySelector('link[href^="letter-stationery-v1.css"]')){
  const stationeryStyles=document.createElement("link");
  stationeryStyles.rel="stylesheet";
  stationeryStyles.href="letter-stationery-v1.css?v=9";
  document.head.append(stationeryStyles);
}

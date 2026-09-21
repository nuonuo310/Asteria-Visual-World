(() => {
  'use strict';
  const store = window.AsteriaWishes;
  const $ = id => document.getElementById(id);
  const statuses = {'not-started':'未开始',planning:'规划中',active:'进行中',completed:'已完成',paused:'暂时搁置'};
  const listPage=$('listPage'), detailPage=$('detailPage'), wishList=$('wishList');
  let filter='all', selectedId=null, editingId=null, feedbackTimer;
  function say(message) {
    $('feedback').textContent=message;
    clearTimeout(feedbackTimer);
    feedbackTimer=setTimeout(()=>{$('feedback').textContent='';},2600);
  }
  const node=(tag,cls,text)=>{
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  const localDate=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  function all(){return store.list();}
  function chosen(){return all().find(w=>w.id===selectedId);}
  function showList(){
    selectedId=null;listPage.hidden=false;detailPage.hidden=true;
    history.replaceState(null,'',location.pathname);
    renderList();
  }
  function openDetail(id){
    if(!all().some(w=>w.id===id)){showList();return;}
    selectedId=id;listPage.hidden=true;detailPage.hidden=false;
    history.replaceState(null,'','#wish='+encodeURIComponent(id));
    renderDetail();window.scrollTo(0,0);
  }
  function renderList(){
    const items=all().filter(w=>filter==='all'||w.status===filter)
      .sort((a,b)=>(a.status==='active'?0:1)-(b.status==='active'?0:1)||b.updatedAt.localeCompare(a.updatedAt));
    wishList.replaceChildren();
    if(!items.length)wishList.appendChild(node('p','empty',filter==='all'?'还没有愿望。点右上角的＋，留下第一个吧。':'这个分类里还没有愿望。'));
    for(const w of items){
      const card=node('button','wish-card'+(w.status==='active'?' active':''));card.type='button';
      card.append(node('span','pill'+(w.status==='active'?' active':''),statuses[w.status]),node('span','arrow','↗'));
      card.append(node('h2','',w.title));
      const meta=node('p','meta',w.proposedOn?'提出于 '+w.proposedOn:'提出日期待补充');
      card.append(meta);
      card.addEventListener('click',()=>openDetail(w.id));wishList.append(card);
    }
  }
  function section(parent,title,text,cls=''){
    const box=node('section','detail-section '+cls);
    box.append(node('h2','',title),node('p','',text||'尚未填写'));
    parent.append(box);return box;
  }
  function renderDetail(){
    const w=chosen();if(!w){showList();return;}
    const target=$('wishDetail');target.replaceChildren();
    const head=node('header','detail-head');
    head.append(node('span','pill'+(w.status==='active'?' active':''),statuses[w.status]),node('h1','',w.title));
    head.append(node('p','',`提出日期 · ${w.proposedOn||'待核对'}　提出者 · ${{Together:'共同',Shen:'Shen',Nuo:'Nuo','':'待补充'}[w.proposer]}`));
    target.append(head);
    section(target,'01 / 最初的愿望',w.idea);
    section(target,'02 / 初步想法',w.plan,'plan');
    const references=node('section','detail-section');references.append(node('h2','','03 / 参考资料'));
    if(!w.links.length)references.append(node('p','','还没有参考资料。'));
    for(const link of w.links){
      const a=node('a','link-item',link.title+' ↗');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';references.append(a);
    }
    const addLink=node('button','subtle-button','＋ 添加链接');addLink.type='button';
    addLink.addEventListener('click',()=>{$('linkForm').reset();$('linkDialog').showModal();});
    references.append(addLink);target.append(references);
    const progress=node('section','detail-section');progress.append(node('h2','','04 / 我们走到哪里了'));
    if(!w.progress.length)progress.append(node('p','','还没有进展记录。'));
    for(const item of [...w.progress].reverse()){
      const el=node('div','progress-item');
      const time=node('time','',item.date.slice(0,16).replace('T',' '));time.dateTime=item.date;
      el.append(time,node('p','',item.text));progress.append(el);
    }
    const addProgress=node('button','subtle-button','＋ 留下一条新进展');addProgress.type='button';
    addProgress.addEventListener('click',()=>{$('progressForm').reset();$('progressDialog').showModal();});
    progress.append(addProgress);target.append(progress);
    const actions=node('div','detail-actions');
    const edit=node('button','subtle-button','编辑方案与状态');edit.type='button';
    edit.addEventListener('click',()=>openForm(w));
    actions.append(edit);target.append(actions);
  }
  function openForm(w=null){
    editingId=w?.id||null;const form=$('wishForm');form.reset();
    $('formTitle').textContent=w?'编辑愿望':'留下一个愿望';
    if(w){for(const key of ['title','proposer','proposedOn','status','idea','plan'])form.elements.namedItem(key).value=w[key];}
    // Preserve the original wish and first-proposed date once the record exists.
    form.elements.namedItem('proposedOn').disabled=!!w;
    form.elements.namedItem('idea').readOnly=!!w;
    $('wishDialog').showModal();
  }
  function saveResult(result,success){
    if(!result.ok){say('保存失败：'+result.error);return false;}
    say(success);return true;
  }
  $('wishForm').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;
    const data=new FormData(form),title=String(data.get('title')||'').trim();
    if(!title){say('请填写愿望名称');return;}
    const now=new Date().toISOString(),old=editingId?all().find(w=>w.id===editingId):null;
    if(editingId&&!old){say('愿望已不存在，请返回清单');return;}
    const proposedOn=old?old.proposedOn:String(data.get('proposedOn')||'');
    if(proposedOn&&!store.isDate(proposedOn)){say('请检查提出日期');return;}
    const w={
      id:old?.id||store.id(),title,proposer:old?.proposer||String(data.get('proposer')||''),
      proposedOn,status:String(data.get('status')||'not-started'),
      idea:old?.idea??String(data.get('idea')||'').trim(),
      plan:String(data.get('plan')||'').trim(),
      links:old?.links||[],progress:old?.progress||[],
      createdAt:old?.createdAt||now,updatedAt:now
    };
    if(saveResult(store.save(w),'愿望已保存在当前浏览器')){
      $('wishDialog').close();editingId=null;openDetail(w.id);
    }
  });
  $('progressForm').addEventListener('submit',event=>{
    event.preventDefault();const w=chosen();if(!w)return;
    const text=String(new FormData(event.currentTarget).get('text')||'').trim();
    if(!text||w.progress.length>=100){say('请输入进展内容，最多保存100条');return;}
    const now=new Date().toISOString();
    const next={...w,progress:[...w.progress,{id:store.id(),date:now,text}],updatedAt:now};
    if(saveResult(store.save(next),'进展已保存')){$('progressDialog').close();renderDetail();}
  });
  $('linkForm').addEventListener('submit',event=>{
    event.preventDefault();const w=chosen();if(!w)return;
    const form=new FormData(event.currentTarget);
    const title=String(form.get('title')||'').trim(),url=String(form.get('url')||'').trim();
    if(!title||!store.urlValid(url)||w.links.length>=30){say('请填写有效的 http(s) 链接，最多30条');return;}
    const next={...w,links:[...w.links,{title,url}],updatedAt:new Date().toISOString()};
    if(saveResult(store.save(next),'参考资料已保存')){$('linkDialog').close();renderDetail();}
  });
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('addWish').addEventListener('click',()=>openForm());
  $('addBottom').addEventListener('click',()=>openForm());
  $('backList').addEventListener('click',showList);
  $('filters').addEventListener('click',event=>{
    const button=event.target.closest('[data-filter]');if(!button)return;
    filter=button.dataset.filter;
    $('filters').querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button));
    renderList();
  });
  window.addEventListener('storage',event=>{
    if(event.key!==store.storageKey)return;
    if(selectedId)renderDetail();else renderList();
  });
  const fromHash=location.hash.startsWith('#wish=')?decodeURIComponent(location.hash.slice(6)):null;
  if(fromHash&&all().some(w=>w.id===fromHash))openDetail(fromHash);else renderList();
})();

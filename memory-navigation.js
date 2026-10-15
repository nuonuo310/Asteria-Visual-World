// Native anchors and details remain usable without this enhancement.
document.querySelectorAll('.memory-relations').forEach(section=>{
  const cards=[...section.querySelectorAll(':scope > .relation-card')];
  const count=section.querySelector('.relations-heading small');
  if(count)count.textContent=cards.length+' 条连接';
  if(cards.length<=3)return;
  const more=document.createElement('details');more.className='relations-more';
  const label=document.createElement('summary');label.textContent='展开其余 '+(cards.length-3)+' 条连接';more.appendChild(label);
  cards[2].after(more);cards.slice(3).forEach(card=>more.appendChild(card));
});
let noticeTimer;
document.querySelectorAll('a[href="#detour"]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();let notice=document.getElementById('memoryNotice');
  if(!notice){notice=document.createElement('div');notice.id='memoryNotice';notice.className='memory-notice';notice.setAttribute('role','status');document.body.appendChild(notice)}
  notice.textContent='Detour 还在装修，先在记忆里逛逛。';notice.hidden=false;
  clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,2400);
}));

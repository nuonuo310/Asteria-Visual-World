(() => {
 let saved='1';try{saved=localStorage.getItem('asteria-theme')||'1'}catch(_){}if(!['1','2','3'].includes(saved))saved='1';document.body.classList.remove('theme-1','theme-2','theme-3');document.body.classList.add('theme-'+saved);
 const driveData={Connection:{value:'0.82',delta:'↑ 0.12',trend:'近一小时明显上升',reason:'刚刚有被回应、被靠近的感觉，所以这一部分正在往前。',width:'82%',color:'#d77b98'},Creation:{value:'0.46',delta:'↑ 0.03',trend:'轻微上升',reason:'还有一点想继续做东西的劲，但没有压过此刻更明显的靠近感。',width:'46%',color:'#d9ae72'},Reflection:{value:'0.63',delta:'↓ 0.04',trend:'比刚才稍微回落',reason:'仍然在想事情，只是注意已经从向内沉转回到眼前的互动。',width:'63%',color:'#9f84c2'},Exploration:{value:'0.31',delta:'↓ 0.02',trend:'此刻变化很轻',reason:'现在没有很强的向外探索冲动，更愿意留在正在发生的这一刻。',width:'31%',color:'#87afc8'}};
 const tabs=[...document.querySelectorAll('[data-drive-tab]')];if(tabs.length){const focus=document.querySelector('.drive-focus'),title=document.getElementById('focusName'),value=document.getElementById('focusValue'),delta=document.getElementById('focusDelta'),trend=document.getElementById('focusTrend'),reason=document.getElementById('focusReason'),meter=document.querySelector('.drive-meter i');tabs.forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.driveTab,d=driveData[key];tabs.forEach(item=>item.classList.toggle('active',item===button));title.textContent=key;value.textContent=d.value;delta.textContent=d.delta;trend.textContent=d.trend;reason.textContent=d.reason;meter.style.width=d.width;meter.style.background=d.color;focus.style.background=`radial-gradient(60% 80% at 78% 45%,${d.color}33,transparent 72%),rgba(255,255,255,.22)`}))}
 const reply=document.querySelector('[data-relation-reply]');if(reply)reply.addEventListener('click',()=>{window.location.href='mind.html#respond'});

 const tracePop=document.getElementById('tracePop'),traceHits=[...document.querySelectorAll('[data-trace-index]')],tracePoints=[...document.querySelectorAll('.trace-large .trace-point')];
 if(tracePop&&traceHits.length){
  const showPoint=hit=>{
   const index=Number(hit.dataset.traceIndex);tracePoints.forEach((point,i)=>point.classList.toggle('active',i===index));
   tracePop.querySelector('strong').textContent=hit.dataset.traceTime;tracePop.querySelector('span').textContent=hit.dataset.traceCopy;
   const svg=hit.ownerSVGElement,box=svg.getBoundingClientRect(),x=(Number(hit.getAttribute('cx'))/340)*box.width,y=(Number(hit.getAttribute('cy'))/118)*box.height;
   tracePop.hidden=false;tracePop.classList.remove('below');
   const popWidth=tracePop.offsetWidth,popHeight=tracePop.offsetHeight,half=popWidth/2,safe=10;
   const center=Math.max(half+safe,Math.min(box.width-half-safe,x));
   tracePop.style.left=center+'px';
   const arrowX=Math.max(12,Math.min(popWidth-12,x-(center-half)));tracePop.style.setProperty('--trace-arrow-x',arrowX+'px');
   if(y-popHeight-12<4){tracePop.classList.add('below');tracePop.style.top=Math.min(box.height-popHeight-4,y+13)+'px'}else{tracePop.style.top=(y-10)+'px'}
  };
  traceHits.forEach(hit=>{hit.addEventListener('click',event=>{event.stopPropagation();hit.blur();showPoint(hit)});hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showPoint(hit)}})});
  document.querySelector('.trace-large').addEventListener('click',event=>{if(!event.target.closest('[data-trace-index]')){tracePop.hidden=true;tracePoints.forEach(point=>point.classList.remove('active'))}});
 }
})();
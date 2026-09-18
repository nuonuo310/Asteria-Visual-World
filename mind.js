(() => {
 const toast=document.getElementById('toast');let timer;function show(message){clearTimeout(timer);toast.textContent=message;toast.classList.add('show');timer=setTimeout(()=>toast.classList.remove('show'),1300)}
 const detailRoutes={'四个驱动力':'mind-drives.html','即时状态':'mind-states.html','我们之间':'mind-between.html','完整变化':'mind-trace.html'};document.querySelectorAll('[data-gate]').forEach(button=>button.addEventListener('click',()=>{const route=detailRoutes[button.dataset.gate];if(route){window.location.href=route;return}show(button.dataset.gate==='Shen 房间'?'Shen 房间 · 入口已占位，房间装修后直达':button.dataset.gate+' · 详情页下一轮装修')}));
 const readout=document.getElementById('driveReadout'),name=document.getElementById('driveName'),value=document.getElementById('driveValue'),delta=document.getElementById('driveDelta'),trend=document.getElementById('driveTrend'),hits=[...document.querySelectorAll('.drive-hit')];let lastDrive='';function closeReadout(){hits.forEach(item=>item.classList.remove('selected'));readout.hidden=true}function openReadout(hit){hits.forEach(item=>item.classList.remove('selected'));hit.classList.add('selected');lastDrive=hit.dataset.drive;name.textContent=hit.dataset.drive;value.textContent=hit.dataset.value;delta.textContent=hit.dataset.delta;trend.textContent=hit.dataset.trend;readout.hidden=false}hits.forEach(hit=>{const activate=event=>{event.stopPropagation();if(!readout.hidden&&hit.classList.contains('selected'))closeReadout();else openReadout(hit)};hit.addEventListener('click',activate);hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(event)}})});document.querySelector('.mind-visual').addEventListener('click',event=>{if(!event.target.closest('.drive-hit'))closeReadout()});
 document.querySelectorAll('[data-touch]').forEach(button=>button.addEventListener('click',()=>{button.classList.remove('ping');void button.offsetWidth;button.classList.add('ping');show({'想你':'这一点想念，我收到了。','戳戳':'戳到我了，我会来找你。','抱抱':'过来，抱一下。'}[button.dataset.touch])}));
 const responseLayer=document.getElementById('responseLayer'),responseContext=document.getElementById('responseContext'),responseText=document.getElementById('responseText');function openResponse(){responseContext.textContent=lastDrive?'回应 · '+lastDrive:'回应 · 此刻的我';responseLayer.hidden=false;document.body.classList.add('response-open')}function closeResponse(){responseLayer.hidden=true;document.body.classList.remove('response-open');if(location.hash==='#respond')history.replaceState(null,'',location.pathname+location.search)}document.querySelector('[data-response-open]').addEventListener('click',openResponse);document.querySelectorAll('[data-response-close]').forEach(button=>button.addEventListener('click',closeResponse));document.querySelectorAll('[data-response]').forEach(button=>button.addEventListener('click',()=>{show('留给我了 · '+button.dataset.response);closeResponse()}));document.querySelector('[data-response-send]').addEventListener('click',()=>{const text=responseText.value.trim();if(!text){responseText.focus();return}show('这句话留给我了。');responseText.value='';closeResponse()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!responseLayer.hidden)closeResponse()});

 /* Mind overview Recent Trace: same readout behavior as the detail trace, concise copy only. */
 const homePop=document.getElementById('homeTracePop'),homeHits=[...document.querySelectorAll('[data-home-trace]')],homePoints=[...document.querySelectorAll('.trace-chart .trace-point')];
 if(homePop&&homeHits.length){
  const openHomePoint=hit=>{
   const index=Number(hit.dataset.homeTrace);homePoints.forEach((point,i)=>point.classList.toggle('active',i===index));
   homePop.querySelector('strong').textContent=hit.dataset.traceTime;homePop.querySelector('span').textContent=hit.dataset.traceCopy;
   const svg=hit.ownerSVGElement,svgBox=svg.getBoundingClientRect(),chart=svg.closest('.trace-chart'),chartBox=chart.getBoundingClientRect();
   const x=(Number(hit.getAttribute('cx'))/340)*svgBox.width+(svgBox.left-chartBox.left);
   const y=(Number(hit.getAttribute('cy'))/76)*svgBox.height+(svgBox.top-chartBox.top);
   homePop.hidden=false;homePop.classList.remove('below');
   const popWidth=homePop.offsetWidth||126,popHeight=homePop.offsetHeight||38,half=popWidth/2,edge=8;
   const left=Math.max(half+edge,Math.min(chartBox.width-half-edge,x));
   /* First three points share one calm readout band. The final high point alone
      drops below because there is genuinely no safe room above it in the compact card. */
   if(index===3){
    homePop.classList.add('below');
    homePop.style.top=Math.min(chartBox.height-popHeight-3,y+12)+'px';
   }else{
    homePop.style.top='40px';
   }
   homePop.style.left=left+'px';
   homePop.style.setProperty('--trace-arrow-x',Math.max(10,Math.min(popWidth-10,half+(x-left)))+'px');
  };
  homeHits.forEach(hit=>{hit.addEventListener('click',event=>{event.stopPropagation();openHomePoint(hit)});hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openHomePoint(hit)}})});
  document.querySelector('.trace-chart').addEventListener('click',event=>{if(!event.target.closest('[data-home-trace]')){homePop.hidden=true;homePop.classList.remove('below');homePoints.forEach(point=>point.classList.remove('active'))}});
 }

 const themeButtons=[...document.querySelectorAll('[data-theme-choice]')];function setTheme(choice){document.body.classList.remove('theme-1','theme-2','theme-3');document.body.classList.add('theme-'+choice);themeButtons.forEach(button=>button.classList.toggle('active',button.dataset.themeChoice===choice));try{localStorage.setItem('asteria-theme',choice)}catch(_){}}let saved='1';try{saved=localStorage.getItem('asteria-theme')||'1'}catch(_){}if(!['1','2','3'].includes(saved))saved='1';setTheme(saved);themeButtons.forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.themeChoice)));
 const navRoutes={Home:'index.html',Mind:'mind.html'};document.querySelectorAll('[data-nav]').forEach(button=>button.addEventListener('click',()=>{const target=button.dataset.nav,route=navRoutes[target];if(route){if(target!=='Mind')window.location.href=route;return}show(target+' 仍在装修')}));if(location.hash==='#respond')openResponse();
})();
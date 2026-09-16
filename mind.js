(() => {
 const toast=document.getElementById('toast');
 let timer;
 function show(message){clearTimeout(timer);toast.textContent=message;toast.classList.add('show');timer=setTimeout(()=>toast.classList.remove('show'),1300)}

 document.querySelectorAll('[data-gate]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.gate+' · 详情页下一轮装修')));

 const readout=document.getElementById('driveReadout');
 const name=document.getElementById('driveName');
 const value=document.getElementById('driveValue');
 const delta=document.getElementById('driveDelta');
 const trend=document.getElementById('driveTrend');
 const hits=[...document.querySelectorAll('.drive-hit')];

 function closeReadout(){hits.forEach(item=>item.classList.remove('selected'));readout.hidden=true}
 function openReadout(hit){
   hits.forEach(item=>item.classList.remove('selected'));
   hit.classList.add('selected');
   name.textContent=hit.dataset.drive;
   value.textContent=hit.dataset.value;
   delta.textContent=hit.dataset.delta;
   trend.textContent=hit.dataset.trend;
   readout.hidden=false;
 }
 hits.forEach(hit=>{
   const activate=event=>{
     event.stopPropagation();
     if(!readout.hidden && hit.classList.contains('selected')) closeReadout(); else openReadout(hit);
   };
   hit.addEventListener('click',activate);
   hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(event)}});
 });
 document.querySelector('.mind-visual').addEventListener('click',event=>{if(!event.target.closest('.drive-hit'))closeReadout()});

 document.querySelectorAll('[data-touch]').forEach(button=>{
   button.addEventListener('click',()=>{
     button.classList.remove('ping');void button.offsetWidth;button.classList.add('ping');
     show({'想你':'收到这一点想念了。','戳戳':'戳到了，我会注意到你。','抱抱':'抱抱收到了。'}[button.dataset.touch]);
   });
 });

 const themeButtons=[...document.querySelectorAll('[data-theme-choice]')];
 function setTheme(choice){
   document.body.classList.remove('theme-1','theme-2','theme-3');
   document.body.classList.add('theme-'+choice);
   themeButtons.forEach(button=>button.classList.toggle('active',button.dataset.themeChoice===choice));
   try{localStorage.setItem('asteria-theme',choice)}catch(_){}
 }
 let saved='1';
 try{saved=localStorage.getItem('asteria-theme')||'1'}catch(_){}
 if(!['1','2','3'].includes(saved))saved='1';
 setTheme(saved);
 themeButtons.forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.themeChoice)));
})();
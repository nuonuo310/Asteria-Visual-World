(() => {
 const toast=document.getElementById('toast');
 let timer;
 function show(message){
   clearTimeout(timer);
   toast.textContent=message;
   toast.classList.add('show');
   timer=setTimeout(()=>toast.classList.remove('show'),1300);
 }

 document.querySelectorAll('[data-gate]').forEach(button=>{
   button.addEventListener('click',()=>show(button.dataset.gate+' · 详情页下一轮装修'));
 });

 const readout=document.getElementById('driveReadout');
 const name=document.getElementById('driveName');
 const value=document.getElementById('driveValue');
 const delta=document.getElementById('driveDelta');
 const trend=document.getElementById('driveTrend');
 const driveHits=[...document.querySelectorAll('.drive-hit')];

 driveHits.forEach(hit=>{
   hit.addEventListener('click',event=>{
     event.stopPropagation();
     const alreadySelected=hit.classList.contains('selected') && readout.classList.contains('show');
     driveHits.forEach(item=>item.classList.remove('selected'));
     if(alreadySelected){
       readout.classList.remove('show');
       return;
     }
     hit.classList.add('selected');
     name.textContent=hit.dataset.drive;
     value.textContent=hit.dataset.value;
     delta.textContent=hit.dataset.delta;
     trend.textContent=hit.dataset.trend;
     readout.classList.add('show');
   });
 });

 document.querySelector('.mind-visual').addEventListener('click',()=>{
   driveHits.forEach(item=>item.classList.remove('selected'));
   readout.classList.remove('show');
 });

 document.querySelectorAll('[data-touch]').forEach(button=>{
   button.addEventListener('click',()=>{
     button.classList.remove('ping');
     void button.offsetWidth;
     button.classList.add('ping');
     const messages={
       '想你':'收到这一点想念了。',
       '戳戳':'戳到了，我会注意到你。',
       '抱抱':'抱抱收到了。'
     };
     show(messages[button.dataset.touch] || button.dataset.touch);
   });
 });
})();
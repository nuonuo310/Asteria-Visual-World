(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const running=new WeakMap();
function play(el,frames,options){if(!el||reduce.matches||!el.animate)return;running.get(el)?.cancel();const a=el.animate(frames,options);running.set(el,a);return a}
const main=document.querySelector('.mind-main');
if(main&&'IntersectionObserver'in window){new IntersectionObserver(items=>items.forEach(i=>i.target.classList.toggle('mm-in-view',i.isIntersecting)),{threshold:.2}).observe(main)}else main?.classList.add('mm-in-view');
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('mm-hidden',document.hidden));
// Pending touch buttons only give local visual feedback; no success message or runtime write.
document.querySelectorAll('.touch').forEach((button,index)=>button.addEventListener('click',()=>{const icon=button.querySelector('.touch-icon');const frames=index===2?[{translate:'0 0'},{translate:'0 2px',offset:.35},{translate:'0 -1px',offset:.65},{translate:'0 0'}]:index===3?[{scale:1},{scale:1.06,offset:.5},{scale:1}]:[{scale:1,opacity:1},{scale:1.04,opacity:.75,offset:.45},{scale:1,opacity:1}];play(icon,frames,{duration:380,easing:'ease-out'})}));
const detail=document.querySelector('.detail-view');if(!detail)return;
function revealMeters(){detail.querySelectorAll('.state-line i,.drive-meter i').forEach(el=>play(el,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:550,easing:'cubic-bezier(.2,.7,.3,1)'}))}
function drawCurve(){const path=detail.querySelector('.trace-detail-chart .curve,.drive-history-chart .curve');if(!path||reduce.matches)return;const length=path.getTotalLength();play(path,[{strokeDasharray:String(length),strokeDashoffset:String(length)},{strokeDasharray:String(length),strokeDashoffset:'0'}],{duration:650,easing:'ease-out'})}
const observer=new MutationObserver(records=>{if(records.some(r=>r.target===detail&&r.type==='childList')&&!detail.hidden){revealMeters();drawCurve()}});observer.observe(detail,{childList:true});
detail.addEventListener('click',event=>{const tab=event.target.closest('[data-drive]');if(tab){play(detail.querySelector('.drive-reason'),[{opacity:.55,translate:'0 3px'},{opacity:1,translate:'0 0'}],{duration:260,easing:'ease-out'})}if(event.target.closest('[data-point]'))play(detail.querySelector('.chart-annotation'),[{opacity:.5},{opacity:1}],{duration:230})});
if(!detail.hidden){revealMeters();drawCurve()}
})();

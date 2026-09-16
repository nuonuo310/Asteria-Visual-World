(() => {
 const toast=document.getElementById('toast'); let timer;
 function show(message){clearTimeout(timer);toast.textContent=message;toast.classList.add('show');timer=setTimeout(()=>toast.classList.remove('show'),1300)}
 document.querySelectorAll('[data-gate]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.gate+' · 详情页下一轮装修')));
 const touch=document.getElementById('touchMind');
 touch.addEventListener('click',()=>{touch.classList.remove('ping');void touch.offsetWidth;touch.classList.add('ping');show('碰到了。');});
})();
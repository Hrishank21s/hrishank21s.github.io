const nav=document.getElementById('nav'),menu=document.getElementById('menu'),mobile=document.getElementById('mobileNav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20),{passive:true});
menu.addEventListener('click',()=>mobile.classList.toggle('open'));
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
document.getElementById('year').textContent=new Date().getFullYear();
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%5)*.07+'s';io.observe(el)});

document.querySelectorAll('.tour-tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tour-tabs button,.tour-panel').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelector('.tour-panel[data-p="'+b.dataset.p+'"]').classList.add('on')}));
document.querySelectorAll('.tour-shots button').forEach(b=>b.addEventListener('click',()=>{const f=b.closest('.tour-panel'),i=f.querySelector('.tour-frame img');f.querySelectorAll('.tour-shots button').forEach(x=>x.classList.remove('on'));b.classList.add('on');i.src=b.dataset.src;i.alt=b.dataset.alt}));

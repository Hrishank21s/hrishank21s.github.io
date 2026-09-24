const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const nav=$('#nav'),menu=$('#menu'),mnav=$('#mnav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20),{passive:true});
menu.addEventListener('click',()=>{const o=mnav.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
$$('#mnav a').forEach(a=>a.addEventListener('click',()=>{mnav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
$('#year').textContent=new Date().getFullYear();
// reveal
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');rio.unobserve(e.target)}}),{threshold:.1});
$$('.reveal').forEach(el=>rio.observe(el));
// count-up
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const t=+e.target.dataset.n,plus=e.target.dataset.plus,d=900,s=performance.now();(function f(n){const p=Math.min(1,(n-s)/d);e.target.textContent=Math.round(t*(1-Math.pow(1-p,3)))+(p===1&&plus?'+':'');if(p<1)requestAnimationFrame(f)})(s)}),{threshold:.6});
$$('.stats b').forEach(b=>cio.observe(b));
// hero player
const hv=$('#heroVid');
$$('.tab').forEach(t=>t.addEventListener('click',()=>{
  $$('.tab').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-selected')});t.classList.add('on');t.setAttribute('aria-selected','true');
  $('#heroName').textContent=t.dataset.n;$('#heroType').textContent=t.dataset.t;$('#heroLink').href=t.dataset.h;
  hv.poster='assets/videos/'+t.dataset.v+'.jpg';hv.src='assets/videos/'+t.dataset.v+'.mp4';hv.play().catch(()=>{});
}));
// lazy product videos: load + play only while visible
$$('.vid video').forEach(v=>{
  const box=v.parentElement,btn=$('.playbtn',box);
  const play=()=>{if(!v.src)v.src=v.dataset.src;v.play().then(()=>box.classList.add('playing')).catch(()=>{})};
  new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?play():(v.pause(),box.classList.remove('playing'))),{threshold:.45}).observe(v);
  btn.addEventListener('click',()=>v.paused?play():(v.pause(),box.classList.remove('playing')));
  v.addEventListener('click',()=>btn.click());
});
// gallery thumbs
$$('.gallery').forEach(g=>{const img=$('.stage img',g),cap=$('.cap',g);
  $$('.th',g).forEach(b=>b.addEventListener('click',()=>{$$('.th',g).forEach(x=>x.classList.remove('on'));b.classList.add('on');img.style.opacity=0;setTimeout(()=>{img.src=b.dataset.src;img.alt=b.dataset.cap;cap.textContent=b.dataset.cap;img.style.opacity=1},160)}))});
// scroll-spy for product chips
const links=$$('.pnav a'),map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('on'));map.get(e.target.id)?.classList.add('on')}}),{rootMargin:'-45% 0px -50% 0px'});
$$('.product').forEach(s=>spy.observe(s));

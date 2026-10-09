const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
const G=window.gsap,ST=window.ScrollTrigger,anim=!!(G&&ST)&&!reduce;
if(anim){document.documentElement.classList.add('anim');G.registerPlugin(ST)}

// ---------- basic UI (works without any animation libs) ----------
const nav=$('#nav'),menu=$('#menu'),mnav=$('#mnav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20),{passive:true});
menu.addEventListener('click',()=>{const o=mnav.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
$$('#mnav a').forEach(a=>a.addEventListener('click',()=>{mnav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
$('#year').textContent=new Date().getFullYear();

const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const t=+e.target.dataset.n,plus=e.target.dataset.plus,d=1400,s=performance.now();(function f(n){const p=Math.min(1,(n-s)/d);e.target.textContent=Math.round(t*(1-Math.pow(1-p,4)))+(p===1&&plus?'+':'');if(p<1)requestAnimationFrame(f)})(s)}),{threshold:.6});
$$('.stats b').forEach(b=>cio.observe(b));

let gl=null; // set once the WebGL scene is ready
const hv=$('#heroVid'),screen=$('#screen');
$$('.tab').forEach(t=>t.addEventListener('click',()=>{
  $$('.tab').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-selected')});t.classList.add('on');t.setAttribute('aria-selected','true');
  $('#heroName').textContent=t.dataset.n;$('#heroType').textContent=t.dataset.t;$('#heroLink').href=t.dataset.h;
  const a=t.style.getPropertyValue('--a');screen.style.setProperty('--glow',a);gl?.color(a);
  hv.style.opacity=0;setTimeout(()=>{hv.poster='assets/videos/'+t.dataset.v+'.jpg';hv.src='assets/videos/'+t.dataset.v+'.mp4';hv.play().catch(()=>{});hv.style.opacity=1},200);
}));
$$('.vid video').forEach(v=>{
  const box=v.parentElement,btn=$('.playbtn',box);
  const play=()=>{if(!v.src)v.src=v.dataset.src;v.play().then(()=>box.classList.add('playing')).catch(()=>{})};
  new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?play():(v.pause(),box.classList.remove('playing'))),{threshold:.45}).observe(v);
  btn.addEventListener('click',()=>v.paused?play():(v.pause(),box.classList.remove('playing')));
  v.addEventListener('click',()=>btn.click());
});
$$('.gallery').forEach(g=>{const img=$('.stage img',g),cap=$('.cap',g);
  $$('.th',g).forEach(b=>b.addEventListener('click',()=>{$$('.th',g).forEach(x=>x.classList.remove('on'));b.classList.add('on');img.style.opacity=0;img.style.transform='scale(.97)';setTimeout(()=>{img.src=b.dataset.src;img.alt=b.dataset.cap;cap.textContent=b.dataset.cap;img.style.opacity=1;img.style.transform=''},180)}))});
const links=$$('.pnav a'),map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('on'));map.get(e.target.id)?.classList.add('on')}}),{rootMargin:'-45% 0px -50% 0px'});
$$('.product').forEach(s=>spy.observe(s));
// which 3D shape the background morphs into: the section crossing the middle of the screen
const shapeIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)gl?.morph(e.target.dataset.shape,e.target.dataset.color)}),{rootMargin:'-50% 0px -50% 0px'});
$$('[data-shape]').forEach(s=>shapeIO.observe(s));

// ---------- text splitting ----------
function split(el,chars){
  const walk=n=>[...n.childNodes].forEach(c=>{
    if(c.nodeType===1)return walk(c);if(c.nodeType!==3)return;
    const frag=document.createDocumentFragment();
    c.textContent.split(/(\s+)/).forEach(part=>{
      if(!part)return;if(/^\s+$/.test(part))return frag.append(' ');
      const w=document.createElement('span');w.className='w';
      for(const ch of chars?[...part]:[part]){const s=document.createElement('span');if(chars)s.className='ch';s.textContent=ch;w.append(s)}
      frag.append(w);
    });
    c.replaceWith(frag);
  });
  walk(el);el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
}

// ---------- motion ----------
if(anim){
  $$('.split').forEach(el=>split(el,true));$$('.words').forEach(el=>split(el,false));

  if(window.Lenis){
    const lenis=new Lenis({lerp:.09});lenis.on('scroll',ST.update);G.ticker.add(t=>lenis.raf(t*1000));G.ticker.lagSmoothing(0);
    $$('a[href^="#"]:not(.skip)').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href'),t=id==='#top'?0:$(id);if(t===null)return;e.preventDefault();lenis.scrollTo(t,{offset:t?-110:0,duration:1.6})}));
  }

  // loader -> hero intro
  const loader=$('#loader'),ln=$('#loadN'),o={p:0};
  const intro=()=>G.timeline()
    .fromTo('.hero h1 .ch',{yPercent:120,rotateX:-90,opacity:0},{yPercent:0,rotateX:0,opacity:1,duration:1.3,stagger:.025,ease:'expo.out'})
    .fromTo('.hero-in .reveal',{opacity:0,y:30},{opacity:1,y:0,duration:1,stagger:.1,ease:'expo.out'},'-=.9');
  G.set('.hero h1 .ch',{opacity:0});
  G.to(o,{p:100,duration:1.4,ease:'power2.inOut',onUpdate(){ln.textContent=String(Math.round(o.p)).padStart(2,'0');loader.style.setProperty('--p',o.p/100)},
    onComplete(){G.to(loader,{yPercent:-100,duration:1,ease:'expo.inOut',onComplete:()=>loader.remove()});G.delayedCall(.45,intro)}});

  G.to('#progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
  G.to('.hero-in',{yPercent:-18,opacity:.15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:()=>'+='+innerHeight*.8,scrub:true}});
  // hero screen lies back in 3D and stands up as you scroll
  G.fromTo('#screen',{rotateX:42,scale:.8,y:-30},{rotateX:0,scale:1,y:0,ease:'none',scrollTrigger:{trigger:'#player',start:'top bottom',end:'top 22%',scrub:1}});

  ST.batch($$('.reveal').filter(el=>!el.closest('.hero-in')),{start:'top 88%',once:true,onEnter:b=>G.fromTo(b,{opacity:0,y:60},{opacity:1,y:0,duration:1.1,stagger:.08,ease:'expo.out'})});
  ST.batch('.does li, .how li, .specs div',{start:'top 92%',once:true,onEnter:b=>G.fromTo(b,{opacity:0,x:-30},{opacity:1,x:0,duration:.9,stagger:.07,ease:'expo.out'})});
  ST.batch('.card',{start:'top 88%',once:true,onEnter:b=>G.fromTo(b,{opacity:0,y:120,rotateX:-40,transformOrigin:'50% 100%'},{opacity:1,y:0,rotateX:0,duration:1.4,stagger:.12,ease:'expo.out'})});
  $$('.words').forEach(el=>G.from($$('.w>span',el),{yPercent:115,rotate:6,duration:1.2,stagger:.07,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}}));
  $$('.ghostnum').forEach(el=>G.fromTo(el,{yPercent:-30},{yPercent:60,ease:'none',scrollTrigger:{trigger:el.closest('.product'),start:'top bottom',end:'bottom top',scrub:true}}));
  $$('.gallery.phone .stage img').forEach(el=>G.fromTo(el,{rotateY:-16,rotateX:6},{rotateY:12,rotateX:-3,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}}));

  if(fine){
    // 3D tilt + glare
    $$('.tilt').forEach(el=>{
      G.set(el,{transformPerspective:1100});
      const rx=G.quickTo(el,'rotationX',{duration:.7,ease:'power3'}),ry=G.quickTo(el,'rotationY',{duration:.7,ease:'power3'});
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;ry((x-.5)*9);rx((.5-y)*7);el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%')});
      el.addEventListener('pointerleave',()=>{rx(0);ry(0)});
    });
    // magnetic buttons
    $$('.mag').forEach(el=>{
      const x=G.quickTo(el,'x',{duration:.5,ease:'power3'}),y=G.quickTo(el,'y',{duration:.5,ease:'power3'});
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();x((e.clientX-r.left-r.width/2)*.35);y((e.clientY-r.top-r.height/2)*.45)});
      el.addEventListener('pointerleave',()=>{x(0);y(0)});
    });
    // cursor
    const cur=$('#cursor'),cx=G.quickTo(cur,'x',{duration:.35,ease:'power3'}),cy=G.quickTo(cur,'y',{duration:.35,ease:'power3'});
    addEventListener('pointermove',e=>{cx(e.clientX);cy(e.clientY)},{passive:true});
    $$('a,button,.tilt').forEach(el=>{el.addEventListener('pointerenter',()=>cur.classList.add('big'));el.addEventListener('pointerleave',()=>cur.classList.remove('big'))});
  }
}else $('#loader')?.remove();

// ---------- WebGL particle field that morphs per section ----------
async function initGL(){
  if(reduce)return;
  const THREE=await import('three'),{MeshSurfaceSampler}=await import('three/addons/math/MeshSurfaceSampler.js');
  const canvas=$('#gl'),small=innerWidth<760,N=small?4500:10000;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.z=9;
  const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize);

  const sample=geo=>{const s=new MeshSurfaceSampler(new THREE.Mesh(geo.index?geo.toNonIndexed():geo)).build(),a=new Float32Array(N*3),v=new THREE.Vector3();for(let i=0;i<N;i++){s.sample(v);a[i*3]=v.x;a[i*3+1]=v.y;a[i*3+2]=v.z}return a};
  // DNA: two strands (r = ±1.5) plus rungs (r anywhere between) on a few discrete steps
  const helix=()=>{const a=new Float32Array(N*3),j=()=>(Math.random()-.5)*.12;for(let i=0;i<N;i++){const rung=i%3===2,t=rung?Math.round(Math.random()*40)/40:Math.random(),ang=t*Math.PI*8,r=rung?(Math.random()*2-1)*1.5:(i%3?1.5:-1.5);
    a[i*3]=Math.cos(ang)*r+j();a[i*3+1]=(t-.5)*7+j();a[i*3+2]=Math.sin(ang)*r+j()}return a};
  const shapes={
    sphere:sample(new THREE.SphereGeometry(2.4,48,32)),
    table:sample(new THREE.BoxGeometry(5.2,.3,2.7).rotateX(.55)),
    torus:sample(new THREE.TorusGeometry(1.8,.62,32,100).rotateX(1.1)),
    pyramid:sample(new THREE.ConeGeometry(2.3,3.4,4)),
    ico:sample(new THREE.IcosahedronGeometry(2.5,0)),
    phone:sample(new THREE.BoxGeometry(1.9,3.8,.28)),
    helix:helix(),
    knot:sample(new THREE.TorusKnotGeometry(1.5,.42,220,24)),
    keyboard:sample(new THREE.BoxGeometry(5.6,.25,1.9).rotateX(.9).rotateZ(-.12))
  };

  const geo=new THREE.BufferGeometry(),pos=new Float32Array(N*3),rnd=new Float32Array(N),spd=new Float32Array(N);
  for(let i=0;i<N;i++){rnd[i]=Math.random();spd[i]=.025+Math.random()*.05;const r=8+Math.random()*10,th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);pos[i*3+2]=r*Math.cos(ph)}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aRand',new THREE.BufferAttribute(rnd,1));
  const uni={uTime:{value:0},uSize:{value:small?30:26},uPR:{value:renderer.getPixelRatio()},uMouse:{value:new THREE.Vector3(99,99,0)},uColor:{value:new THREE.Color('#7cf2a0')},uOpacity:{value:1}};
  const mat=new THREE.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`uniform float uTime,uSize,uPR;uniform vec3 uMouse;attribute float aRand;varying float vA;
      void main(){vec3 p=position+.05*vec3(sin(uTime*1.3+aRand*40.),cos(uTime*1.1+aRand*30.),sin(uTime*.9+aRand*20.));
        vec4 w=modelMatrix*vec4(p,1.);vec3 d=w.xyz-uMouse;w.xyz+=normalize(d+1e-4)*smoothstep(1.8,0.,length(d))*1.1;
        vec4 mv=viewMatrix*w;gl_Position=projectionMatrix*mv;gl_PointSize=uSize*uPR*(.5+aRand)/-mv.z;vA=.3+.7*aRand;}`,
    fragmentShader:`uniform vec3 uColor;uniform float uOpacity;varying float vA;
      void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(uColor,smoothstep(.5,0.,d)*vA*uOpacity);}`});
  const group=new THREE.Group();group.add(new THREE.Points(geo,mat));scene.add(group);

  let target=shapes.sphere,tColor=new THREE.Color('#7cf2a0'),tOpacity=1,tX=0,shape='sphere';
  const layout=()=>{const hero=shape==='sphere'&&scrollY<innerHeight;tX=small?0:hero&&scrollY<innerHeight*.5?2.9:shape==='sphere'?0:3.4;tOpacity=small?.45:shape==='sphere'?1:.5};
  const mouse=new THREE.Vector2(9,9),m3=new THREE.Vector3(),tmp=new THREE.Vector3();
  addEventListener('pointermove',e=>{mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)},{passive:true});
  let lastY=scrollY,vel=0;
  renderer.setAnimationLoop(t=>{
    uni.uTime.value=t/1000;layout();
    for(let i=0;i<N;i++){const k=spd[i],j=i*3;pos[j]+=(target[j]-pos[j])*k;pos[j+1]+=(target[j+1]-pos[j+1])*k;pos[j+2]+=(target[j+2]-pos[j+2])*k}
    geo.attributes.position.needsUpdate=true;
    vel+=((scrollY-lastY)-vel)*.1;lastY=scrollY;
    group.rotation.y+=.0025+vel*.0009;group.rotation.x+=(mouse.y*.3-group.rotation.x)*.04;group.rotation.z+=(-mouse.x*.12-group.rotation.z)*.04;
    group.position.x+=(tX-group.position.x)*.05;
    uni.uColor.value.lerp(tColor,.05);uni.uOpacity.value+=(tOpacity-uni.uOpacity.value)*.05;
    tmp.set(mouse.x,mouse.y,.5).unproject(camera).sub(camera.position).normalize();m3.copy(camera.position).addScaledVector(tmp,-camera.position.z/tmp.z);uni.uMouse.value.lerp(m3,.15);
    renderer.render(scene,camera);
  });
  gl={
    morph(s,c){if(!shapes[s]||s===shape&&target===shapes[s])return;shape=s;target=shapes[s];tColor.set(c);
      for(let i=0;i<N*3;i++)pos[i]+=(Math.random()-.5)*.9}, // little burst so the swarm visibly re-forms
    color(c){tColor.set(c)}
  };
}
initGL().catch(()=>{}); // decorative only: no WebGL / CDN down -> page still works

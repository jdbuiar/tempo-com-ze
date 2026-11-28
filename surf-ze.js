/* Surf visitors: Zé, Niko and Brisa walk in with the board; sometimes Jorge comes from the other side for a chat.
   Jorge (and Zé in street clothes) dress for the weather. Sprites come from scripts/montar_sprites_surfe.py. */
(() => {
'use strict';
const section=document.getElementById('surf');if(!section)return;
const lang=()=>{const l=document.documentElement.lang.split('-')[0];return ['pt','es','en'].includes(l)?l:'pt';};

/* ---------- Atlases ---------- */
const ATLAS={
 zeWalk:{src:'assets/ze-surf-walk-10.webp',cols:5,rows:2},
 zeGreet:{src:'assets/ze-surf-greeting.webp',cols:3,rows:1},
 niko:{src:'assets/surf-niko.webp',cols:8,rows:3},
 brisa:{src:'assets/surf-brisa.webp',cols:8,rows:3},
 duoZe:{src:'assets/surf-duo-ze.webp',cols:12,rows:4},
 duoNiko:{src:'assets/surf-duo-niko.webp',cols:12,rows:4},
 duoBrisa:{src:'assets/surf-duo-brisa.webp',cols:12,rows:4},
 walkZe:{src:'assets/surf-walk-ze.webp',cols:6,rows:4},
 walkJorge:{src:'assets/surf-walk-jorge.webp',cols:6,rows:4},
 walkBrisa:{src:'assets/surf-walk-brisa.webp',cols:6,rows:4},
 walkNiko:{src:'assets/surf-walk-niko.webp',cols:6,rows:4},
 walkJorgeRain:{src:'assets/surf-walk-jorge-chuva.webp',cols:6,rows:4},
 walkJorgeCold:{src:'assets/surf-walk-jorge-frio.webp',cols:6,rows:4}
};
/* Each actor: walk cycle, arrival poses, talk loop and exit walk, as [atlas,index] frames. */
const seq=(atlas,list)=>list.map(i=>[atlas,i]);
/* walk cycles carry their step: how far the body moves per frame, as a fraction of the sprite box,
   measured from the drawings (scripts/montar_sprites_surfe.py) so the feet don't slide */
const walk=(atlas,list,step)=>Object.assign(seq(atlas,list),{step});
const range=n=>Array.from({length:n},(_,i)=>i);
/* per-frame advance (fraction of the sprite box), measured by following the foot on the ground from one
   frame to the next; the drawings are not perfectly even, so one number per frame keeps the feet planted */
const STEPS={"ze-surf":[0.0164,0.0158,0.0152,0.0158,0.0164,0.0167,0.017,0.0167,0.0164,0.0164],"ze":[0.021,0.022,0.0264,0.0283,0.0273,0.0229,0.0146,0.0161,0.022,0.0225,0.02,0.0132,0.0146,0.0249,0.0234,0.0151,0.0142,0.0122,0.0127,0.0205,0.022,0.0166,0.0142,0.0181],"brisa":[0.0171,0.0234,0.0312,0.0327,0.0303,0.0234,0.0186,0.021,0.0176,0.0107,0.0186,0.0269,0.0264,0.0308,0.0352,0.0322,0.0264,0.0254,0.0273,0.0254,0.0234,0.02,0.0161,0.0161],"jorge":[0.0206,0.0261,0.0226,0.0234,0.0205,0.0132,0.0197,0.0295,0.028,0.0234,0.0205,0.0166,0.0201,0.0242,0.0227,0.0217,0.0148,0.0153,0.0277,0.0321,0.028,0.0195,0.0093,0.0093],"niko":[0.0299,0.0315,0.0153,0.0133,0.0247,0.0265,0.0266,0.0276,0.0203,0.0142,0.0203,0.0291,0.035,0.0389,0.0302,0.0208,0.0256,0.0284,0.0309,0.0291,0.0167,0.0132,0.0132,0.0161],"jorge-chuva":[0.0171,0.0244,0.0205,0.019,0.022,0.0181,0.0171,0.0225,0.0229,0.0239,0.0244,0.0181,0.0171,0.0186,0.0156,0.0176,0.0161,0.0151,0.0239,0.0273,0.0254,0.021,0.0093,0.0059],"jorge-frio":[0.0222,0.0327,0.0305,0.0278,0.022,0.0122,0.0183,0.0249,0.022,0.0264,0.03,0.0278,0.0271,0.0308,0.03,0.0244,0.0229,0.0276,0.0349,0.0349,0.0251,0.0176,0.0137,0.0117]};
const WALK={ze:walk('walkZe',range(24),STEPS.ze),jorge:walk('walkJorge',range(24),STEPS.jorge),brisa:walk('walkBrisa',range(24),STEPS.brisa),niko:walk('walkNiko',range(24),STEPS.niko),
 jorgeRain:walk('walkJorgeRain',range(24),STEPS['jorge-chuva']),jorgeCold:walk('walkJorgeCold',range(24),STEPS['jorge-frio'])};
/* which outfit rows have a walk cycle that matches the chat pose (0 mild, 1 rain, 2 cold, 3 hot) */
const JORGE_WALK=[WALK.jorge,WALK.jorgeRain,WALK.jorgeCold,null],ZE_WALK=[WALK.ze,null,null,null];
const ACTOR={
 ze:{name:'ZÉ',walk:walk('zeWalk',range(10),STEPS['ze-surf']),arrive:seq('zeGreet',[0,1]),talk:seq('zeGreet',[2]),exitWalk:walk('zeWalk',range(10),STEPS['ze-surf'])},
 niko:{name:'NIKO',walk:WALK.niko,arrive:seq('niko',[10,11,12,12]),talk:seq('niko',[13,14,16,17,18,15]),bye:seq('niko',[19]),exitWalk:WALK.niko},
 brisa:{name:'BRISA',walk:WALK.brisa,arrive:seq('brisa',[18,19]),talk:seq('brisa',[20,21,22,23,21]),leave:seq('brisa',[18]),exitWalk:WALK.brisa}
};
/* Walking needs a full cycle: Brisa and Niko always have one, Zé and Jorge only in the mild-weather outfit
   (duo scenes run only then, see nextScene). */
const duoActor=(atlas,name,row,jorge,who)=>{const o=(jorge?6:0)+row*12,key=jorge?'jorge':who;
 const smooth=key==='brisa'||key==='niko'?WALK[key]:key==='jorge'?JORGE_WALK[row]:ZE_WALK[row];
 return {name,fade:!smooth,walk:smooth,arrive:seq(atlas,[jorge?o+4:o+2]),listen:seq(atlas,[o+4]),talk:seq(atlas,jorge?[o+2,o+3]:[o+3,o+2]),exitWalk:smooth};};

/* Jorge's outfit (and Zé's street clothes) follow the sky at the chosen beach right now; the main forecast only if the beach has no data yet. */
function weatherRow(){const sky=window.SurfSky?.();if(Number.isInteger(sky))return sky;const v=document.querySelector('[data-variant]')?.dataset.variant;return v==='sunny'?3:['rain','drizzle','storm'].includes(v)?1:v==='cold'?2:0;}
const WEATHER=['mild','rain','cold','hot'];

/* ---------- Lines (surf-falas.js) ---------- */
const {ZE_LINES,SOLO_LINES,SURF_CHATS,ZE_CHATS,UI}=window.SurfFalas;

/* ---------- Scene order (shuffled, remembered) ---------- */
const SCENES=['ze','niko','brisa','duoZe','duoNiko','duoBrisa'];
const store=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
function pickIndex(key,count){const s=store(key,{});let last=Number.isInteger(s.last)?s.last:-1,left=Array.isArray(s.left)?s.left.filter(n=>Number.isInteger(n)&&n>=0&&n<count&&n!==last):[];
 if(!left.length){left=Array.from({length:count},(_,i)=>i);for(let i=left.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[left[i],left[j]]=[left[j],left[i]];}if(count>1&&left[0]===last)left.push(left.shift());}
 last=left.shift();save(key,{last,left});return last;}
/* a new visitor at most once a minute while the surf section stays on screen */
const GAP=60000;
/* Jorge's chats only happen when everyone can walk in for real, in an outfit that matches the chat pose:
   Jorge walks in mild, rain and cold; Zé in street clothes only in mild (see JORGE_WALK / ZE_WALK). */
function nextScene(){const row=weatherRow(),ok=s=>!s.startsWith('duo')||JORGE_WALK[row]&&(s!=='duoZe'||ZE_WALK[row]);
 for(let i=0;i<SCENES.length;i++){const s=SCENES[pickIndex('ze-surf-scenes-v1',SCENES.length)];if(ok(s))return s;}return 'ze';}

/* ---------- DOM ---------- */
const supported=!!window.ZeVoice?.supported;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const host=document.createElement('div');host.id='surf-ze';host.className='surf-ze-welcome';host.setAttribute('aria-hidden','true');
host.innerHTML='<div class="surf-ze-actor" role="img"><div class="surf-ze-sprite" aria-hidden="true"></div></div><div class="surf-ze-actor surf-ze-actor-b" role="img" hidden><div class="surf-ze-sprite" aria-hidden="true"></div></div><div class="surf-ze-bubble" hidden><span class="surf-ze-name"></span><p class="surf-ze-phrase" aria-live="polite"></p><span class="ze-sound-hint" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="w1" d="M16 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="w2" d="M18.5 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></div>';
const sea=document.createElement('div');sea.className='surf-mar';sea.setAttribute('aria-hidden','true');
const [actorA,actorB]=host.querySelectorAll('.surf-ze-actor'),[spriteA,spriteB]=host.querySelectorAll('.surf-ze-sprite');
const bubble=host.querySelector('.surf-ze-bubble'),nameTag=host.querySelector('.surf-ze-name'),phrase=host.querySelector('.surf-ze-phrase');
const paused=()=>document.body.classList.contains('paused')||document.visibilityState!=='visible';
function mount(){const heading=section.querySelector('.section-heading');if(heading&&host.parentElement!==section)heading.after(host);if(host.parentElement===section&&host.nextSibling!==sea)host.after(sea);}
function frame(sprite,[key,index]){const a=ATLAS[key];sprite.style.backgroundImage=`url('${a.src}')`;sprite.style.backgroundSize=`${a.cols*100}% ${a.rows*100}%`;
 sprite.style.backgroundPosition=`${a.cols>1?index%a.cols/(a.cols-1)*100:0}% ${a.rows>1?Math.floor(index/a.cols)/(a.rows-1)*100:0}%`;}
const cycle=(list,step)=>list[((step%list.length)+list.length)%list.length];
const lineTime=text=>Math.max(2600,text.length*58+900);

/* ---------- Building a scene ---------- */
let scene=null;
function build(id){
 const l=lang(),row=weatherRow(),w=WEATHER[row];
 if(id==='ze'){const i=pickIndex('ze-surf-lines-v1',ZE_LINES.pt.length);return {id,a:ACTOR.ze,voice:true,lines:[['A',ZE_LINES[l][i]]],line:i,atlases:['zeWalk','zeGreet']};}
 if(id==='niko'||id==='brisa'){const pool=SOLO_LINES[id][l],i=pickIndex('ze-surf-'+id+'-v1',pool.length);return {id,a:ACTOR[id],lines:pool[i].map(t=>['A',t]),line:i,atlases:id==='brisa'?['brisa','walkBrisa']:['niko','walkNiko']};}
 const who=id==='duoZe'?'ze':id==='duoNiko'?'niko':'brisa',atlas=id;
 const chats=(who==='ze'?ZE_CHATS:SURF_CHATS)[l][w],i=pickIndex('ze-surf-'+id+'-'+w+'-v1',chats.length);
 return {id,who,row,weather:w,line:i,a:duoActor(atlas,ACTOR[who].name,row,false,who),b:duoActor(atlas,'JORGE',row,true),lines:chats[i].map(([s,t])=>[s,t.replace('{A}',ACTOR[who].name[0]+ACTOR[who].name.slice(1).toLowerCase())]),atlases:[...new Set([atlas,...[...scene_walks(who,row)]])]};
}
function scene_walks(who,row){const w=[];if(who==='brisa')w.push('walkBrisa');if(who==='niko')w.push('walkNiko');w.push(['walkJorge','walkJorgeRain','walkJorgeCold'][row]);if(who==='ze'&&row===0)w.push('walkZe');return w.filter(Boolean);}
/* Re-read the lines in the new language without changing the chosen chat. */
function relabel(){if(!scene)return;const l=lang();
 if(scene.id==='ze')scene.lines=[['A',ZE_LINES[l][scene.line]]];
 else if(!scene.b)scene.lines=SOLO_LINES[scene.id][l][scene.line].map(t=>['A',t]);
 else{const chats=(scene.who==='ze'?ZE_CHATS:SURF_CHATS)[l][scene.weather];const name=ACTOR[scene.who].name[0]+ACTOR[scene.who].name.slice(1).toLowerCase();scene.lines=chats[Math.min(scene.line,chats.length-1)].map(([s,t])=>[s,t.replace('{A}',name)]);}
 if(path)scene.lines.forEach(([,text],i)=>{if(path.talks[i])path.talks[i].text=text;});
 describe();}
function describe(){if(!scene)return;const u=UI[lang()],names=[scene.a.name,scene.b?.name].filter(Boolean).map(n=>n[0]+n.slice(1).toLowerCase());actorA.setAttribute('aria-label',u.describe(names.join(' & ')));}

/* Timeline: walk in, arrive, talk line by line, walk out. Duos cross each other on the way out. */
function plan(){
 const s=scene,size=actorA.offsetWidth,width=host.clientWidth,duo=!!s.b;
 const homeA=duo?width/2-size*.78:(width-size)/2,homeB=width/2-size*.22;
 const speed=size*(duo?.5:.7),fadeA=!!s.a.fade,fadeB=!!s.b?.fade;
 /* someone who fades in only needs the fade time; walkers need the trip */
 const enter=Math.max(fadeA?700:(homeA+size)/speed*1000,duo?(fadeB?700:(width-homeB)/speed*1000):0);
 const arrive=(s.a.arrive.length*260);
 const talks=[];let t=enter+arrive;for(const [who,text] of s.lines){const d=lineTime(text);talks.push({who,text,start:t,end:t+d});t+=d+280;}
 const exit=t+(s.a.bye?650:s.a.leave?300:0);
 const outA=fadeA?700:(width-homeA+size*.2)/speed*1000,outB=duo?(fadeB?700:(homeB+size*1.1)/speed*1000):0;
 return {size,width,homeA,homeB,speed,enter,arrive,talks,talkEnd:t,exit,end:exit+Math.max(outA,outB)};
}
let ready=false,visible=false,lastGreeting=-Infinity,progress=0,previous=0,active=false,raf=0,utterance=null,serial=0,path=null,returnTimer=0,shown='';
function stopVoice(){serial++;if(utterance&&supported)ZeVoice.cancel();utterance=null;}
/* Each line plays in the voice of whoever says it; while the recording runs, the line waits for it. */
const voiceOf=talk=>scene.id==='ze'?null:talk.who==='J'?'jorge':(scene.who||scene.id);
let saying=-1;
function speak(idx){const talk=path?.talks[idx];if(!supported||!visible||!talk||!ZeVoice.enabled||paused())return;stopVoice();const id=serial;saying=idx;
 utterance=ZeVoice.utterance(talk.text,voiceOf(talk));utterance.lang=lang()==='pt'?'pt-BR':lang()==='es'?'es-ES':'en-US';utterance.volume=.85;
 utterance.onend=()=>{if(id===serial)utterance=null;};
 utterance.onerror=()=>{if(id===serial)utterance=null;};
 ZeVoice.speak(utterance);}
function stretch(idx,at){const p=path,talk=p.talks[idx];if(!talk||at<=talk.end)return;const extra=at-talk.end;talk.end+=extra;for(const later of p.talks.slice(idx+1)){later.start+=extra;later.end+=extra;}p.talkEnd+=extra;p.exit+=extra;p.end+=extra;}
function finish(){actorA.style.opacity=actorB.style.opacity='';if(active&&visible){clearTimeout(returnTimer);returnTimer=setTimeout(greet,GAP);}active=false;previous=0;stopVoice();bubble.hidden=true;shown='';host.classList.remove('surf-ze-active','surf-ze-duo');actorB.hidden=true;host.dataset.pose='waiting';host.setAttribute('aria-hidden','true');}
/* gait follows distance: long cycles span one stride, short ones change every ~18% of the body size */
function walkFrame(list,distance){const s=list.step||.74/list.length,u=Math.max(0,distance)/path.size;
 if(!Array.isArray(s))return cycle(list,Math.floor(u/s));
 const total=s.reduce((x,y)=>x+y,0);let r=u%total,i=0;while(i<s.length-1&&r>=s[i]){r-=s[i];i++;}return list[i];}
function tick(now){raf=0;if(!active)return;const delta=previous?Math.max(0,now-previous):0;previous=now;if(!visible){finish();return;}if(!paused())progress+=delta;
 const p=path,s=scene,t=progress;if(t>=p.end||(reduced.matches&&t>=p.talkEnd)){finish();return;}
 let xa=p.homeA,xb=p.homeB,fa,fb,pose='talking',talk=null;
 let oa=1,ob=1;
 if(t<p.enter){pose='entering';const da=t/1000*p.speed;
  if(s.a.fade){xa=p.homeA;fa=s.a.arrive[0];oa=Math.max(0,Math.min(1,(t-p.enter+700)/700));}else{xa=Math.min(p.homeA,-p.size+da);fa=xa<p.homeA?walkFrame(s.a.walk,da):s.a.arrive[0];}
  if(s.b){if(s.b.fade){xb=p.homeB;fb=s.b.arrive[0];ob=Math.max(0,Math.min(1,(t-p.enter+700)/700));}else{xb=Math.max(p.homeB,p.width-da);fb=xb>p.homeB?walkFrame(s.b.walk,da):s.b.arrive[0];}}}
 else if(t<p.enter+p.arrive){pose='arriving';fa=s.a.arrive[Math.min(s.a.arrive.length-1,Math.floor((t-p.enter)/260))];fb=s.b?.arrive[0];}
 else if(t<p.talkEnd){talk=p.talks.find(x=>t>=x.start&&t<x.end)||null;const step=Math.floor(t/650);
  if(!s.b){fa=reduced.matches?s.a.talk[0]:cycle(s.a.talk,step);}
  else{const aTalks=talk?.who==='A',jTalks=talk?.who==='J';fa=aTalks?cycle(s.a.talk,step):s.a.listen[0];fb=jTalks?cycle(s.b.talk,step):s.b.listen[0];}}
 else if(t<p.exit){pose='leaving';fa=(s.a.bye||s.a.leave||s.a.talk)[0];fb=s.b?.listen[0];}
 else{pose='exiting';const d=(t-p.exit)/1000*p.speed,gone=Math.max(0,1-(t-p.exit)/700);
  if(s.a.fade){fa=s.a.listen?.[0]||s.a.arrive[0];oa=gone;}else{xa=p.homeA+d;fa=walkFrame(s.a.exitWalk,d);}
  if(s.b){if(s.b.fade){fb=s.b.listen[0];ob=gone;}else{xb=p.homeB-d;fb=walkFrame(s.b.exitWalk,d);}}}
 host.dataset.pose=pose;frame(spriteA,fa);actorA.style.transform=`translate3d(${xa}px,0,0)`;actorA.style.opacity=oa;
 if(s.b){frame(spriteB,fb);actorB.style.transform=`translate3d(${xb}px,0,0)`;actorB.style.opacity=ob;}
 const key=talk?talk.who+talk.text:'';if(key!==shown){shown=key;bubble.hidden=!talk;if(talk){const n=talk.who==='J'?s.b.name:s.a.name;nameTag.textContent=n+' · '+UI[lang()].tag;phrase.textContent=talk.text;bubble.dataset.speaker=talk.who;}}
 const idx=talk?p.talks.indexOf(talk):-1;
 if(talk&&saying!==idx&&!paused()&&ZeVoice.enabled&&t-talk.start>=150)speak(idx);
 if(utterance&&idx>=0&&saying===idx&&t>talk.end-300)stretch(idx,t+300);
 if(pose==='exiting'&&utterance)stopVoice();
 raf=requestAnimationFrame(tick);}
const loaded=new Map();
function load(key){const src=ATLAS[key].src;if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>{loaded.delete(src);reject(Error('sprite'));};i.src=src;}));return loaded.get(src);}
let starting=false;
async function greet(){if(!ready||!visible||active||starting||paused())return;const now=performance.now();if(now-lastGreeting<GAP)return;
 starting=true;let next=build(nextScene());
 try{await Promise.all(next.atlases.map(load));}catch{next=build('ze');try{await Promise.all(next.atlases.map(load));}catch{starting=false;return;}}
 starting=false;if(!visible||active||paused())return;
 scene=next;lastGreeting=performance.now();progress=0;previous=0;saying=-1;shown='';active=true;clearTimeout(returnTimer);
 host.classList.add('surf-ze-active');host.classList.toggle('surf-ze-duo',!!scene.b);actorB.hidden=!scene.b;host.setAttribute('aria-hidden','false');describe();
 frame(spriteA,(scene.a.walk||scene.a.arrive)[0]);if(scene.b)frame(spriteB,(scene.b.walk||scene.b.arrive)[0]);actorA.style.opacity=scene.a.fade?0:"";actorB.style.opacity=scene.b?.fade?0:"";actorA.style.transform=actorB.style.transform='translate3d(-400px,0,0)';
 requestAnimationFrame(()=>{path=plan();if(reduced.matches)progress=path.enter+path.arrive;if(!raf)raf=requestAnimationFrame(tick);});}

const talkingNow=()=>active&&host.dataset.pose==='talking'?path.talks.findIndex(x=>progress>=x.start&&progress<x.end):-1;
window.addEventListener('ze:voice-ready',()=>{const i=talkingNow();if(i>=0&&!utterance)speak(i);else if(!active&&visible){lastGreeting=-Infinity;greet();}});
for(const actor of [actorA,actorB])actor.addEventListener('click',()=>{window.ZeTouch?.hop(actor.firstElementChild);const i=talkingNow();if(i>=0&&ZeVoice.enabled&&!utterance)speak(i);});
mount();window.addEventListener('ze:surf-render',mount);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)greet();else finish();},{rootMargin:'0px 0px -15% 0px',threshold:0}).observe(section);
Promise.all(['zeWalk','zeGreet'].map(load)).then(()=>{ready=true;host.classList.add('surf-ze-ready');if(visible)greet();}).catch(()=>host.classList.add('surf-ze-unavailable'));
document.getElementById('surf-nav').addEventListener('click',()=>{if(visible&&!active){lastGreeting=-Infinity;greet();}});
document.getElementById('language').addEventListener('change',()=>{stopVoice();relabel();shown='';});
document.getElementById('motion').addEventListener('click',()=>{if(paused())stopVoice();});
document.addEventListener('visibilitychange',()=>{previous=0;if(document.visibilityState!=='visible')stopVoice();else greet();});
window.addEventListener('pagehide',()=>{finish();clearTimeout(returnTimer);if(raf)cancelAnimationFrame(raf);});
})();

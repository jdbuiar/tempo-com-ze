/* Surf visitor: walk in with the board, greet in the middle, then walk out. */
(() => {
'use strict';
const section=document.getElementById('surf');if(!section)return;
const words={
 pt:{phrases:["Aloha, galera! Zé na área! Bora conferir o pico? Hang loose, bródi!", "Fala, surfista! Prancha na mão e olho no swell. Hang loose, bródi!", "E aí, galera do pico! Já conferiu o vento? Hang loose, bródi!", "Bora de surfe? Confere a maré antes de cair na água! Hang loose, bródi!", "Aloha! Antes da remada, dá uma olhada no período das ondas! Hang loose, bródi!", "Salve, galera! Protetor em dia e respeito no pico. Hang loose, bródi!", "Zé chegou! Se pintar trovoada, a sessão espera. Fechou, surfista? Hang loose, bródi!", "E aí, surfista! Respeita a vez da galera e curte o visual! Hang loose, bródi!", "Prancha debaixo do braço! Bora conferir as condições do pico? Hang loose, bródi!", "Fala, galera! Confere as bandeiras e troca ideia com o guarda-vidas. Aloha! Hang loose, bródi!"],listen:'Ouvir',again:'Chamar o Zé',name:'ZÉ · BOAS ONDAS',description:'Zé entra com a prancha, para no meio, faz hang loose e sai caminhando.',voice:'Voz indisponível',lang:'pt-BR'},
 es:{phrases:["¡Aloha, gente! ¡Soy Zé! ¿Miramos cómo está el spot? ¡Hang loose!", "¡Qué tal, surfista! Tabla en mano y ojo al swell. ¡Hang loose!", "¡Buenas, gente del spot! ¿Ya miraste el viento? ¡Hang loose!", "¿Vamos al surf? ¡Consulta la marea antes de entrar al agua!", "¡Aloha! Antes de remar, mira el período de las olas.", "¡Buenas, gente! Protector solar y respeto en el spot. ¡Hang loose!", "¡Llegó Zé! Si hay tormenta, la sesión espera. ¿Vale, surfista?", "¡Qué tal, surfista! Respeta los turnos y disfruta de las vistas.", "¡Tabla bajo el brazo! ¿Miramos las condiciones del spot? ¡Hang loose!", "¡Buenas, gente! Mira las banderas y consulta al socorrista. ¡Aloha!"],listen:'Escuchar',again:'Llamar a Zé',name:'ZÉ · BUENAS OLAS',description:'Zé entra con la tabla, saluda con un shaka en el centro y se va caminando.',voice:'Voz no disponible',lang:'es-ES'},
 en:{phrases:["Aloha, crew! Zé here! Let's check the surf. Hang loose!", "Hey, surfer! Board in hand, eyes on the swell. Hang loose!", "Hey, surf crew! Have you checked the wind? Hang loose!", "Heading out? Check the tide before paddling into the lineup!", "Aloha! Before paddling out, take a look at the wave period.", "Hey, crew! Sunscreen on, respect in the lineup. Good waves!", "Zé is here! Thunderstorm coming? The session can wait. Right, surfer?", "Hey, surfer! Respect the lineup and enjoy the view. Hang loose!", "Board under my arm! Let's check the conditions at the spot. Aloha!", "Hey, crew! Check the beach flags and ask the lifeguard. Aloha!"],listen:'Listen',again:'Call Zé',name:'ZÉ · GOOD WAVES',description:'Zé walks in with his surfboard, stops in the middle for a shaka greeting, then walks out.',voice:'Voice unavailable',lang:'en-US'}
};
const phraseCount=words.pt.phrases.length;
let savedLines=null;try{savedLines=JSON.parse(localStorage.getItem('ze-surf-lines-v1'));}catch{}
let currentPhrase=Number.isInteger(savedLines?.last)&&savedLines.last>=0&&savedLines.last<phraseCount?savedLines.last:-1;
let phraseOrder=Array.isArray(savedLines?.remaining)&&savedLines.remaining.every(n=>Number.isInteger(n)&&n>=0&&n<phraseCount&&n!==currentPhrase)&&new Set(savedLines.remaining).size===savedLines.remaining.length?[...savedLines.remaining]:[];
const text=()=>{const t=words[document.documentElement.lang.split('-')[0]]||words.pt;return {...t,phrase:t.phrases[Math.max(0,currentPhrase)]};};
function nextPhrase(){
 if(!phraseOrder.length){phraseOrder=Array.from({length:phraseCount},(_,i)=>i);for(let i=phraseOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[phraseOrder[i],phraseOrder[j]]=[phraseOrder[j],phraseOrder[i]];}if(phraseOrder[0]===currentPhrase)[phraseOrder[0],phraseOrder[1]]=[phraseOrder[1],phraseOrder[0]];}
 currentPhrase=phraseOrder.shift();try{localStorage.setItem('ze-surf-lines-v1',JSON.stringify({last:currentPhrase,remaining:phraseOrder}));}catch{}
}

const supported=!!window.ZeVoice?.supported;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const host=document.createElement('div');host.id='surf-ze';host.className='surf-ze-welcome';host.setAttribute('aria-hidden','true');
host.innerHTML='<div class="surf-ze-actor" role="img"><div class="surf-ze-sprite" aria-hidden="true"></div></div><div class="surf-ze-bubble" hidden><span class="surf-ze-name"></span><p class="surf-ze-phrase" aria-live="polite"></p><span class="ze-sound-hint" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="w1" d="M16 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="w2" d="M18.5 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></div>';
const actor=host.querySelector('.surf-ze-actor'),sprite=host.querySelector('.surf-ze-sprite'),bubble=host.querySelector('.surf-ze-bubble'),phrase=host.querySelector('.surf-ze-phrase');
let ready=false,visible=false,hasGreeted=false,lastGreeting=-Infinity,progress=0,previous=0,active=false,raf=0,utterance=null,serial=0,voiceAttempted=false,path=null,returnTimer=0;
const paused=()=>document.body.classList.contains('paused')||document.visibilityState!=='visible';
function translate(){const t=text();phrase.textContent=t.phrase;host.querySelector('.surf-ze-name').textContent=t.name;actor.setAttribute('aria-label',t.description);}
function mount(){const heading=section.querySelector('.section-heading');if(heading&&host.parentElement!==section)heading.after(host);translate();}
function frame(atlas,index){const walk=atlas==='walk';sprite.classList.toggle('surf-ze-walking',walk);sprite.style.backgroundPosition=walk?`${index%5*25}% ${index<5?0:100}%`:(index*50)+'% 0%';sprite.dataset.frame=String(index);sprite.dataset.atlas=atlas;}
function stopVoice(){serial++;if(utterance&&supported)ZeVoice.cancel();utterance=null;}
function retimeExit(at){if(!path)return;path.exit=Math.max(at,path.enter+1800);path.end=path.exit+(path.width-path.home+path.size*.1)/path.speed*1000;}
function speak(){if(!supported||!visible||host.dataset.pose!=='greeting'||document.visibilityState!=='visible')return;stopVoice();const t=text(),id=serial;utterance=ZeVoice.utterance(t.phrase);utterance.lang=t.lang;utterance.volume=.85;
 utterance.onend=()=>{if(id===serial){utterance=null;if(active)retimeExit(progress+650);}};
 utterance.onerror=event=>{if(id===serial){utterance=null;if(event.error==='not-allowed')voiceAttempted=false;if(active)retimeExit(Math.max(progress+650,path.enter+3500));}};
 ZeVoice.speak(utterance);}

function makePath(){const size=actor.offsetWidth,width=host.clientWidth,home=(width-size)/2,start=-size,speed=size*.8,enter=(home-start)/speed*1000,hold=6300,exit=enter+hold,end=exit+(width-home+size*.1)/speed*1000;return {size,width,home,start,speed,enter,exit,end,stride:size*.74};}
function finish(){active=false;previous=0;stopVoice();bubble.hidden=true;host.classList.remove('surf-ze-active');host.dataset.pose='waiting';host.setAttribute('aria-hidden','true');}
function tick(now){raf=0;if(!active)return;const delta=previous?Math.max(0,now-previous):0;previous=now;if(!visible){finish();return;}if(!paused())progress+=delta;if(utterance&&progress>=path.enter&&progress>=path.exit-700)retimeExit(progress+750);if(progress>=path.end||(reduced.matches&&progress>=path.exit)){finish();return;}
 let x=path.home,atlas='greeting',index=0,pose='greeting';
 if(progress<path.enter){pose='entering';x=path.start+progress/1000*path.speed;atlas='walk';index=AquaWalkMotion.frameForDistance(x-path.start,path.stride);}
 else if(progress>=path.exit){pose='exiting';x=path.home+(progress-path.exit)/1000*path.speed;atlas='walk';index=AquaWalkMotion.frameForDistance(path.home-path.start+x-path.home,path.stride);}
 else{const talk=progress-path.enter;index=reduced.matches?2:talk<350?0:talk<650?1:progress<path.exit-650?2:progress<path.exit-350?1:0;if(!voiceAttempted&&!paused()&&ZeVoice.enabled&&talk>=650){voiceAttempted=true;if(ZeVoice.enabled)speakAfterFrame=true;}}
 host.dataset.pose=pose;frame(atlas,index);bubble.hidden=pose!=='greeting';actor.style.transform=`translate3d(${x}px,0,0)`;if(pose==='exiting'&&utterance)stopVoice();if(speakAfterFrame){speakAfterFrame=false;speak();}raf=requestAnimationFrame(tick);}
let speakAfterFrame=false;
function greet(){if(!ready||!visible||active||paused())return;const now=performance.now();if(hasGreeted&&now-lastGreeting<180000)return;nextPhrase();translate();hasGreeted=true;lastGreeting=now;progress=0;previous=0;voiceAttempted=false;active=true;clearTimeout(returnTimer);returnTimer=setTimeout(greet,180000);host.classList.add('surf-ze-active');host.setAttribute('aria-hidden','false');path=makePath();if(reduced.matches){progress=path.enter;actor.style.transform=`translate3d(${path.home}px,0,0)`;}if(!raf)raf=requestAnimationFrame(tick);}
window.addEventListener('ze:voice-ready',()=>{translate();if(active&&host.dataset.pose==='greeting'&&!utterance){voiceAttempted=true;speak();}else if(!active&&visible){if(!voiceAttempted)hasGreeted=false;greet();}});
actor.addEventListener('click',()=>{window.ZeTouch?.hop(sprite);if(ZeVoice.enabled&&active&&host.dataset.pose==='greeting'&&!utterance)speak();});
mount();window.addEventListener('ze:surf-render',mount);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)greet();else finish();},{rootMargin:'0px 0px -15% 0px',threshold:0}).observe(section);
Promise.all(['assets/ze-surf-greeting.webp','assets/ze-surf-walk-10.webp'].map(src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=src;}))).then(()=>{ready=true;host.classList.add('surf-ze-ready');if(visible)greet();}).catch(()=>{host.classList.add('surf-ze-unavailable');});
document.getElementById('surf-nav').addEventListener('click',()=>{if(visible)greet();});
document.getElementById('language').addEventListener('change',()=>{stopVoice();translate();});
document.getElementById('motion').addEventListener('click',()=>{if(paused())stopVoice();});
document.addEventListener('visibilitychange',()=>{previous=0;if(document.visibilityState!=='visible')stopVoice();else greet();});window.addEventListener('pagehide',()=>{finish();clearTimeout(returnTimer);if(raf)cancelAnimationFrame(raf);});
})();

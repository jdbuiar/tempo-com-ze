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
 duoBrisa:{src:'assets/surf-duo-brisa.webp',cols:12,rows:4}
};
/* Each actor: walk cycle, arrival poses, talk loop and exit walk, as [atlas,index] frames. */
const seq=(atlas,list)=>list.map(i=>[atlas,i]);
const ACTOR={
 ze:{name:'ZÉ',walk:seq('zeWalk',[0,1,2,3,4,5,6,7,8,9]),arrive:seq('zeGreet',[0,1]),talk:seq('zeGreet',[2]),exitWalk:seq('zeWalk',[0,1,2,3,4,5,6,7,8,9])},
 niko:{name:'NIKO',walk:seq('niko',[0,1,2,3,4,5,6,7,8,9]),arrive:seq('niko',[10,11,12,12]),talk:seq('niko',[13,14,16,17,18,15]),bye:seq('niko',[19]),exitWalk:seq('niko',[20,21,22,23])},
 brisa:{name:'BRISA',walk:seq('brisa',[0,1,2,3,4,5,6,7]),arrive:seq('brisa',[8,9,18,19]),talk:seq('brisa',[20,21,22,23,21]),leave:seq('brisa',[18]),exitWalk:seq('brisa',[0,1,2,3,4,5,6,7])}
};
const duoActor=(atlas,name,row,jorge)=>{const o=(jorge?6:0)+row*12;return {name,walk:seq(atlas,[o,o+1,o+5]),arrive:seq(atlas,[jorge?o+4:o+2]),listen:seq(atlas,[o+4]),talk:seq(atlas,jorge?[o+2,o+3]:[o+3,o+2]),exitWalk:seq(atlas,[o,o+1,o+5])};};

/* Jorge's outfit (and Zé's street clothes) follow the sky shown on the main forecast. */
function weatherRow(){const v=document.querySelector('[data-variant]')?.dataset.variant;return v==='sunny'?3:['rain','drizzle','storm'].includes(v)?1:v==='cold'?2:0;}
const WEATHER=['mild','rain','cold','hot'];

/* ---------- Lines ---------- */
const ZE_LINES={
 pt:["Aloha, galera! Zé na área! Bora conferir o pico? Hang loose, bródi!", "Fala, surfista! Prancha na mão e olho no swell. Hang loose, bródi!", "E aí, galera do pico! Já conferiu o vento? Hang loose, bródi!", "Bora de surfe? Confere a maré antes de cair na água! Hang loose, bródi!", "Aloha! Antes da remada, dá uma olhada no período das ondas! Hang loose, bródi!", "Salve, galera! Protetor em dia e respeito no pico. Hang loose, bródi!", "Zé chegou! Se pintar trovoada, a sessão espera. Fechou, surfista? Hang loose, bródi!", "E aí, surfista! Respeita a vez da galera e curte o visual! Hang loose, bródi!", "Prancha debaixo do braço! Bora conferir as condições do pico? Hang loose, bródi!", "Fala, galera! Confere as bandeiras e troca ideia com o guarda-vidas. Aloha! Hang loose, bródi!"],
 es:["¡Aloha, gente! ¡Soy Zé! ¿Miramos cómo está el spot? ¡Hang loose!", "¡Qué tal, surfista! Tabla en mano y ojo al swell. ¡Hang loose!", "¡Buenas, gente del spot! ¿Ya miraste el viento? ¡Hang loose!", "¿Vamos al surf? ¡Consulta la marea antes de entrar al agua!", "¡Aloha! Antes de remar, mira el período de las olas.", "¡Buenas, gente! Protector solar y respeto en el spot. ¡Hang loose!", "¡Llegó Zé! Si hay tormenta, la sesión espera. ¿Vale, surfista?", "¡Qué tal, surfista! Respeta los turnos y disfruta de las vistas.", "¡Tabla bajo el brazo! ¿Miramos las condiciones del spot? ¡Hang loose!", "¡Buenas, gente! Mira las banderas y consulta al socorrista. ¡Aloha!"],
 en:["Aloha, crew! Zé here! Let's check the surf. Hang loose!", "Hey, surfer! Board in hand, eyes on the swell. Hang loose!", "Hey, surf crew! Have you checked the wind? Hang loose!", "Heading out? Check the tide before paddling into the lineup!", "Aloha! Before paddling out, take a look at the wave period.", "Hey, crew! Sunscreen on, respect in the lineup. Good waves!", "Zé is here! Thunderstorm coming? The session can wait. Right, surfer?", "Hey, surfer! Respect the lineup and enjoy the view. Hang loose!", "Board under my arm! Let's check the conditions at the spot. Aloha!", "Hey, crew! Check the beach flags and ask the lifeguard. Aloha!"]
};
const SOLO_LINES={
 niko:{
  pt:[["Aloha! Eu sou o Niko. O mar tá chamando, hein?","Confere o vento antes de remar. Hang loose!"],["E aí, galera! Niko na área.","Maré enchendo e prancha encerada. Bora!"],["Fala, surfista! Hoje é dia de remar bastante.","Respeita a vez no pico e boa sessão!"],["Opa! Já olhou o período das ondas?","Período longo é onda com mais força. Fica esperto!"],["Salve! Primeiro eu observo o mar uns minutos.","Depois escolho o canal pra entrar. Hang loose!"]],
  es:[["¡Aloha! Soy Niko. El mar está llamando, ¿eh?","Mira el viento antes de remar. ¡Hang loose!"],["¡Qué tal, gente! Llegó Niko.","Marea subiendo y tabla encerada. ¡Vamos!"],["¡Hola, surfista! Hoy toca remar mucho.","¡Respeta los turnos en el pico y buena sesión!"],["¡Ey! ¿Ya miraste el período de las olas?","Período largo, ola con más fuerza. ¡Atento!"],["¡Buenas! Primero miro el mar unos minutos.","Después elijo el canal para entrar. ¡Hang loose!"]],
  en:[["Aloha! I'm Niko. The ocean is calling, huh?","Check the wind before you paddle out. Hang loose!"],["Hey, crew! Niko is here.","Rising tide and a waxed board. Let's go!"],["Hey, surfer! Lots of paddling today.","Respect the lineup and have a great session!"],["Hey! Did you check the wave period?","Longer period means stronger waves. Stay sharp!"],["Hi! First I watch the sea for a few minutes.","Then I pick the channel to paddle out. Hang loose!"]]
 },
 brisa:{
  pt:[["Oi, gente! Eu sou a Brisa.","Bora pegar uma onda?"],["Protetor no rosto e parafina na prancha.","Agora é só cair na água!"],["Olha a bandeira antes de entrar, tá?","Vermelha é dia de ficar na areia."],["Vento terral deixa a onda lisinha.","Hoje eu quero pegar várias!"],["Prancha na mão e leash no pé.","Bora pegar uma onda?"]],
  es:[["¡Hola, gente! Soy Brisa.","¿Vamos a agarrar una ola?"],["Protector en la cara y parafina en la tabla.","¡Ahora, al agua!"],["Mira la bandera antes de entrar, ¿vale?","Roja es día de quedarse en la arena."],["El viento de tierra deja la ola lisita.","¡Hoy quiero agarrar varias!"],["Tabla en la mano e invento en el pie.","¿Vamos a agarrar una ola?"]],
  en:[["Hi, everyone! I'm Brisa.","Shall we catch a wave?"],["Sunscreen on my face and wax on my board.","Now let's hit the water!"],["Check the flag before you go in, okay?","Red means a day on the sand."],["Offshore wind makes the waves so smooth.","I want to catch a bunch today!"],["Board in hand and leash on.","Shall we catch a wave?"]]
 }
};
/* Duo chats: each line is [speaker, text]; A is Zé, Niko or Brisa, J is Jorge. {A} becomes the partner's name. */
const SURF_CHATS={
 pt:{
  mild:[[['J','Fala, {A}! Tudo certo?'],['A','Tudo! Tô indo ver como tá o mar.'],['J','Vento fraco hoje, deve estar bom.'],['A','Então até mais, Jorge!']],[['A','E aí, Jorge! Vai cair hoje?'],['J','Hoje só vou caminhar na areia.'],['A','Tempo bom pra isso!'],['J','Boas ondas, {A}!']]],
  rain:[[['J','Ô, {A}, com essa chuva?'],['A','Chuva fraca não atrapalha a onda.'],['J','Mas se trovejar, sai da água, hein!'],['A','Pode deixar, Jorge!']],[['A','Jorge, de capa amarela!'],['J','Em dia de chuva eu não saio sem ela.'],['A','Faz bem. Molhado eu já vou ficar!'],['J','Cuidado aí e boas ondas!']]],
  cold:[[['J','Brrr! Que frio, {A}!'],['A','Por isso eu vou de roupa de borracha.'],['J','A água deve estar gelada!'],['A','Gelada, mas a onda tá boa!']],[['A','Jorge, de cachecol e tudo!'],['J','Com esse vento frio, nem penso em entrar.'],['A','Eu vou rapidinho e depois tomo um chocolate quente!'],['J','Boa ideia! Até mais!']]],
  hot:[[['J','Calorão, hein, {A}!'],['A','Dia perfeito pra cair na água!'],['J','Passou protetor?'],['A','Passei! E vou beber bastante água também.']],[['A','Jorge! Também vai pro mar?'],['J','Vou dar um mergulho pra refrescar.'],['A','Entra perto do guarda-vidas, tá?'],['J','Combinado. Boas ondas!']]]
 },
 es:{
  mild:[[['J','¡Hola, {A}! ¿Todo bien?'],['A','¡Todo! Voy a ver cómo está el mar.'],['J','Hoy hay poco viento, debe estar bueno.'],['A','¡Hasta luego, Jorge!']],[['A','¡Ey, Jorge! ¿Hoy entras al agua?'],['J','Hoy solo voy a caminar por la arena.'],['A','¡Buen tiempo para eso!'],['J','¡Buenas olas, {A}!']]],
  rain:[[['J','Oye, {A}, ¿con esta lluvia?'],['A','La lluvia débil no arruina la ola.'],['J','Pero si truena, ¡sal del agua!'],['A','¡Claro, Jorge!']],[['A','¡Jorge, con impermeable amarillo!'],['J','Los días de lluvia no salgo sin él.'],['A','Haces bien. ¡Yo me voy a mojar igual!'],['J','¡Cuidado y buenas olas!']]],
  cold:[[['J','¡Brrr! ¡Qué frío, {A}!'],['A','Por eso voy con traje de neopreno.'],['J','¡El agua debe estar helada!'],['A','¡Helada, pero la ola está buena!']],[['A','¡Jorge, con bufanda y todo!'],['J','Con este viento frío, ni pienso en entrar.'],['A','¡Yo voy un ratito y después un chocolate caliente!'],['J','¡Buena idea! ¡Hasta luego!']]],
  hot:[[['J','¡Qué calor, {A}!'],['A','¡Día perfecto para meterse al agua!'],['J','¿Te pusiste protector?'],['A','¡Sí! Y voy a tomar mucha agua también.']],[['A','¡Jorge! ¿También vas al mar?'],['J','Voy a darme un chapuzón para refrescarme.'],['A','Entra cerca del socorrista, ¿vale?'],['J','Hecho. ¡Buenas olas!']]]
 },
 en:{
  mild:[[['J','Hey, {A}! All good?'],['A','All good! Going to check the surf.'],['J','Light wind today, should be nice.'],['A','See you later, Jorge!']],[['A','Hey, Jorge! Paddling out today?'],['J','Just a walk on the sand today.'],['A','Great weather for it!'],['J','Good waves, {A}!']]],
  rain:[[['J','Hey, {A}, in this rain?'],['A','Light rain doesn\'t ruin the waves.'],['J','But if it thunders, get out of the water!'],['A','Will do, Jorge!']],[['A','Jorge, rocking the yellow raincoat!'],['J','I never go out without it when it rains.'],['A','Smart. I\'m getting wet anyway!'],['J','Take care and good waves!']]],
  cold:[[['J','Brrr! So cold, {A}!'],['A','That\'s why I\'m wearing a wetsuit.'],['J','The water must be freezing!'],['A','Freezing, but the waves are good!']],[['A','Jorge, scarf and all!'],['J','With this cold wind, I\'m staying dry.'],['A','Just a quick session, then hot chocolate!'],['J','Good plan! See you!']]],
  hot:[[['J','So hot today, {A}!'],['A','Perfect day to hit the water!'],['J','Got your sunscreen on?'],['A','Yes! And I\'m drinking lots of water too.']],[['A','Jorge! Heading to the sea too?'],['J','Just a dip to cool off.'],['A','Swim near the lifeguard, okay?'],['J','Deal. Good waves!']]]
 }
};
/* Zé is in street clothes in his chats with Jorge: he came to look at the sea, not to surf. */
const ZE_CHATS={
 pt:{mild:[[['J','Fala, Zé! Indo pra praia?'],['A','Só ver o mar e como tá o tempo.'],['J','Tá agradável hoje, né?'],['A','Tá ótimo! Até mais, Jorge!']]],rain:[[['A','Jorge! Também de capa?'],['J','Com essa chuva, não tem jeito.'],['A','Se trovejar, ninguém fica na água, hein!'],['J','Isso aí, Zé. Até mais!']]],cold:[[['J','Zé, que frio, hein!'],['A','Hoje é dia de ver o mar de casaco.'],['J','E de tomar um café quentinho depois!'],['A','Boa! Até mais, Jorge!']]],hot:[[['A','Calorão, Jorge!'],['J','Bom demais pra um mergulho!'],['A','Protetor e muita água, combinado?'],['J','Combinado, Zé! Valeu!']]]},
 es:{mild:[[['J','¡Hola, Zé! ¿Vas a la playa?'],['A','Solo a ver el mar y cómo está el tiempo.'],['J','Hoy está agradable, ¿no?'],['A','¡Está genial! Hasta luego, Jorge.']]],rain:[[['A','¡Jorge! ¿Tú también con impermeable?'],['J','Con esta lluvia, no queda otra.'],['A','Si truena, nadie se queda en el agua, ¿eh?'],['J','Así es, Zé. ¡Hasta luego!']]],cold:[[['J','¡Zé, qué frío!'],['A','Hoy toca ver el mar con abrigo.'],['J','¡Y tomar un café calentito después!'],['A','¡Buena idea! Hasta luego, Jorge.']]],hot:[[['A','¡Qué calor, Jorge!'],['J','¡Perfecto para un chapuzón!'],['A','Protector y mucha agua, ¿vale?'],['J','¡Hecho, Zé! ¡Gracias!']]]},
 en:{mild:[[['J','Hey, Zé! Off to the beach?'],['A','Just checking the sea and the weather.'],['J','Nice day today, right?'],['A','Lovely! See you, Jorge!']]],rain:[[['A','Jorge! Raincoat too?'],['J','In this rain, no choice.'],['A','If it thunders, everybody out of the water!'],['J','That\'s right, Zé. See you!']]],cold:[[['J','Zé, so cold!'],['A','A coat day for looking at the sea.'],['J','And a hot coffee afterwards!'],['A','Good one! See you, Jorge!']]],hot:[[['A','So hot, Jorge!'],['J','Perfect for a dip!'],['A','Sunscreen and plenty of water, deal?'],['J','Deal, Zé! Thanks!']]]}
};
const UI={pt:{tag:'BOAS ONDAS',describe:n=>n+' na praia, perto da seção de surfe.'},es:{tag:'BUENAS OLAS',describe:n=>n+' en la playa, junto a la sección de surf.'},en:{tag:'GOOD WAVES',describe:n=>n+' on the beach, by the surf section.'}};

/* ---------- Scene order (shuffled, remembered) ---------- */
const SCENES=['ze','niko','brisa','duoZe','duoNiko','duoBrisa'];
const store=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
function pickIndex(key,count){const s=store(key,{});let last=Number.isInteger(s.last)?s.last:-1,left=Array.isArray(s.left)?s.left.filter(n=>Number.isInteger(n)&&n>=0&&n<count&&n!==last):[];
 if(!left.length){left=Array.from({length:count},(_,i)=>i);for(let i=left.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[left[i],left[j]]=[left[j],left[i]];}if(count>1&&left[0]===last)left.push(left.shift());}
 last=left.shift();save(key,{last,left});return last;}
/* a new visitor at most once a minute while the surf section stays on screen */
const GAP=60000;
function nextScene(){return SCENES[pickIndex('ze-surf-scenes-v1',SCENES.length)];}

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
 if(id==='niko'||id==='brisa'){const pool=SOLO_LINES[id][l],i=pickIndex('ze-surf-'+id+'-v1',pool.length);return {id,a:ACTOR[id],lines:pool[i].map(t=>['A',t]),line:i,atlases:[id]};}
 const who=id==='duoZe'?'ze':id==='duoNiko'?'niko':'brisa',atlas=id;
 const chats=(who==='ze'?ZE_CHATS:SURF_CHATS)[l][w],i=pickIndex('ze-surf-'+id+'-'+w+'-v1',chats.length);
 return {id,who,row,weather:w,line:i,a:duoActor(atlas,ACTOR[who].name,row,false),b:duoActor(atlas,'JORGE',row,true),lines:chats[i].map(([s,t])=>[s,t.replace('{A}',ACTOR[who].name[0]+ACTOR[who].name.slice(1).toLowerCase())]),atlases:[atlas]};
}
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
 const speed=size*(duo?.62:.8),enter=Math.max((homeA+size)/speed,duo?(width-homeB)/speed:0)*1000;
 const arrive=(s.a.arrive.length*260);
 const talks=[];let t=enter+arrive;for(const [who,text] of s.lines){const d=lineTime(text);talks.push({who,text,start:t,end:t+d});t+=d+280;}
 const exit=t+(s.a.bye?650:s.a.leave?300:0);
 const outA=(width-homeA+size*.2)/speed*1000,outB=duo?(homeB+size*1.1)/speed*1000:0;
 return {size,width,homeA,homeB,speed,enter,arrive,talks,talkEnd:t,exit,end:exit+Math.max(outA,outB)};
}
let ready=false,visible=false,lastGreeting=-Infinity,progress=0,previous=0,active=false,raf=0,utterance=null,serial=0,path=null,returnTimer=0,spoke=false,shown='';
function stopVoice(){serial++;if(utterance&&supported)ZeVoice.cancel();utterance=null;}
function speak(){if(!supported||!visible||!scene?.voice||document.visibilityState!=='visible')return;stopVoice();const id=serial,text=scene.lines[0][1];utterance=ZeVoice.utterance(text);utterance.lang=lang()==='pt'?'pt-BR':lang()==='es'?'es-ES':'en-US';utterance.volume=.85;
 /* recorded voice decides how long Zé stays */
 utterance.onend=()=>{if(id===serial){utterance=null;if(active)stretch(progress+650);}};
 utterance.onerror=()=>{if(id===serial)utterance=null;};
 ZeVoice.speak(utterance);}
function stretch(at){const p=path,talk=p.talks[0];if(!talk||at<=talk.end)return;const extra=at-talk.end;talk.end+=extra;p.talkEnd+=extra;p.exit+=extra;p.end+=extra;}
function finish(){if(active&&visible){clearTimeout(returnTimer);returnTimer=setTimeout(greet,GAP);}active=false;previous=0;stopVoice();bubble.hidden=true;shown='';host.classList.remove('surf-ze-active','surf-ze-duo');actorB.hidden=true;host.dataset.pose='waiting';host.setAttribute('aria-hidden','true');}
/* gait follows distance: long cycles span one stride, short ones change every ~18% of the body size */
function walkFrame(list,distance){const step=list.length>=8?path.size*.74/list.length:path.size*.18;return cycle(list,Math.floor(Math.max(0,distance)/step));}
function tick(now){raf=0;if(!active)return;const delta=previous?Math.max(0,now-previous):0;previous=now;if(!visible){finish();return;}if(!paused())progress+=delta;
 const p=path,s=scene,t=progress;if(t>=p.end||(reduced.matches&&t>=p.talkEnd)){finish();return;}
 let xa=p.homeA,xb=p.homeB,fa,fb,pose='talking',talk=null;
 if(t<p.enter){pose='entering';const da=t/1000*p.speed;xa=Math.min(p.homeA,-p.size+da);fa=xa<p.homeA?walkFrame(s.a.walk,da):s.a.arrive[0];
  if(s.b){xb=Math.max(p.homeB,p.width-da);fb=xb>p.homeB?walkFrame(s.b.walk,da):s.b.arrive[0];}}
 else if(t<p.enter+p.arrive){pose='arriving';fa=s.a.arrive[Math.min(s.a.arrive.length-1,Math.floor((t-p.enter)/260))];fb=s.b?.arrive[0];}
 else if(t<p.talkEnd){talk=p.talks.find(x=>t>=x.start&&t<x.end)||null;const step=Math.floor(t/650);
  if(!s.b){fa=reduced.matches?s.a.talk[0]:cycle(s.a.talk,step);}
  else{const aTalks=talk?.who==='A',jTalks=talk?.who==='J';fa=aTalks?cycle(s.a.talk,step):s.a.listen[0];fb=jTalks?cycle(s.b.talk,step):s.b.listen[0];}}
 else if(t<p.exit){pose='leaving';fa=(s.a.bye||s.a.leave||s.a.talk)[0];fb=s.b?.listen[0];}
 else{pose='exiting';const d=(t-p.exit)/1000*p.speed;xa=p.homeA+d;fa=walkFrame(s.a.exitWalk,d);if(s.b){xb=p.homeB-d;fb=walkFrame(s.b.exitWalk,d);}}
 host.dataset.pose=pose;frame(spriteA,fa);actorA.style.transform=`translate3d(${xa}px,0,0)`;
 if(s.b){frame(spriteB,fb);actorB.style.transform=`translate3d(${xb}px,0,0)`;}
 const key=talk?talk.who+talk.text:'';if(key!==shown){shown=key;bubble.hidden=!talk;if(talk){const n=talk.who==='J'?s.b.name:s.a.name;nameTag.textContent=n+' · '+UI[lang()].tag;phrase.textContent=talk.text;bubble.dataset.speaker=talk.who;}}
 if(s.voice&&talk&&!spoke&&!paused()&&ZeVoice.enabled&&t-talk.start>=200){spoke=true;speak();}
 if(pose==='exiting'&&utterance)stopVoice();
 raf=requestAnimationFrame(tick);}
const loaded=new Map();
function load(key){const src=ATLAS[key].src;if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>{loaded.delete(src);reject(Error('sprite'));};i.src=src;}));return loaded.get(src);}
let starting=false;
async function greet(){if(!ready||!visible||active||starting||paused())return;const now=performance.now();if(now-lastGreeting<GAP)return;
 starting=true;let next=build(nextScene());
 try{await Promise.all(next.atlases.map(load));}catch{next=build('ze');try{await Promise.all(next.atlases.map(load));}catch{starting=false;return;}}
 starting=false;if(!visible||active||paused())return;
 scene=next;lastGreeting=performance.now();progress=0;previous=0;spoke=false;shown='';active=true;clearTimeout(returnTimer);
 host.classList.add('surf-ze-active');host.classList.toggle('surf-ze-duo',!!scene.b);actorB.hidden=!scene.b;host.setAttribute('aria-hidden','false');describe();
 frame(spriteA,scene.a.walk[0]);if(scene.b)frame(spriteB,scene.b.walk[0]);actorA.style.transform=actorB.style.transform='translate3d(-400px,0,0)';
 requestAnimationFrame(()=>{path=plan();if(reduced.matches)progress=path.enter+path.arrive;if(!raf)raf=requestAnimationFrame(tick);});}

window.addEventListener('ze:voice-ready',()=>{if(active&&scene?.voice&&!utterance&&!spoke&&host.dataset.pose==='talking'){spoke=true;speak();}else if(!active&&visible){lastGreeting=-Infinity;greet();}});
for(const actor of [actorA,actorB])actor.addEventListener('click',()=>{window.ZeTouch?.hop(actor.firstElementChild);if(scene?.voice&&ZeVoice.enabled&&active&&!utterance&&host.dataset.pose==='talking')speak();});
mount();window.addEventListener('ze:surf-render',mount);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)greet();else finish();},{rootMargin:'0px 0px -15% 0px',threshold:0}).observe(section);
Promise.all(['zeWalk','zeGreet'].map(load)).then(()=>{ready=true;host.classList.add('surf-ze-ready');if(visible)greet();}).catch(()=>host.classList.add('surf-ze-unavailable'));
document.getElementById('surf-nav').addEventListener('click',()=>{if(visible&&!active){lastGreeting=-Infinity;greet();}});
document.getElementById('language').addEventListener('change',()=>{stopVoice();relabel();shown='';});
document.getElementById('motion').addEventListener('click',()=>{if(paused())stopVoice();});
document.addEventListener('visibilitychange',()=>{previous=0;if(document.visibilityState!=='visible')stopVoice();else greet();});
window.addEventListener('pagehide',()=>{finish();clearTimeout(returnTimer);if(raf)cancelAnimationFrame(raf);});
})();

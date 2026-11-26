/* Rain sound: a rain loop while it is raining where the visitor is looking, like the phone weather apps.
   Four sounds follow the rain level app.js draws (#rain data-level): drizzle, light rain, heavy rain, storm with thunder.
   Changing level crossfades between them. Quiet when the tab is hidden, softer while Zé speaks,
   and a speaker button in the main card turns it off (remembered). */
(()=>{
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
const FILES=[null,'garoa','chuva-fraca','chuva-forte','tempestade'];
const LEVEL_GAIN=[0,.16,.24,.34,.55];
const TXT={pt:['Desligar som da chuva','Ligar som da chuva'],es:['Apagar sonido de lluvia','Encender sonido de lluvia'],en:['Turn rain sound off','Turn rain sound on']};
let ctx=null,master=null,playing=null,level=0,duck=1,serial=0;const buffers={},loads={};
let on=true;try{on=JSON.parse(localStorage.getItem('aqua-rain-sound'))!==false}catch{}
const btn=document.getElementById('rain-sound');
const lang=()=>{try{return TXT[language]?language:'pt'}catch{return 'pt'}};

function paint(){if(!btn)return;btn.hidden=!level;btn.textContent=on?'🔊':'🔇';btn.setAttribute('aria-pressed',String(on));const label=TXT[lang()][on?0:1];btn.title=label;btn.setAttribute('aria-label',label)}
const audible=()=>on&&level>0&&document.visibilityState==='visible';
/* The mp3 may carry encoder silence at the ends: loop only the part with sound so the seam is not heard. */
function edges(b){const d=b.getChannelData(0);let s=0,e=d.length-1;while(s<e&&Math.abs(d[s])<1e-3)s++;while(e>s&&Math.abs(d[e])<1e-3)e--;return [s/b.sampleRate,(e+1)/b.sampleRate]}
function load(l){if(buffers[l])return Promise.resolve(buffers[l]);if(!loads[l])loads[l]=fetch(`assets/sons/${FILES[l]}.mp3?v=2`).then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer()}).then(a=>new Promise((ok,er)=>ctx.decodeAudioData(a,ok,er))).then(b=>buffers[l]=b).catch(e=>{delete loads[l];throw e});return loads[l]}
function fade(node,to,secs){const now=ctx.currentTime;node.gain.cancelScheduledValues(now);node.gain.setValueAtTime(node.gain.value,now);node.gain.linearRampToValueAtTime(to,now+secs)}
function release(p,secs){if(!p)return;fade(p.gain,0,secs);setTimeout(()=>{try{p.src.stop()}catch{}p.src.disconnect();p.gain.disconnect()},secs*1000+150)}
function startLevel(l){const b=buffers[l],[a,e]=edges(b),src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=b;src.loop=true;src.loopStart=a;src.loopEnd=e;g.gain.value=0;src.connect(g).connect(master);src.start(0,a+Math.random()*(e-a-1));fade(g,LEVEL_GAIN[l],1.8);return {level:l,src,gain:g}}
async function apply(){
 paint();const id=++serial;
 if(!audible()){if(playing){release(playing,.9);playing=null}if(ctx&&ctx.state==='running')setTimeout(()=>{if(!playing&&ctx.state==='running')ctx.suspend().catch(()=>{})},1200);return}
 if(!ctx){try{ctx=new AC();master=ctx.createGain();master.connect(ctx.destination)}catch{ctx=null;return}}
 if(ctx.state!=='running'){try{await ctx.resume()}catch{}}
 if(id!==serial||ctx.state!=='running')return;
 fade(master,duck,.5);
 const l=level;if(playing?.level===l)return;
 try{await load(l)}catch{return}
 if(id!==serial||!audible()||level!==l||playing?.level===l)return;
 release(playing,2);playing=startLevel(l);
 /* the next level up is the likeliest change: have it ready */
 if(FILES[l+1])load(l+1).catch(()=>{});
}
function readLevel(){const v=Number(document.getElementById('rain')?.dataset.level)||0;if(v!==level){level=v;apply()}else paint()}
window.addEventListener('aqua:weather',readLevel);
document.addEventListener('visibilitychange',apply);
/* Browsers only allow sound after a touch or click: try again on the visitor's first one. */
const unlock=e=>{if(e.isTrusted&&audible()&&(!ctx||ctx.state!=='running'||!playing))apply()};
for(const ev of ['pointerup','touchend','click','keydown'])document.addEventListener(ev,unlock,{capture:true,passive:true});
btn?.addEventListener('click',()=>{on=!on;try{localStorage.setItem('aqua-rain-sound',JSON.stringify(on))}catch{}apply()});
document.getElementById('language')?.addEventListener('change',paint);
/* Zé's voice comes first: the rain gets quieter while he talks. */
const voice=document.getElementById('ze-voice-player');
const setDuck=v=>{if(duck===v)return;duck=v;if(ctx&&master&&ctx.state==='running')fade(master,duck,.4)};
if(voice){voice.addEventListener('playing',()=>setDuck(.35));for(const ev of ['ended','pause','error'])voice.addEventListener(ev,()=>setDuck(1))}
readLevel();
})();

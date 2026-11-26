/* Rain sound: a soft rain loop while it is raining where the visitor is looking, like the phone weather apps.
   Follows the rain level app.js draws (#rain data-level), fades in and out, goes quiet when the tab is hidden,
   gets quieter while Zé speaks, and has a speaker button in the main card to turn it off (remembered). */
(()=>{
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
const SRC='assets/sons/chuva-fraca.mp3?v=1';
const LEVEL_GAIN=[0,.22,.34,.48,.58];
const TXT={pt:['Desligar som da chuva','Ligar som da chuva'],es:['Apagar sonido de lluvia','Encender sonido de lluvia'],en:['Turn rain sound off','Turn rain sound on']};
let ctx=null,gain=null,buffer=null,loading=null,source=null,level=0,duck=1;
let on=true;try{on=JSON.parse(localStorage.getItem('aqua-rain-sound'))!==false}catch{}
const btn=document.getElementById('rain-sound');
const lang=()=>{try{return TXT[language]?language:'pt'}catch{return 'pt'}};

function paint(){if(!btn)return;btn.hidden=!level;btn.textContent=on?'🔊':'🔇';btn.setAttribute('aria-pressed',String(on));const label=TXT[lang()][on?0:1];btn.title=label;btn.setAttribute('aria-label',label)}
function target(){return on&&level&&document.visibilityState==='visible'?LEVEL_GAIN[level]*duck:0}
/* The mp3 has encoder silence at both ends: loop only the part with sound so the seam is not heard. */
function edges(b){const d=b.getChannelData(0);let s=0,e=d.length-1;while(s<e&&Math.abs(d[s])<1e-3)s++;while(e>s&&Math.abs(d[e])<1e-3)e--;return [s/b.sampleRate,(e+1)/b.sampleRate]}
function load(){if(!loading)loading=fetch(SRC).then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer()}).then(a=>new Promise((ok,er)=>ctx.decodeAudioData(a,ok,er))).then(b=>{buffer=b;return b}).catch(e=>{loading=null;throw e});return loading}
function start(){if(source||!buffer)return;const [a,b]=edges(buffer);source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.loopStart=a;source.loopEnd=b;source.connect(gain);source.start(0,a+Math.random()*(b-a-1))}
function stop(){if(!source)return;const s=source;source=null;try{s.stop()}catch{}s.disconnect()}
let stopTimer=null;
async function apply(){
 paint();const g=target();
 if(!ctx){if(!g)return;try{ctx=new AC();gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination)}catch{ctx=null;return}}
 if(g){clearTimeout(stopTimer);if(ctx.state==='suspended'){try{await ctx.resume()}catch{}}if(ctx.state!=='running')return;try{await load()}catch{return}if(target()<=0)return;start()}
 const now=ctx.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(gain.gain.value,now);gain.gain.linearRampToValueAtTime(target(),now+(g?1.6:.9));
 if(!g){clearTimeout(stopTimer);stopTimer=setTimeout(()=>{if(!target()){stop();ctx.suspend?.().catch(()=>{})}},1100)}
}
function readLevel(){const r=document.getElementById('rain');const v=Number(r?.dataset.level)||0;if(v!==level){level=v;apply()}else paint()}
window.addEventListener('aqua:weather',readLevel);
document.addEventListener('visibilitychange',apply);
/* Browsers only allow sound after a touch or click: try again on the visitor's first one. */
const unlock=e=>{if(!e.isTrusted)return;if(target()&&(!ctx||ctx.state!=='running'||!source))apply()};
for(const ev of ['pointerup','touchend','click','keydown'])document.addEventListener(ev,unlock,{capture:true,passive:true});
btn?.addEventListener('click',()=>{on=!on;try{localStorage.setItem('aqua-rain-sound',JSON.stringify(on))}catch{}apply()});
document.getElementById('language')?.addEventListener('change',paint);
/* Zé's voice comes first: the rain gets quieter while he talks. */
const voice=document.getElementById('ze-voice-player');
if(voice){voice.addEventListener('playing',()=>{duck=.35;apply()});for(const ev of ['ended','pause','error'])voice.addEventListener(ev,()=>{if(duck!==1){duck=1;apply()}})}
readLevel();
})();

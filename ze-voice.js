/* One unlocked audio player, natural-speed male recordings, and ordinary page interaction to unlock mobile sound. */
(() => {
'use strict';
const supported=typeof Audio==='function';
const player=supported?new Audio():null;
let current=null,serial=0,enabled=false,activation=null,manifestTask=null;
if(player){player.id='ze-voice-player';player.hidden=true;player.preload='auto';player.dataset.state='locked';document.body.append(player);}
function manifest(){if(!manifestTask){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);manifestTask=fetch('assets/ze-voice-natural/manifest.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Voice manifest unavailable');return r.json();}).finally(()=>clearTimeout(timer)).catch(e=>{manifestTask=null;throw e;});}return manifestTask;}
manifest().catch(()=>{});
function detach(){if(!player)return;player.onplaying=player.onended=player.onerror=null;player.pause();}
function cancel(){serial++;if(!current)return;const previous=current;current=null;clearTimeout(previous.timer);detach();player.dataset.state=enabled?'ready':'locked';previous.utterance.onerror?.({error:'canceled'});}
function enable(){
 if(enabled)return Promise.resolve(true);if(activation)return activation;if(!supported)return Promise.resolve(false);
 cancel();player.src='assets/ze-voice-natural/unlock.mp3';player.volume=.85;player.playbackRate=1;
 activation=player.play().then(async()=>{detach();await manifest();enabled=true;player.dataset.state='ready';activation=null;for(const event of ['pointerup','touchend','click','keydown'])document.removeEventListener(event,activateFromPage,true);window.dispatchEvent(new Event('ze:voice-ready'));return true;}).catch(()=>{activation=null;return false;});return activation;
}
function activateFromPage(event){if(!event.isTrusted||document.visibilityState!=='visible')return;if(event.type==='keydown'&&['Shift','Control','Alt','Meta','Tab','Escape'].includes(event.key))return;enable();}
for(const event of ['pointerup','touchend','click','keydown'])document.addEventListener(event,activateFromPage,{capture:true,passive:true});
function utterance(text){return {text,lang:'pt-BR',volume:.85,onstart:null,onend:null,onerror:null};}
async function speak(line){
 if(!enabled){if(navigator.userActivation?.isActive){if(!await enable()){line.onerror?.({error:'not-allowed'});return;}}else{line.onerror?.({error:'not-allowed'});return;}}
 cancel();const id=serial;
 try{
  const data=await manifest();if(id!==serial)return;
  const clips=data.clips[line.lang.split('-')[0]]||{};/* a longer line still plays the recorded part it starts with */const src=clips[line.text]||clips[Object.keys(clips).filter(k=>line.text.startsWith(k)).sort((a,b)=>b.length-a.length)[0]];if(!src)throw Error('Recorded line unavailable');
  detach();player.src=src;player.volume=Math.max(0,Math.min(1,line.volume??.85));player.playbackRate=1;player.defaultPlaybackRate=1;player.dataset.state='loading';
  const item={utterance:line,timer:null};current=item;
  const fail=error=>{if(id!==serial||current!==item)return;current=null;clearTimeout(item.timer);detach();player.dataset.state='error';line.onerror?.({error});};
  item.timer=setTimeout(()=>fail('audio-timeout'),30000);
  let began=false;player.onplaying=()=>{if(id===serial&&!began){began=true;player.dataset.state='playing';line.onstart?.();}};
  player.onended=()=>{if(id===serial&&current===item){current=null;clearTimeout(item.timer);player.dataset.state='ready';line.onend?.();}};
  player.onerror=()=>fail('audio-unavailable');
  try{await player.play();}catch(error){fail(error.name==='NotAllowedError'?'not-allowed':'audio-unavailable');if(error.name==='NotAllowedError'){enabled=false;for(const event of ['pointerup','touchend','click','keydown'])document.addEventListener(event,activateFromPage,{capture:true,passive:true});}}
 }catch{if(id===serial){current=null;line.onerror?.({error:'audio-unavailable'});}}
}
window.ZeVoice={supported,utterance,speak,cancel,enable,get enabled(){return enabled;}};
// Start immediately where autoplay is allowed; ordinary interaction retries otherwise.
enable();
})();

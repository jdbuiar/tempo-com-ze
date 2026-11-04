/* Tappable Zé: a small hop on tap and a discreet speaker hint until the browser allows sound. */
(()=>{
'use strict';
const root=document.documentElement;
function voiceOn(){root.classList.add('ze-voice-on');}
if(window.ZeVoice?.enabled)voiceOn();
window.addEventListener('ze:voice-ready',voiceOn);
if(!window.ZeVoice?.supported)root.classList.add('ze-voice-on');
function hop(el){if(!el)return;el.classList.remove('ze-hop');void el.offsetWidth;el.classList.add('ze-hop');}
document.addEventListener('animationend',e=>{if(e.animationName==='ze-hop')e.target.classList.remove('ze-hop');});
window.ZeTouch={hop};
})();

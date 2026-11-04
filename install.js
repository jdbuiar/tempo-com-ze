/* "Put an icon on your phone": installs the site as an app (Android/desktop prompt, iPhone instructions). */
(()=>{
'use strict';
const L={
 pt:{phone:'Coloque um ícone no seu celular',pc:'Coloque um ícone no seu computador',done:'Pronto! O ícone do Zé já está na sua tela. Agora não precisa abrir a página: é só tocar no ícone que ele abre sozinho.',ios:'No iPhone: toque em <b>Compartilhar</b> <span class="ze-ios-share">⬆︎</span> embaixo da tela e depois em <b>Adicionar à Tela de Início</b>. Aí é só tocar no ícone do Zé, sem precisar abrir a página.',ok:'Entendi'},
 es:{phone:'Pon un ícono en tu celular',pc:'Pon un ícono en tu computadora',done:'¡Listo! El ícono de Zé ya está en tu pantalla. Ya no necesitas abrir la página: toca el ícono y se abre solo.',ios:'En iPhone: toca <b>Compartir</b> <span class="ze-ios-share">⬆︎</span> abajo y luego <b>Agregar a inicio</b>. Después solo toca el ícono de Zé.',ok:'Entendido'},
 en:{phone:'Put an icon on your phone',pc:'Put an icon on your computer',done:'Done! Zé\'s icon is on your screen. No need to open the page anymore: just tap the icon and it opens by itself.',ios:'On iPhone: tap <b>Share</b> <span class="ze-ios-share">⬆︎</span> at the bottom, then <b>Add to Home Screen</b>. Then just tap Zé\'s icon.',ok:'Got it'}
};
const t=()=>L[document.documentElement.lang.split('-')[0]]||L.pt;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const mobile=/Android|iPhone|iPad|iPod|Mobile/.test(ua)||ios;
const iosSafari=ios&&/Safari/.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
if(standalone())return;
let deferred=null;
const btn=document.createElement('button');btn.type='button';btn.id='ze-install';btn.className='ze-install';btn.hidden=true;
btn.innerHTML='<img src="assets/icon-192.png" alt="" width="28" height="28"><span></span>';
const label=()=>{btn.querySelector('span').textContent=mobile?t().phone:t().pc;};
const toast=document.createElement('div');toast.className='ze-install-toast';toast.hidden=true;toast.setAttribute('role','status');
toast.innerHTML='<img src="assets/icon-192.png" alt="" width="44" height="44"><p></p><button type="button"></button>';
toast.querySelector('button').onclick=()=>{toast.hidden=true;};
function say(html){toast.querySelector('p').innerHTML=html;toast.querySelector('button').textContent=t().ok;toast.hidden=false;}
function place(){const row=document.querySelector('.search-row');if(row&&!btn.isConnected)row.after(btn);document.body.append(toast);label();}
place();
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;btn.hidden=false;label();});
if(iosSafari){btn.hidden=false;label();}
btn.addEventListener('click',async()=>{
 if(deferred){deferred.prompt();const r=await deferred.userChoice.catch(()=>null);deferred=null;if(r?.outcome==='accepted'){btn.hidden=true;say(t().done);}return;}
 if(iosSafari)say(t().ios);
});
addEventListener('appinstalled',()=>{btn.hidden=true;deferred=null;say(t().done);});
document.getElementById('language')?.addEventListener('change',()=>setTimeout(label));
})();

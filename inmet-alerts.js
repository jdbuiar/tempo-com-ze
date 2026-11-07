/* Official INMET weather warnings (avisos.inmet.gov.br) for the chosen place in Brazil.
   Main path: our Cloudflare Worker (ze-avisos), which fetches INMET, caches it and checks the warning area.
   Backup: INMET straight from the browser, with the same area test done here.
   INMET also decides when Zé runs: if there is an official storm-type warning for the place,
   he only runs on level 2 (Perigo) or 3 (Grande Perigo) in force now. Without an official warning,
   the model rule in app.js stays as the fallback. */
(()=>{
  'use strict';
  const WORKER='https://ze-avisos.buiarjefferson-693.workers.dev/avisos';
  const API='https://apiprevmet3.inmet.gov.br/avisos/ativos';
  const TTL=10*60*1000;
  const TXT={
    pt:{title:'Aviso do INMET',today:'Hoje',next:'Próximos dias',until:'até',more:'O que fazer',source:'Fonte: INMET',several:n=>`${n} avisos para esta região`},
    es:{title:'Aviso del INMET',today:'Hoy',next:'Próximos días',until:'hasta',more:'Qué hacer',source:'Fuente: INMET (Brasil)',several:n=>`${n} avisos para esta región`},
    en:{title:'INMET warning',today:'Today',next:'Coming days',until:'until',more:'What to do',source:'Source: INMET (Brazil)',several:n=>`${n} warnings for this area`}
  };
  const SEV={'Grande Perigo':3,'Perigo':2,'Perigo Potencial':1};
  const RUN_EVENTS=['tempestade','vendaval','chuvas intensas','ventos costeiros'];
  const STORM_CODES=[95,96,99,1001];
  const results=new Map();let lastKey='';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lang=()=>{try{return TXT[language]?language:'pt'}catch{return 'pt'}};
  const inBrazil=c=>c&&(c.country_code==='BR'||(!c.country_code&&c.latitude<=6&&c.latitude>=-34&&c.longitude>=-74&&c.longitude<=-34));

  function inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const[xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside}return inside}
  function inPolygon(x,y,rings){if(!rings?.length||!inRing(x,y,rings[0]))return false;for(let k=1;k<rings.length;k++)if(inRing(x,y,rings[k]))return false;return true}
  function covers(alert,lat,lon){
    let g;try{g=typeof alert.poligono==='string'?JSON.parse(alert.poligono):alert.poligono}catch{return false}
    if(!g)return false;
    if(g.type==='Polygon')return inPolygon(lon,lat,g.coordinates);
    if(g.type==='MultiPolygon')return g.coordinates.some(p=>inPolygon(lon,lat,p));
    return false;
  }
  /* "2026-11-07 00:00" is Brasília time */
  const stamp=s=>{const m=/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(s||'');if(!m)return null;const t=Date.parse(`${m[1]}T${m[2]}:00-03:00`);return Number.isNaN(t)?null:t};
  const list=v=>(Array.isArray(v)?v:v?[v]:[]).map(x=>String(x).trim()).filter(Boolean);
  const isRunType=a=>RUN_EVENTS.some(e=>String(a.evento).toLowerCase().includes(e));

  /* Same shape from both paths: {evento,severidade,nivel,cor,inicio,fim,riscos,instrucoes,vigente,futuro} */
  async function fromWorker(c){
    const r=await fetch(`${WORKER}?lat=${c.latitude.toFixed(3)}&lon=${c.longitude.toFixed(3)}`,{signal:AbortSignal.timeout?.(10000)});
    if(!r.ok)throw Error(r.status);
    const d=await r.json();if(!Array.isArray(d.avisos)||d.erro)throw Error('worker');
    return d.avisos;
  }
  async function fromInmet(c){
    const r=await fetch(API,{signal:AbortSignal.timeout?.(12000)});if(!r.ok)throw Error(r.status);
    const d=await r.json(),now=Date.now(),seen=new Set(),out=[];
    for(const [arr,futuro] of [[d.hoje,false],[d.futuro,true]])for(const a of arr||[]){
      if(!a||a.encerrado||seen.has(a.id)||!covers(a,c.latitude,c.longitude))continue;seen.add(a.id);
      const ini=stamp(a.inicio),fim=stamp(a.fim);if(fim!==null&&fim<=now)continue;
      out.push({id:a.id,evento:a.descricao||'',severidade:a.severidade||'',nivel:SEV[a.severidade]||1,cor:a.aviso_cor||null,inicio:a.inicio,fim:a.fim,riscos:list(a.riscos),instrucoes:list(a.instrucoes),vigente:(ini===null||ini<=now)&&(fim===null||now<fim),futuro});
    }
    return out;
  }
  async function load(c){
    const key=`${c.latitude.toFixed(3)},${c.longitude.toFixed(3)}`,hit=results.get(key);
    if(hit&&Date.now()-hit.at<TTL)return hit.avisos;
    let avisos;try{avisos=await fromWorker(c)}catch{avisos=await fromInmet(c)}
    results.set(key,{avisos,at:Date.now()});return avisos;
  }

  const when=s=>{const m=/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/.exec(s||'');return m?`${m[3]}/${m[2]} ${m[4]}`:''};
  function box(){let el=document.getElementById('inmet-alerts');if(!el){el=document.createElement('section');el.id='inmet-alerts';el.className='inmet-alerts';el.setAttribute('aria-live','polite')}
    /* INMET always sits above the model-based storm banner */
    const anchor=document.getElementById('storm-alert')||document.getElementById('hoje');if(anchor&&el.nextElementSibling!==anchor)anchor.before(el);return el}
  function render(items){
    const el=box();if(!el)return;
    if(!items.length){el.hidden=true;el.replaceChildren();return}
    const t=TXT[lang()];
    const head=items.length>1?`<p class="inmet-count">${esc(t.several(items.length))}</p>`:'';
    el.innerHTML=head+items.map(a=>`
      <article class="inmet-alert" style="--alert:${/^#[0-9a-f]{6}$/i.test(a.cor)?a.cor:'#f2c94c'}">
        <div class="inmet-badge" aria-hidden="true">!</div>
        <div class="inmet-body">
          <small>${esc(t.title)} · ${esc(a.futuro?t.next:t.today)}</small>
          <strong>${esc(a.evento)} <em>${esc(a.severidade)}</em></strong>
          <span>${esc(when(a.inicio))} ${esc(t.until)} ${esc(when(a.fim))}</span>
          ${a.riscos?.length?`<p>${esc(a.riscos.join(' '))}</p>`:''}
          ${a.instrucoes?.length?`<details><summary>${esc(t.more)}</summary><ul>${a.instrucoes.map(i=>`<li>${esc(i.trim())}</li>`).join('')}</ul></details>`:''}
          <a href="https://avisos.inmet.gov.br/" target="_blank" rel="noopener">${esc(t.source)}</a>
        </div>
      </article>`).join('');
    el.hidden=false;
  }

  /* Official word on storms replaces the model: banner and Zé follow INMET. */
  function decideZe(avisos){
    const official=avisos.filter(a=>a.vigente&&isRunType(a));
    if(!official.length)return; // no official storm warning now: the model rule stays
    /* Zé only runs and dresses for the storm when the sky agrees (strong wind or thunder now or in the next hour; plain rain keeps the rain outfit);
       until then he keeps the outfit for the current sky and mentions the official warning. */
    const danger=official.some(a=>a.nivel>=2),near=!!window.aquaWeatherState?.stormSoon,run=danger&&near,alert=danger&&!run;
    const storm=document.getElementById('storm-alert');if(storm)storm.hidden=true; // the INMET card already says it
    const base=window.aquaWeatherState;if(!base?.current)return;
    const code=base.current.weather_code;
    const current=!run&&STORM_CODES.includes(code)?{...base.current,weather_code:63}:base.current;
    if(base.stormSoon===run&&current===base.current&&!!base.alert===alert)return;
    const next={...base,stormSoon:run,alert,current,inmet:true};
    window.aquaWeatherState=next;
    window.dispatchEvent(new CustomEvent('aqua:weather',{detail:next}));
  }

  async function update(force){
    let c;try{c=city}catch{return}
    if(!inBrazil(c)){render([]);return}
    const key=`${c.latitude.toFixed(3)},${c.longitude.toFixed(3)}|${lang()}`;
    try{
      const avisos=await load(c);
      let now;try{now=city}catch{return}
      if(now!==c)return;
      lastKey=key;
      const items=[...avisos].sort((x,y)=>(x.futuro-y.futuro)||(y.nivel-x.nivel)).slice(0,3);
      render(items);decideZe(avisos);
      window.aquaInmetAlerts=avisos;
    }catch{/* INMET offline: keep the page as it is, without inventing warnings */}
  }
  window.addEventListener('aqua:weather',e=>{if(!e.detail?.inmet)update(false)});
  document.getElementById('language')?.addEventListener('change',()=>update(true));
  /* Warnings change during the day: check again every 10 min while the page is open */
  setInterval(()=>{if(document.visibilityState==='visible')update(false)},TTL);
})();

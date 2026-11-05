/* Official INMET weather warnings (avisos.inmet.gov.br) for the chosen place in Brazil.
   The API returns each warning with its GeoJSON area, so we test whether the city point falls inside. */
(()=>{
  'use strict';
  const API='https://apiprevmet3.inmet.gov.br/avisos/ativos';
  const TTL=10*60*1000;
  const TXT={
    pt:{title:'Aviso do INMET',today:'Hoje',next:'Próximos dias',until:'até',more:'O que fazer',source:'Fonte: INMET',several:n=>`${n} avisos para esta região`},
    es:{title:'Aviso del INMET',today:'Hoy',next:'Próximos días',until:'hasta',more:'Qué hacer',source:'Fuente: INMET (Brasil)',several:n=>`${n} avisos para esta región`},
    en:{title:'INMET warning',today:'Today',next:'Coming days',until:'until',more:'What to do',source:'Source: INMET (Brazil)',several:n=>`${n} warnings for this area`}
  };
  const SEV={'Grande Perigo':3,'Perigo':2,'Perigo Potencial':1};
  let cache=null,cacheAt=0,pending=null,lastKey='';
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
  async function load(){
    if(cache&&Date.now()-cacheAt<TTL)return cache;
    if(pending)return pending;
    pending=fetch(API,{signal:AbortSignal.timeout?.(12000)}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(d=>{cache=d;cacheAt=Date.now();return d}).finally(()=>{pending=null});
    return pending;
  }
  const when=s=>{const m=/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/.exec(s||'');return m?`${m[3]}/${m[2]} ${m[4]}`:''};
  const inParana=c=>/^paran[aá]$/i.test(String(c?.admin1||'').trim());
  function box(){let el=document.getElementById('inmet-alerts');if(!el){el=document.createElement('section');el.id='inmet-alerts';el.className='inmet-alerts';el.setAttribute('aria-live','polite')}
    /* INMET always sits above the model-based storm banner */
    const anchor=document.getElementById('storm-alert')||document.getElementById('hoje');if(anchor&&el.nextElementSibling!==anchor)anchor.before(el);return el}
  /* In Paraná, INMET is checked first: an official warning replaces the model's storm banner; without one, the model banner stays as fallback. */
  function priority(c,list){const storm=document.getElementById('storm-alert');if(storm&&inParana(c)&&list.length)storm.hidden=true}
  function render(list){
    const el=box();if(!el)return;
    if(!list.length){el.hidden=true;el.replaceChildren();return}
    const t=TXT[lang()];
    const head=list.length>1?`<p class="inmet-count">${esc(t.several(list.length))}</p>`:'';
    el.innerHTML=head+list.map(({a,future})=>`
      <article class="inmet-alert" style="--alert:${/^#[0-9a-f]{6}$/i.test(a.aviso_cor)?a.aviso_cor:'#f2c94c'}">
        <div class="inmet-badge" aria-hidden="true">!</div>
        <div class="inmet-body">
          <small>${esc(t.title)} · ${esc(future?t.next:t.today)}</small>
          <strong>${esc(a.descricao)} <em>${esc(a.severidade)}</em></strong>
          <span>${esc(when(a.inicio))} ${esc(t.until)} ${esc(when(a.fim))}</span>
          ${a.riscos?.length?`<p>${esc(a.riscos.join(' '))}</p>`:''}
          ${a.instrucoes?.length?`<details><summary>${esc(t.more)}</summary><ul>${a.instrucoes.map(i=>`<li>${esc(i.trim())}</li>`).join('')}</ul></details>`:''}
          <a href="https://avisos.inmet.gov.br/" target="_blank" rel="noopener">${esc(t.source)}</a>
        </div>
      </article>`).join('');
    el.hidden=false;
  }
  async function update(force){
    let c;try{c=city}catch{return}
    if(!inBrazil(c)){render([]);return}
    const key=`${c.latitude.toFixed(3)},${c.longitude.toFixed(3)}|${lang()}`;
    if(!force&&key===lastKey&&cache&&Date.now()-cacheAt<TTL){priority(c,window.aquaInmetAlerts||[]);box();return}
    try{
      const d=await load();lastKey=key;
      let now;try{now=city}catch{return}
      if(now!==c)return;
      const pick=(arr,future)=>(arr||[]).filter(a=>!a.encerrado&&covers(a,c.latitude,c.longitude)).map(a=>({a,future}));
      const list=[...pick(d.hoje,false),...pick(d.futuro,true)].sort((x,y)=>(x.future-y.future)||((SEV[y.a.severidade]||0)-(SEV[x.a.severidade]||0)));
      render(list.slice(0,3));priority(c,list);
      window.aquaInmetAlerts=list.map(x=>x.a);
    }catch{/* INMET offline: keep the page as it is, without inventing warnings */}
  }
  window.addEventListener('aqua:weather',()=>update(false));
  document.getElementById('language')?.addEventListener('change',()=>update(true));
})();

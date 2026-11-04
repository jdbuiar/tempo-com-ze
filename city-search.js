/* Resolve common city spellings without restricting worldwide results to Brazil. */
const AquaCitySearch=(()=>{
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const newYork=['new york','new york city','nova york','nova iorque','nova yorque','nueva york','nyc'];
  function parts(term){
    const comma=term.indexOf(',');
    return {name:(comma<0?term:term.slice(0,comma)).trim(),qualifier:comma<0?'':term.slice(comma)};
  }
  const isNewYork=term=>newYork.includes(normalize(parts(term).name));
  function queries(term){
    const {name,qualifier}=parts(term);
    return [...new Set([term.trim(),...(isNewYork(name)?['New York'+qualifier]:[])])];
  }
  function rank(term,cities){
    if(!isNewYork(term))return cities.slice(0,7);
    const names=newYork;
    const score=city=>{
      const name=normalize(city.name);
      return names.includes(name)?3:names.some(n=>name.startsWith(n))?2:names.some(n=>name.includes(n))?1:0;
    };
    const unique=new Map();
    for(const city of cities){
      if(!Number.isFinite(city.latitude)||!Number.isFinite(city.longitude))continue;
      const id=city.id??`${city.latitude},${city.longitude}`;
      if(!unique.has(id))unique.set(id,city);
    }
    return [...unique.values()].sort((a,b)=>score(b)-score(a)||(b.population||0)-(a.population||0)).slice(0,10);
  }
  async function search(term,language,fetchJSON,signal){
    const responses=await Promise.allSettled(queries(term).map(name=>fetchJSON('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name,count:isNewYork(term)?'20':'7',language,format:'json'}),signal)));
    const successful=responses.filter(r=>r.status==='fulfilled');
    if(!successful.length)throw responses[0].reason;
    return rank(term,successful.flatMap(r=>r.value.results||[]));
  }
  return {queries,rank,search,isNewYork};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AquaCitySearch;

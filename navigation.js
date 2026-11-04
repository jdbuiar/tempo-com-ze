/* Section links stay selected while scrolling to their destination. */
(() => {
  'use strict';
  const links=[...document.querySelectorAll('.header nav a')];
  const sections=links.map(link=>({link,id:link.hash.slice(1),element:document.getElementById(link.hash.slice(1))})).filter(item=>item.element);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let destination=null,scheduled=false;
  function select(id){
    for(const {link,id:sectionId} of sections){
      const active=sectionId===id;
      link.classList.toggle('active',active);
      if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    }
  }
  function targetY(id){
    const section=sections.find(item=>item.id===id);
    const top=id==='hoje'?0:section.element.getBoundingClientRect().top+window.scrollY-25;
    return Math.max(0,Math.min(top,document.documentElement.scrollHeight-window.innerHeight));
  }
  function update(){
    scheduled=false;
    if(destination){
      select(destination);
      if(Math.abs(window.scrollY-targetY(destination))<=2)destination=null;
      return;
    }
    const marker=window.scrollY+Math.min(window.innerHeight*.2,150);
    const ordered=sections.map(item=>({...item,top:item.element.getBoundingClientRect().top+window.scrollY})).sort((a,b)=>a.top-b.top);
    let id='hoje';
    for(const item of ordered){if(item.top>marker)break;id=item.id;}
    select(id);
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  function go(id,push=false){
    if(!sections.some(item=>item.id===id))return;
    destination=id;select(id);
    if(push&&location.hash!=='#'+id)history.pushState(null,'','#'+id);
    window.scrollTo({top:targetY(id),behavior:reduced.matches?'instant':'smooth'});
    schedule();
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href^="#"]');
    if(!link||!sections.some(item=>'#'+item.id===link.getAttribute('href')))return;
    event.preventDefault();go(link.hash.slice(1),true);
  });
  for(const type of ['wheel','touchstart'])window.addEventListener(type,()=>{destination=null;},{passive:true});
  window.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))destination=null;});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
  if('ResizeObserver'in window)new ResizeObserver(schedule).observe(document.querySelector('main'));
  window.addEventListener('load',()=>{if(location.hash==='#hoje')go('hoje');});
  if(sections.some(item=>'#'+item.id===location.hash))go(location.hash.slice(1));else schedule();
})();

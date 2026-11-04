/* First-row character: enter, greet, cross the row, return, apply sunscreen, greet again. */
(()=>{
  const row=document.querySelector('.overview-grid'),hero=row.querySelector('.hero');
  const stage=document.getElementById('sun-character-stage'),traveler=document.getElementById('sun-character-traveler'),sprite=document.getElementById('sun-character-sprite');
  const bubble=document.getElementById('character-speech'),phrase=document.getElementById('character-phrase');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 650px)');
  const words={
    pt:{speechLang:'pt-BR'},
    es:{speechLang:'es-ES'},
    en:{speechLang:'en-US'}
  };
  const speechSupported=!!window.ZeVoice?.supported;
  let routeWidth=0,stopX=0,previous=0,elapsed=0,cycleElapsed=0,currentFrame='',lastPose='',speaking=false,utterance=null,lastFrozen=false,speechKind='sunny',speechSerial=0;
  const spoken={sunny:false,care:false};
  let rowVisible=true;new IntersectionObserver(entries=>{rowVisible=entries[0].isIntersecting;if(!rowVisible)stopVoice()}).observe(row);
  let path=AquaWalkMotion.create(1000,360,180);
  const ground=[.9697,.9722,.9747,.9672,.9697,.9698,.9723,.9723,.9673,.9698];
  const drizzleGround=[.94444,.94444,.94444,.94192,.94697,.94710,.94458,.94710,.94458,.94207];
  const drizzleHead=[.52141,.48737,.42821,.36616,.30479,.53401,.48737,.42317,.36616,.29975];
  const mildHead=[.47840,.47068,.45820,.45062,.43827,.48457,.47222,.46130,.45062,.43827,.50617,.49691,.48297,.47222,.45988];
  const mildGround=[.96296,.95679,.95679,.95679,.95679,.95666,.95666,.95666,.95356,.95356,.95988,.95988,.95988,.95988,.95988];
  let weatherData=null,weatherContext=null,activeVariant='sunny',assetRevision=0,animationStarted=false;
  const imageTasks=new Map();
  const text=()=>{const lang=document.documentElement.lang.split('-')[0];return {...(words[lang]||words.pt),...AquaCharacterWeather.lines(weatherContext,lang)}};
  function loadImage(src){
    if(imageTasks.has(src))return imageTasks.get(src);
    const task=new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>{imageTasks.delete(src);reject(Error('Character asset unavailable'))};image.src=src});
    imageTasks.set(src,task);return task;
  }
  async function updateWeather(data){
    weatherData=data;const next=AquaCharacterWeather.select(data);if(!next)return;
    const changed=!weatherContext||next.variant!==weatherContext.variant||next.period!==weatherContext.period||next.code!==weatherContext.code;
    weatherContext=next;const revision=++assetRevision;
    if(changed)stopVoice();
    stage.style.visibility='hidden';if(next.variant!==activeVariant)stage.classList.remove('character-ready');
    const sources=next.variant==='sunny'?['assets/sun-care-character.webp','assets/sun-greeting-character.webp','assets/sun-walk-cycle-10.webp']:[AquaCharacterWeather.asset(next.variant)];
    if(next.variant==='drizzle')sources.push('assets/ze-drizzle-walk-10.webp');
    try{
      await Promise.all(sources.map(loadImage));if(revision!==assetRevision)return;
      activeVariant=next.variant;currentFrame='';stage.dataset.variant=activeVariant;stage.dataset.period=next.period;
      stage.classList.add('character-ready');layout();
      if(!animationStarted){animationStarted=true;requestAnimationFrame(tick)}
    }catch{if(revision===assetRevision){stage.style.visibility='hidden';stage.classList.remove('character-ready')}}
  }

  function updateSpeech(kind){speechKind=kind;phrase.textContent=text()[kind]}
  function layout(){
    routeWidth=Math.max(0,stage.clientWidth-traveler.offsetWidth-20);
    const rio=Array.from(document.querySelectorAll('.city-chip')).find(b=>b.textContent.includes('Rio de Janeiro'));
    stopX=rio?Math.max(10,Math.min(routeWidth-8,rio.getBoundingClientRect().right-stage.getBoundingClientRect().left-28)):routeWidth*.34;
    if(mobile.matches){stage.style.top=(hero.offsetTop+hero.offsetHeight-stage.offsetHeight-8)+'px';stage.style.bottom='auto'}else{stage.style.top='auto';stage.style.bottom='8px'}
    path=AquaWalkMotion.create(routeWidth,stopX,traveler.offsetWidth);
    stage.setAttribute('aria-label',text().description);updateSpeech(speechKind);
  }
  function setFrame(atlas,index,pose,left=false){
    if(atlas==='care'&&activeVariant==='mild'){atlas='greeting';index=3}
    if(atlas==='care'&&activeVariant==='sunny'&&!weatherContext?.sunCare){atlas='greeting';index=3}
    const next=activeVariant+atlas+index;
    if(next!==currentFrame){
      currentFrame=next;sprite.classList.toggle('greeting-sprite',atlas==='greeting');sprite.classList.toggle('walking-sprite',atlas==='walk');
      if(activeVariant==='sunny'){
        sprite.style.backgroundImage=`url('assets/${atlas==='greeting'?'sun-greeting-character.webp':atlas==='walk'?'sun-walk-cycle-10.webp':'sun-care-character.webp'}')`;
        sprite.style.backgroundSize=atlas==='greeting'?'200% 200%':atlas==='walk'?'500% 200%':'400% 200%';
        sprite.style.backgroundPosition=atlas==='greeting'?`${index%2*100}% ${index<2?0:100}%`:atlas==='walk'?`${index%5*25}% ${index<5?0:100}%`:`${index%4*100/3}% ${index<4?0:100}%`;
      }else if(activeVariant==='drizzle'&&atlas==='walk'){
        sprite.style.backgroundImage="url('assets/ze-drizzle-walk-10.webp')";sprite.style.backgroundSize='500% 200%';sprite.style.backgroundPosition=`${index%5*25}% ${index<5?0:100}%`;
      }else{
        const cell=atlas==='walk'?index:atlas==='greeting'?[10,11,11,14][index]:index<4?10:index%2?13:12;
        sprite.style.backgroundImage=`url('${AquaCharacterWeather.asset(activeVariant)}')`;sprite.style.backgroundSize='500% 300%';sprite.style.backgroundPosition=`${cell%5*25}% ${Math.floor(cell/5)*50}%`;
      }
    }
    sprite.style.transform=left?'scaleX(-1)':'scaleX(1)';
    sprite.style.translate=activeVariant==='drizzle'&&atlas==='walk'?`${((left?-1:1)*(.5-drizzleHead[index])*traveler.offsetWidth).toFixed(2)}px ${((.95062-drizzleGround[index])*traveler.offsetWidth).toFixed(2)}px`:activeVariant==='sunny'&&atlas==='walk'?'0px '+((.96-ground[index])*traveler.offsetWidth).toFixed(2)+'px':'0px 0px';
    if(activeVariant==='mild'){
      const cell=atlas==='walk'?index:atlas==='greeting'?[10,11,11,14][index]:index<4?10:index%2?13:12;
      sprite.style.translate=`${((left?-1:1)*(.5-mildHead[cell])*traveler.offsetWidth).toFixed(2)}px ${((.96-mildGround[cell])*traveler.offsetWidth).toFixed(2)}px`;
    }
    if(pose!==lastPose){sprite.dataset.pose=pose;lastPose=pose}
  }
  function stopVoice(){speechSerial++;if(speechSupported&&utterance)ZeVoice.cancel();speaking=false;utterance=null}
  function speak(){
    if(!speechSupported)return;stopVoice();
    spoken[speechKind]=true;const serial=speechSerial;
    utterance=ZeVoice.utterance(text()[speechKind]);speaking=true;utterance.lang=text().speechLang;utterance.volume=.85;
    utterance.onstart=()=>{if(serial===speechSerial)speaking=true};
    utterance.onend=()=>{if(serial===speechSerial){speaking=false;utterance=null}};utterance.onerror=event=>{if(serial===speechSerial){speaking=false;utterance=null;if(event.error==='not-allowed')spoken[speechKind]=false}};
    ZeVoice.speak(utterance);
  }
  window.addEventListener('ze:voice-ready',()=>{updateSpeech(speechKind);if(!rowVisible)return;if(lastPose==='waiting'||(!spoken.sunny&&elapsed>=path.marks.outward)){elapsed=cycleElapsed=0;spoken.sunny=spoken.care=false;previous=performance.now();}else if(!bubble.hidden&&!utterance)speak();});
  function tick(now){
    const delta=previous?Math.max(0,now-previous):0;previous=now;
    // The visual entrance must not depend on the browser allowing autoplay.
    const frozen=!rowVisible||document.body.classList.contains('paused')||reduce.matches||document.visibilityState!=='visible';
    if(frozen&&!lastFrozen)stopVoice();lastFrozen=frozen;
    if(!frozen){
      cycleElapsed+=delta;
      if(cycleElapsed>=path.marks.end){
        cycleElapsed%=path.marks.end;elapsed=cycleElapsed;stopVoice();spoken.sunny=false;spoken.care=false;
      }else if(!speaking){elapsed=Math.min(elapsed+delta,path.marks.end-1)}else{elapsed=Math.min(elapsed+delta,(speechKind==='care'?path.marks.exit:path.marks.outward)-1)}
    }
    const state=AquaWalkMotion.sample(elapsed,path);
    let {x,pose,frame,atlas,left,kind}=state;
    if(reduce.matches){x=stopX;atlas='greeting';frame=3;pose='greeting';kind='care'}
    if(frozen&&elapsed<path.marks.enter){x=stopX;atlas='greeting';frame=3;pose='greeting'}
    if(pose==='greeting'){
      const from=kind==='care'?path.marks.care:path.marks.sunny;
      frame=!frozen&&(speaking||elapsed-from<3500)?1:3;
    }
    if(kind!==speechKind)updateSpeech(kind);
    setFrame(atlas,frame,pose,left);bubble.hidden=pose!=='greeting';
    const present=pose!=='waiting'&&stage.classList.contains('character-ready');row.classList.toggle('character-present',present);
    stage.style.visibility=present?'visible':'hidden';stage.setAttribute('aria-hidden',String(!present));
    if(pose==='greeting'&&!frozen&&!spoken[kind]&&ZeVoice.enabled)speak();
    traveler.style.transform=`translate3d(${x+10}px,0px,0)`;
    traveler.style.opacity=pose==='waiting'?'0':frozen?'1':String(state.opacity);
    requestAnimationFrame(tick);
  }
  stage.style.visibility='hidden';
  window.addEventListener('aqua:weather',event=>updateWeather(event.detail));
  if(window.aquaWeatherState)updateWeather(window.aquaWeatherState);
  setInterval(()=>{if(weatherData&&document.visibilityState==='visible')updateWeather(weatherData)},60000);
  new ResizeObserver(layout).observe(hero);new ResizeObserver(layout).observe(stage);new MutationObserver(layout).observe(document.getElementById('favorites'),{childList:true});
  window.addEventListener('resize',layout);document.getElementById('language').addEventListener('change',()=>{stopVoice();layout()});
  document.addEventListener('visibilitychange',()=>{previous=0;if(document.visibilityState!=='visible')stopVoice()});window.addEventListener('pagehide',stopVoice);layout();
})();

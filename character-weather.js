/* Weather and local daylight select Zé's outfit and two spoken lines. */
const AquaCharacterWeather={
  select(data,now=Date.now()){
    const c=data?.current;if(!c||!Number.isFinite(c.weather_code)||!Number.isFinite(c.temperature_2m))return null;
    const code=c.weather_code,temp=c.temperature_2m;
    const storm=[95,96,99,1001].includes(code);
    const rain=[61,63,65,66,67,80,81,82].includes(code),drizzle=[51,53,55,56,57].includes(code),snow=[71,73,75,77,85,86].includes(code);
    const solar=Number.isFinite(data.sunrise)&&Number.isFinite(data.sunset)&&data.sunset>data.sunrise;
    const isDay=solar?now/1000>=data.sunrise&&now/1000<data.sunset:!!c.is_day;
    const sunCare=isDay&&[0,1].includes(code)&&temp>=24;
    const variant=storm||data.stormSoon?'storm':rain?'rain':drizzle?'drizzle':snow||temp<=16?'cold':sunCare?'sunny':'mild';
    let hour;try{hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:data.timezone||'America/Sao_Paulo',hour:'2-digit',hourCycle:'h23'}).format(now))}catch{hour=new Date(now+(data.utcOffsetSeconds||0)*1000).getUTCHours()}
    const period=!isDay?'night':hour<12?'morning':'afternoon';
    return {variant,period,isDay,code,temp,snow,sunCare:variant==='sunny',alert:!!data.alert&&variant!=='storm'};
  },
  lines(context,lang='pt'){
    const l=['pt','es','en'].includes(lang)?lang:'pt',c=context||{variant:'sunny',period:'morning',isDay:true,code:0};
    const salutations={pt:{morning:'Bom dia!',afternoon:'Boa tarde!',night:'Boa noite!'},es:{morning:'¡Buenos días!',afternoon:'¡Buenas tardes!',night:'¡Buenas noches!'},en:{morning:'Good morning!',afternoon:'Good afternoon!',night:'Good evening!'}};
    const introductions={pt:'Oi, meu nome é Zé.',es:'¡Hola, me llamo Zé!',en:'Hi, my name is Zé.'};
    const middle={
      pt:{mild:'Hoje está ameno. De jeans e camisa, estou preparado!',sunny:'Ótimo dia de sol! Tem que se cuidar, não é mesmo?',drizzle:'Um chuvisquinho por aqui. Ainda bem que trouxe o guarda-chuva!',rain:'Hoje vim preparado: capa e guarda-chuva!',storm:'Tempo de tempestade. É melhor ficar abrigado!',cold:'Está frio, mas sem chuva. Vim bem agasalhado!',snow:'Tempo de neve! Vim bem agasalhado.'},
      es:{mild:'El tiempo está templado. ¡Con vaqueros y camisa, estoy preparado!',sunny:'¡Qué buen día de sol! Hay que cuidarse, ¿verdad?',drizzle:'Está lloviznando. ¡Menos mal que traje el paraguas!',rain:'¡Hoy vine preparado: impermeable y paraguas!',storm:'Hay tormenta. ¡Es mejor quedarse a resguardo!',cold:'Hace frío, pero no llueve. ¡Vine bien abrigado!',snow:'¡Tiempo de nieve! Vine bien abrigado.'},
      en:{mild:'Mild weather today. In jeans and a shirt, I am ready!',sunny:'What a lovely sunny day! You have to take care of yourself, right?',drizzle:'A little drizzle here. Good thing I brought my umbrella!',rain:'I came prepared today: raincoat and umbrella!',storm:'Stormy weather. It is better to stay sheltered!',cold:'It is cold, but not raining. I dressed warmly!',snow:'Snowy weather! I dressed warmly.'}
    };
    let care=middle[l][c.snow?'snow':c.variant];
    if(c.variant==='mild'&&!c.isDay)care={pt:'Vamos acompanhar o tempo desta noite. Tem que se cuidar, não é mesmo?',es:'Vamos a seguir el tiempo de esta noche. Hay que cuidarse, ¿verdad?',en:'Let’s keep an eye on tonight’s weather. You have to take care of yourself, right?'}[l];
    else if(c.variant==='mild'&&[3,45,48].includes(c.code))care={pt:'Hoje o céu está '+(c.code===3?'nublado.':'com neblina.')+' Tem que se cuidar, não é mesmo?',es:'Hoy el cielo está '+(c.code===3?'nublado.':'con niebla.')+' Hay que cuidarse, ¿verdad?',en:(c.code===3?'Cloudy skies today.':'Foggy weather today.')+' You have to take care of yourself, right?'}[l];
    if(c.alert)care={pt:'O INMET avisou que pode vir tempestade hoje. Fica de olho no céu!',es:'El INMET avisó que puede venir tormenta hoy. ¡Atento al cielo!',en:'INMET warns a storm may come today. Keep an eye on the sky!'}[l];
    const descriptions={pt:'Zé acompanha o tempo da sua cidade e muda de roupa conforme a previsão.',es:'Zé sigue el tiempo de tu ciudad y cambia de ropa según el pronóstico.',en:'Zé follows your city’s weather and changes outfits with the forecast.'};
    const warn={pt:'Se cuida! Está vindo uma tempestade com ventos fortes!',es:'¡Cuídate! Viene una tormenta con vientos fuertes.',en:'Take care! A storm with strong winds is coming!'}[l];
    return {sunny:introductions[l]+' '+salutations[l][c.period],care,storm:warn,description:descriptions[l]};
  },
  asset(variant){return 'assets/ze-'+variant+'.webp'}
};
if(typeof module!=='undefined'&&module.exports)module.exports=AquaCharacterWeather;

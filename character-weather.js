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
  /* Each cycle Zé picks the next line from the pool, so he does not repeat himself every lap. */
  /* revezamento: lembra a última fala e passa para a próxima a cada visita e a cada volta do Zé, sem repetir */
  turn:(()=>{let n=Math.floor(Math.random()*1000);try{const s=Number(localStorage.getItem('ze-turn'));if(Number.isInteger(s))n=s+1;localStorage.setItem('ze-turn',String(n));}catch{}return n;})(),
  next(){this.turn++;try{localStorage.setItem('ze-turn',String(this.turn));}catch{}},
  pools:{
    greet:{
      pt:{morning:['Oi, meu nome é Zé. Bom dia!','Bom dia! O Zé chegou pra contar como está o tempo.','Bom dia, pessoal! Já olharam o céu hoje?','Opa, bom dia! Bora ver a previsão juntos?'],
          afternoon:['Oi, meu nome é Zé. Boa tarde!','Boa tarde! O Zé passou aqui pra dar uma olhada no céu.','Boa tarde, pessoal! Como está o tempo por aí?','Opa, boa tarde! Bora ver a previsão juntos?'],
          night:['Oi, meu nome é Zé. Boa noite!','Boa noite! O Zé ainda está de olho no céu.','Boa noite, pessoal! Vamos ver como fica o tempo?','Opa, boa noite! Já viu a previsão de amanhã?']},
      es:{morning:['¡Hola, me llamo Zé! ¡Buenos días!','¡Buenos días! Zé llegó para contarte cómo está el tiempo.','¡Buenos días a todos! ¿Ya miraron el cielo hoy?','¡Hola, buenos días! ¿Vemos el pronóstico juntos?'],
          afternoon:['¡Hola, me llamo Zé! ¡Buenas tardes!','¡Buenas tardes! Zé pasó a echarle un vistazo al cielo.','¡Buenas tardes a todos! ¿Cómo está el tiempo por ahí?','¡Hola, buenas tardes! ¿Vemos el pronóstico juntos?'],
          night:['¡Hola, me llamo Zé! ¡Buenas noches!','¡Buenas noches! Zé sigue atento al cielo.','¡Buenas noches a todos! ¿Vemos cómo sigue el tiempo?','¡Hola, buenas noches! ¿Ya viste el pronóstico de mañana?']},
      en:{morning:['Hi, my name is Zé. Good morning!','Good morning! Zé is here to tell you about the weather.','Good morning, everyone! Have you looked at the sky today?','Hey, good morning! Shall we check the forecast together?'],
          afternoon:['Hi, my name is Zé. Good afternoon!','Good afternoon! Zé stopped by to check the sky.','Good afternoon, everyone! How is the weather where you are?','Hey, good afternoon! Shall we check the forecast together?'],
          night:['Hi, my name is Zé. Good evening!','Good evening! Zé is still keeping an eye on the sky.','Good evening, everyone! Shall we see how the weather looks?','Hey, good evening! Have you seen tomorrow’s forecast?']}
    },
    alert:{
      pt:['O INMET avisou que pode vir tempestade hoje. Na hora, não fique embaixo nem perto de árvores e postes de luz!','Tem aviso do INMET de tempestade pra hoje. Se o tempo virar, fique longe de árvores e postes de luz!','Atenção: o INMET alertou para tempestade hoje. Quando chegar, nada de ficar perto de árvores e postes de luz!','Hoje o INMET deu alerta de tempestade. Se começar, procure abrigo longe de árvores e postes de luz!'],
      es:['El INMET avisó que puede venir tormenta hoy. En ese momento, no te quedes debajo ni cerca de árboles y postes de luz.','Hay aviso del INMET de tormenta para hoy. Si cambia el tiempo, aléjate de árboles y postes de luz.','Atención: el INMET alertó de tormenta hoy. Cuando llegue, nada de quedarse cerca de árboles y postes de luz.','Hoy el INMET dio alerta de tormenta. Si empieza, busca refugio lejos de árboles y postes de luz.'],
      en:['INMET warns a storm may come today. When it hits, stay away from trees and power poles!','There is an INMET storm warning for today. If the weather turns, keep away from trees and power poles!','Heads up: INMET issued a storm alert today. When it arrives, stay clear of trees and power poles!','INMET put out a storm alert today. If it starts, take shelter away from trees and power poles!']
    },
    care:{
      pt:{mild:['Hoje está ameno. De jeans e camisa, estou preparado!','Temperatura agradável hoje. Dia bom pra sair!','Nem frio, nem calor. Jeans e camisa resolvem!','Clima gostoso hoje. Aproveita o dia!'],
          sunny:['Ótimo dia de sol! Tem que se cuidar, não é mesmo?','Sol forte hoje! Não esquece o protetor e a água.','Que dia bonito! Passa protetor antes de sair, combinado?','Calorzinho bom! Chapéu, protetor e bastante água.'],
          drizzle:['Um chuvisquinho por aqui. Ainda bem que trouxe o guarda-chuva!','Tá garoando! Guarda-chuva na mão e bora.','Chuvinha fina lá fora. Melhor não sair sem o guarda-chuva!','Garoa chata, né? Pelo menos o guarda-chuva veio junto.'],
          rain:['Hoje vim preparado: capa e guarda-chuva!','Dia de chuva! Capa, guarda-chuva e cuidado no trânsito.','Tá chovendo! Se puder, deixa pra sair mais tarde.','Chuva lá fora. Cuidado com o chão molhado, hein!'],
          storm:['Tempo de tempestade. É melhor ficar abrigado!','Tempestade por perto. Fica em casa se puder!','O tempo fechou. Melhor ficar num lugar seguro!'],
          cold:['Está frio, mas sem chuva. Vim bem agasalhado!','Friozinho hoje! Casaco bem fechado e bora.','Tá frio! Hora de um café quentinho.','Frio de rachar! Não esquece o agasalho.'],
          snow:['Tempo de neve! Vim bem agasalhado.','Neve lá fora! Luva, gorro e casaco.'],
          night:['Vamos acompanhar o tempo desta noite. Tem que se cuidar, não é mesmo?','Noite tranquila por aqui. Bom descanso!','A noite está calma. Amanhã tem mais previsão!'],
          cloudy:['Hoje o céu está nublado. Tem que se cuidar, não é mesmo?','Céu nublado hoje. Vale levar um casaquinho!','Nuvens cobrindo o céu. Fica de olho na previsão!'],
          fog:['Hoje o céu está com neblina. Tem que se cuidar, não é mesmo?','Neblina lá fora! Cuidado redobrado no trânsito.']},
      es:{mild:['El tiempo está templado. ¡Con vaqueros y camisa, estoy preparado!','Temperatura agradable hoy. ¡Buen día para salir!','Ni frío ni calor. ¡Vaqueros y camisa y listo!','Qué buen clima hoy. ¡Aprovecha el día!'],
          sunny:['¡Qué buen día de sol! Hay que cuidarse, ¿verdad?','¡Sol fuerte hoy! No olvides el protector y el agua.','¡Qué día tan bonito! Ponte protector antes de salir, ¿vale?','¡Qué calorcito! Sombrero, protector y mucha agua.'],
          drizzle:['Está lloviznando. ¡Menos mal que traje el paraguas!','¡Está garuando! Paraguas en mano y vamos.','Llovizna fina afuera. ¡Mejor no salir sin paraguas!','Qué llovizna molesta, ¿no? Al menos traje el paraguas.'],
          rain:['¡Hoy vine preparado: impermeable y paraguas!','¡Día de lluvia! Impermeable, paraguas y cuidado en el tráfico.','¡Está lloviendo! Si puedes, sal más tarde.','Llueve afuera. ¡Cuidado con el suelo mojado!'],
          storm:['Hay tormenta. ¡Es mejor quedarse a resguardo!','Tormenta cerca. ¡Quédate en casa si puedes!','El tiempo se puso feo. ¡Mejor estar en un lugar seguro!'],
          cold:['Hace frío, pero no llueve. ¡Vine bien abrigado!','¡Hace fresquito hoy! Abrígate bien y vamos.','¡Hace frío! Hora de un café calentito.','¡Qué frío! No olvides el abrigo.'],
          snow:['¡Tiempo de nieve! Vine bien abrigado.','¡Nieve afuera! Guantes, gorro y abrigo.'],
          night:['Vamos a seguir el tiempo de esta noche. Hay que cuidarse, ¿verdad?','Noche tranquila por aquí. ¡Que descanses!','La noche está calma. ¡Mañana hay más pronóstico!'],
          cloudy:['Hoy el cielo está nublado. Hay que cuidarse, ¿verdad?','Cielo nublado hoy. ¡Lleva una chaquetita!','Nubes cubriendo el cielo. ¡Atento al pronóstico!'],
          fog:['Hoy el cielo está con niebla. Hay que cuidarse, ¿verdad?','¡Niebla afuera! Mucho cuidado en el tráfico.']},
      en:{mild:['Mild weather today. In jeans and a shirt, I am ready!','Pleasant temperature today. A good day to go out!','Not cold, not hot. Jeans and a shirt will do!','Lovely weather today. Enjoy your day!'],
          sunny:['What a lovely sunny day! You have to take care of yourself, right?','Strong sun today! Don’t forget sunscreen and water.','What a beautiful day! Put on sunscreen before you go out, okay?','Nice and warm! Hat, sunscreen and plenty of water.'],
          drizzle:['A little drizzle here. Good thing I brought my umbrella!','It is drizzling! Umbrella in hand and let’s go.','Light drizzle outside. Better not leave without an umbrella!','Annoying drizzle, right? At least I brought my umbrella.'],
          rain:['I came prepared today: raincoat and umbrella!','Rainy day! Raincoat, umbrella and careful on the roads.','It is raining! If you can, head out a bit later.','Rain outside. Watch out for wet floors!'],
          storm:['Stormy weather. It is better to stay sheltered!','Storm nearby. Stay home if you can!','The weather turned rough. Better stay somewhere safe!'],
          cold:['It is cold, but not raining. I dressed warmly!','A bit chilly today! Zip up your coat and let’s go.','It is cold! Time for a hot coffee.','Freezing out there! Don’t forget your jacket.'],
          snow:['Snowy weather! I dressed warmly.','Snow outside! Gloves, hat and coat.'],
          night:['Let’s keep an eye on tonight’s weather. You have to take care of yourself, right?','A quiet night here. Rest well!','The night is calm. More forecast tomorrow!'],
          cloudy:['Cloudy skies today. You have to take care of yourself, right?','Cloudy sky today. Worth bringing a light jacket!','Clouds covering the sky. Keep an eye on the forecast!'],
          fog:['Foggy weather today. You have to take care of yourself, right?','Fog outside! Extra care on the roads.']}
    }
  },
  pick(list){return list[this.turn%list.length];},
  lines(context,lang='pt'){
    const l=['pt','es','en'].includes(lang)?lang:'pt',c=context||{variant:'sunny',period:'morning',isDay:true,code:0};
    const care=this.pools.care[l];
    let kind=c.snow?'snow':c.variant;
    if(c.variant==='mild'&&!c.isDay)kind='night';
    else if(c.variant==='mild'&&c.code===3)kind='cloudy';
    else if(c.variant==='mild'&&[45,48].includes(c.code))kind='fog';
    let careLine=this.pick(care[kind]||care.mild);
    // Safety messages stay fixed: they must always be the same clear warning.
    // INMET warning: the wording varies, but every version keeps the safety advice.
    if(c.alert)careLine=this.pick(this.pools.alert[l]);
    const descriptions={pt:'Zé acompanha o tempo da sua cidade e muda de roupa conforme a previsão.',es:'Zé sigue el tiempo de tu ciudad y cambia de ropa según el pronóstico.',en:'Zé follows your city’s weather and changes outfits with the forecast.'};
    const warn={pt:'Se cuida! Está vindo uma tempestade com ventos fortes! Não fique embaixo nem perto de árvores e postes de luz.',es:'¡Cuídate! Viene una tormenta con vientos fuertes. No te quedes debajo ni cerca de árboles y postes de luz.',en:'Take care! A storm with strong winds is coming! Stay away from trees and power poles.'}[l];
    return {sunny:this.pick(this.pools.greet[l][c.period]||this.pools.greet[l].morning),care:careLine,storm:warn,description:descriptions[l]};
  },
  /* Every line Zé can say, used by the workflow that records the voice clips. */
  allLines(lang){
    const g=this.pools.greet[lang],c=this.pools.care[lang];
    return [...Object.values(g).flat(),...Object.values(c).flat(),...this.pools.alert[lang]];
  },
  asset(variant){return 'assets/ze-'+variant+'.webp'}
};
if(typeof module!=='undefined'&&module.exports)module.exports=AquaCharacterWeather;

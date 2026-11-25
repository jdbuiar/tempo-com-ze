/* Falas da praia do surfe (Zé, Niko, Brisa e Jorge), em português, espanhol e inglês.
   Usado pelo site (surf-ze.js) e pelo script que grava as vozes (scripts/gravar_voz.py). */
(function(root){
'use strict';
const ZE_LINES={
 pt:["Aloha, galera! Zé na área! Bora conferir o pico? Hang loose, bródi!", "Fala, surfista! Prancha na mão e olho no swell. Hang loose, bródi!", "E aí, galera do pico! Já conferiu o vento? Hang loose, bródi!", "Bora de surfe? Confere a maré antes de cair na água! Hang loose, bródi!", "Aloha! Antes da remada, dá uma olhada no período das ondas! Hang loose, bródi!", "Salve, galera! Protetor em dia e respeito no pico. Hang loose, bródi!", "Zé chegou! Se pintar trovoada, a sessão espera. Fechou, surfista? Hang loose, bródi!", "E aí, surfista! Respeita a vez da galera e curte o visual! Hang loose, bródi!", "Prancha debaixo do braço! Bora conferir as condições do pico? Hang loose, bródi!", "Fala, galera! Confere as bandeiras e troca ideia com o guarda-vidas. Aloha! Hang loose, bródi!"],
 es:["¡Aloha, gente! ¡Soy Zé! ¿Miramos cómo está el spot? ¡Hang loose!", "¡Qué tal, surfista! Tabla en mano y ojo al swell. ¡Hang loose!", "¡Buenas, gente del spot! ¿Ya miraste el viento? ¡Hang loose!", "¿Vamos al surf? ¡Consulta la marea antes de entrar al agua!", "¡Aloha! Antes de remar, mira el período de las olas.", "¡Buenas, gente! Protector solar y respeto en el spot. ¡Hang loose!", "¡Llegó Zé! Si hay tormenta, la sesión espera. ¿Vale, surfista?", "¡Qué tal, surfista! Respeta los turnos y disfruta de las vistas.", "¡Tabla bajo el brazo! ¿Miramos las condiciones del spot? ¡Hang loose!", "¡Buenas, gente! Mira las banderas y consulta al socorrista. ¡Aloha!"],
 en:["Aloha, crew! Zé here! Let's check the surf. Hang loose!", "Hey, surfer! Board in hand, eyes on the swell. Hang loose!", "Hey, surf crew! Have you checked the wind? Hang loose!", "Heading out? Check the tide before paddling into the lineup!", "Aloha! Before paddling out, take a look at the wave period.", "Hey, crew! Sunscreen on, respect in the lineup. Good waves!", "Zé is here! Thunderstorm coming? The session can wait. Right, surfer?", "Hey, surfer! Respect the lineup and enjoy the view. Hang loose!", "Board under my arm! Let's check the conditions at the spot. Aloha!", "Hey, crew! Check the beach flags and ask the lifeguard. Aloha!"]
};
const SOLO_LINES={
 niko:{
  pt:[["Aloha! Eu sou o Niko. O mar tá chamando, hein?","Confere o vento antes de remar. Hang loose!"],["E aí, galera! Niko na área.","Maré enchendo e prancha encerada. Bora!"],["Fala, surfista! Hoje é dia de remar bastante.","Respeita a vez no pico e boa sessão!"],["Opa! Já olhou o período das ondas?","Período longo é onda com mais força. Fica esperto!"],["Salve! Primeiro eu observo o mar uns minutos.","Depois escolho o canal pra entrar. Hang loose!"]],
  es:[["¡Aloha! Soy Niko. El mar está llamando, ¿eh?","Mira el viento antes de remar. ¡Hang loose!"],["¡Qué tal, gente! Llegó Niko.","Marea subiendo y tabla encerada. ¡Vamos!"],["¡Hola, surfista! Hoy toca remar mucho.","¡Respeta los turnos en el pico y buena sesión!"],["¡Ey! ¿Ya miraste el período de las olas?","Período largo, ola con más fuerza. ¡Atento!"],["¡Buenas! Primero miro el mar unos minutos.","Después elijo el canal para entrar. ¡Hang loose!"]],
  en:[["Aloha! I'm Niko. The ocean is calling, huh?","Check the wind before you paddle out. Hang loose!"],["Hey, crew! Niko is here.","Rising tide and a waxed board. Let's go!"],["Hey, surfer! Lots of paddling today.","Respect the lineup and have a great session!"],["Hey! Did you check the wave period?","Longer period means stronger waves. Stay sharp!"],["Hi! First I watch the sea for a few minutes.","Then I pick the channel to paddle out. Hang loose!"]]
 },
 brisa:{
  pt:[["Oi, gente! Eu sou a Brisa.","Bora pegar uma onda?"],["Protetor no rosto e parafina na prancha.","Agora é só cair na água!"],["Olha a bandeira antes de entrar, tá?","Vermelha é dia de ficar na areia."],["Vento terral deixa a onda lisinha.","Hoje eu quero pegar várias!"],["Prancha na mão e leash no pé.","Bora pegar uma onda?"]],
  es:[["¡Hola, gente! Soy Brisa.","¿Vamos a agarrar una ola?"],["Protector en la cara y parafina en la tabla.","¡Ahora, al agua!"],["Mira la bandera antes de entrar, ¿vale?","Roja es día de quedarse en la arena."],["El viento de tierra deja la ola lisita.","¡Hoy quiero agarrar varias!"],["Tabla en la mano e invento en el pie.","¿Vamos a agarrar una ola?"]],
  en:[["Hi, everyone! I'm Brisa.","Shall we catch a wave?"],["Sunscreen on my face and wax on my board.","Now let's hit the water!"],["Check the flag before you go in, okay?","Red means a day on the sand."],["Offshore wind makes the waves so smooth.","I want to catch a bunch today!"],["Board in hand and leash on.","Shall we catch a wave?"]]
 }
};
/* Duo chats: each line is [speaker, text]; A is Zé, Niko or Brisa, J is Jorge. {A} becomes the partner's name. */
const SURF_CHATS={
 pt:{
  mild:[[['J','Fala, {A}! Tudo certo?'],['A','Tudo! Tô indo ver como tá o mar.'],['J','Vento fraco hoje, deve estar bom.'],['A','Então até mais, Jorge!']],[['A','E aí, Jorge! Vai cair hoje?'],['J','Hoje só vou caminhar na areia.'],['A','Tempo bom pra isso!'],['J','Boas ondas, {A}!']]],
  rain:[[['J','Ô, {A}, com essa chuva?'],['A','Chuva fraca não atrapalha a onda.'],['J','Mas se trovejar, sai da água, hein!'],['A','Pode deixar, Jorge!']],[['A','Jorge, de capa amarela!'],['J','Em dia de chuva eu não saio sem ela.'],['A','Faz bem. Molhado eu já vou ficar!'],['J','Cuidado aí e boas ondas!']]],
  cold:[[['J','Brrr! Que frio, {A}!'],['A','Por isso eu vou de roupa de borracha.'],['J','A água deve estar gelada!'],['A','Gelada, mas a onda tá boa!']],[['A','Jorge, de cachecol e tudo!'],['J','Com esse vento frio, nem penso em entrar.'],['A','Eu vou rapidinho e depois tomo um chocolate quente!'],['J','Boa ideia! Até mais!']]],
  hot:[[['J','Calorão, hein, {A}!'],['A','Dia perfeito pra cair na água!'],['J','Passou protetor?'],['A','Passei! E vou beber bastante água também.']],[['A','Jorge! Também vai pro mar?'],['J','Vou dar um mergulho pra refrescar.'],['A','Entra perto do guarda-vidas, tá?'],['J','Combinado. Boas ondas!']]]
 },
 es:{
  mild:[[['J','¡Hola, {A}! ¿Todo bien?'],['A','¡Todo! Voy a ver cómo está el mar.'],['J','Hoy hay poco viento, debe estar bueno.'],['A','¡Hasta luego, Jorge!']],[['A','¡Ey, Jorge! ¿Hoy entras al agua?'],['J','Hoy solo voy a caminar por la arena.'],['A','¡Buen tiempo para eso!'],['J','¡Buenas olas, {A}!']]],
  rain:[[['J','Oye, {A}, ¿con esta lluvia?'],['A','La lluvia débil no arruina la ola.'],['J','Pero si truena, ¡sal del agua!'],['A','¡Claro, Jorge!']],[['A','¡Jorge, con impermeable amarillo!'],['J','Los días de lluvia no salgo sin él.'],['A','Haces bien. ¡Yo me voy a mojar igual!'],['J','¡Cuidado y buenas olas!']]],
  cold:[[['J','¡Brrr! ¡Qué frío, {A}!'],['A','Por eso voy con traje de neopreno.'],['J','¡El agua debe estar helada!'],['A','¡Helada, pero la ola está buena!']],[['A','¡Jorge, con bufanda y todo!'],['J','Con este viento frío, ni pienso en entrar.'],['A','¡Yo voy un ratito y después un chocolate caliente!'],['J','¡Buena idea! ¡Hasta luego!']]],
  hot:[[['J','¡Qué calor, {A}!'],['A','¡Día perfecto para meterse al agua!'],['J','¿Te pusiste protector?'],['A','¡Sí! Y voy a tomar mucha agua también.']],[['A','¡Jorge! ¿También vas al mar?'],['J','Voy a darme un chapuzón para refrescarme.'],['A','Entra cerca del socorrista, ¿vale?'],['J','Hecho. ¡Buenas olas!']]]
 },
 en:{
  mild:[[['J','Hey, {A}! All good?'],['A','All good! Going to check the surf.'],['J','Light wind today, should be nice.'],['A','See you later, Jorge!']],[['A','Hey, Jorge! Paddling out today?'],['J','Just a walk on the sand today.'],['A','Great weather for it!'],['J','Good waves, {A}!']]],
  rain:[[['J','Hey, {A}, in this rain?'],['A','Light rain doesn\'t ruin the waves.'],['J','But if it thunders, get out of the water!'],['A','Will do, Jorge!']],[['A','Jorge, rocking the yellow raincoat!'],['J','I never go out without it when it rains.'],['A','Smart. I\'m getting wet anyway!'],['J','Take care and good waves!']]],
  cold:[[['J','Brrr! So cold, {A}!'],['A','That\'s why I\'m wearing a wetsuit.'],['J','The water must be freezing!'],['A','Freezing, but the waves are good!']],[['A','Jorge, scarf and all!'],['J','With this cold wind, I\'m staying dry.'],['A','Just a quick session, then hot chocolate!'],['J','Good plan! See you!']]],
  hot:[[['J','So hot today, {A}!'],['A','Perfect day to hit the water!'],['J','Got your sunscreen on?'],['A','Yes! And I\'m drinking lots of water too.']],[['A','Jorge! Heading to the sea too?'],['J','Just a dip to cool off.'],['A','Swim near the lifeguard, okay?'],['J','Deal. Good waves!']]]
 }
};
/* Zé is in street clothes in his chats with Jorge: he came to look at the sea, not to surf. */
const ZE_CHATS={
 pt:{mild:[[['J','Fala, Zé! Indo pra praia?'],['A','Só ver o mar e como tá o tempo.'],['J','Tá agradável hoje, né?'],['A','Tá ótimo! Até mais, Jorge!']]],rain:[[['A','Jorge! Também de capa?'],['J','Com essa chuva, não tem jeito.'],['A','Se trovejar, ninguém fica na água, hein!'],['J','Isso aí, Zé. Até mais!']]],cold:[[['J','Zé, que frio, hein!'],['A','Hoje é dia de ver o mar de casaco.'],['J','E de tomar um café quentinho depois!'],['A','Boa! Até mais, Jorge!']]],hot:[[['A','Calorão, Jorge!'],['J','Bom demais pra um mergulho!'],['A','Protetor e muita água, combinado?'],['J','Combinado, Zé! Valeu!']]]},
 es:{mild:[[['J','¡Hola, Zé! ¿Vas a la playa?'],['A','Solo a ver el mar y cómo está el tiempo.'],['J','Hoy está agradable, ¿no?'],['A','¡Está genial! Hasta luego, Jorge.']]],rain:[[['A','¡Jorge! ¿Tú también con impermeable?'],['J','Con esta lluvia, no queda otra.'],['A','Si truena, nadie se queda en el agua, ¿eh?'],['J','Así es, Zé. ¡Hasta luego!']]],cold:[[['J','¡Zé, qué frío!'],['A','Hoy toca ver el mar con abrigo.'],['J','¡Y tomar un café calentito después!'],['A','¡Buena idea! Hasta luego, Jorge.']]],hot:[[['A','¡Qué calor, Jorge!'],['J','¡Perfecto para un chapuzón!'],['A','Protector y mucha agua, ¿vale?'],['J','¡Hecho, Zé! ¡Gracias!']]]},
 en:{mild:[[['J','Hey, Zé! Off to the beach?'],['A','Just checking the sea and the weather.'],['J','Nice day today, right?'],['A','Lovely! See you, Jorge!']]],rain:[[['A','Jorge! Raincoat too?'],['J','In this rain, no choice.'],['A','If it thunders, everybody out of the water!'],['J','That\'s right, Zé. See you!']]],cold:[[['J','Zé, so cold!'],['A','A coat day for looking at the sea.'],['J','And a hot coffee afterwards!'],['A','Good one! See you, Jorge!']]],hot:[[['A','So hot, Jorge!'],['J','Perfect for a dip!'],['A','Sunscreen and plenty of water, deal?'],['J','Deal, Zé! Thanks!']]]}
};
const UI={pt:{tag:'BOAS ONDAS',describe:n=>n+' na praia, perto da seção de surfe.'},es:{tag:'BUENAS OLAS',describe:n=>n+' en la playa, junto a la sección de surf.'},en:{tag:'GOOD WAVES',describe:n=>n+' on the beach, by the surf section.'}};

/* Every line with who says it, for the voice recorder. A in duo chats is the partner (ze, niko or brisa), J is Jorge. */
function allLines(){const out=[];for(const lang of ['pt','es','en']){
 for(const who of ['niko','brisa'])for(const pair of SOLO_LINES[who][lang])for(const text of pair)out.push({lang,voice:who,text});
 for(const w of ['mild','rain','cold','hot']){
  for(const chat of SURF_CHATS[lang][w])for(const who of ['niko','brisa'])for(const [s,text] of chat)out.push({lang,voice:s==='J'?'jorge':who,text:text.replace('{A}',who==='niko'?'Niko':'Brisa')});
  for(const chat of ZE_CHATS[lang][w])for(const [s,text] of chat)out.push({lang,voice:s==='J'?'jorge':'ze',text});}}
 const seen=new Set();return out.filter(l=>{const k=l.lang+'|'+l.voice+'|'+l.text;if(seen.has(k))return false;seen.add(k);return true;});}
const SurfFalas={ZE_LINES,SOLO_LINES,SURF_CHATS,ZE_CHATS,UI,allLines};
if(typeof module!=='undefined'&&module.exports)module.exports=SurfFalas;else root.SurfFalas=SurfFalas;
})(typeof window!=='undefined'?window:globalThis);

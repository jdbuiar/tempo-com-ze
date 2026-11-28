"""(Também grava as falas do comercial, de scripts/comercial.json.) Grava em mp3 toda fala nova que ainda não tem áudio: as do Zé (character-weather.js) e as da praia do
surfe (surf-falas.js), cada personagem com a sua voz. Roda no GitHub Actions, que tem acesso ao serviço de voz."""
import asyncio, hashlib, json, re, subprocess, pathlib
import edge_tts

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PASTA = RAIZ / 'assets' / 'ze-voice-natural'
MANIFEST = PASTA / 'manifest.json'

falas = json.loads(subprocess.check_output(['node', '-e',
    "const W=require('./character-weather.js');console.log(JSON.stringify({pt:W.allLines('pt'),es:W.allLines('es'),en:W.allLines('en')}))"],
    cwd=RAIZ, text=True))
m = json.loads(MANIFEST.read_text(encoding='utf-8'))

# Vozes da praia: a primeira que o serviço aceitar vira a voz fixa do personagem naquele idioma.
CANDIDATAS = {
    'ze':    {'pt': [('pt-BR-AntonioNeural', {})], 'es': [('es-ES-AlvaroNeural', {})], 'en': [('en-US-GuyNeural', {})]},
    'brisa': {'pt': [('pt-BR-FranciscaNeural', {}), ('pt-BR-ThalitaMultilingualNeural', {})],
              'es': [('es-ES-ElviraNeural', {})], 'en': [('en-US-AriaNeural', {}), ('en-US-JennyNeural', {})]},
    # Niko é surfista jovem e animado: voz mais leve, um pouco mais rápida e mais aguda
    'niko':  {'pt': [('pt-BR-AntonioNeural', {'rate': '+10%', 'pitch': '+16Hz'})],   # português nativo, sem sotaque
              'es': [('es-AR-TomasNeural', {'rate': '+12%', 'pitch': '+8Hz'}), ('es-ES-AlvaroNeural', {'pitch': '+12Hz', 'rate': '+10%'})],
              'en': [('en-AU-WilliamMultilingualNeural', {'rate': '+10%', 'pitch': '+6Hz'}), ('en-US-AndrewNeural', {'rate': '+12%', 'pitch': '+8Hz'})]},
    'jorge': {'pt': [('pt-BR-AntonioNeural', {'pitch': '-22Hz', 'rate': '-8%'})],   # português nativo, sem sotaque
              'es': [('es-MX-JorgeNeural', {}), ('es-ES-AlvaroNeural', {'pitch': '-14Hz', 'rate': '-6%'})],
              'en': [('en-US-ChristopherNeural', {}), ('en-US-EricNeural', {})]},
}
SURF = PASTA / 'surf'


async def gravar(texto, voz, ajuste, destino, tentativas=3):
    for vez in range(tentativas):
        try:
            await edge_tts.Communicate(texto, voz, **ajuste).save(str(destino))
            if destino.stat().st_size < 1000:
                raise RuntimeError('áudio vazio')
            return
        except Exception:
            if vez == tentativas - 1:
                raise
            await asyncio.sleep(3 * (vez + 1))


async def escolher(quem, lang):
    salvo = m.setdefault('surfVoices', {}).setdefault(quem, {}).get(lang)
    if salvo:
        return salvo['voice'], salvo.get('opts', {})
    for voz, ajuste in CANDIDATAS[quem][lang]:
        try:
            await gravar({'pt': 'Olá, tudo bem?', 'es': 'Hola, ¿qué tal?', 'en': 'Hello, how are you?'}[lang], voz, ajuste, SURF / 'teste.mp3', 1)
            m['surfVoices'][quem][lang] = {'voice': voz, 'opts': ajuste}
            print('voz escolhida', quem, lang, voz, ajuste)
            return voz, ajuste
        except Exception as erro:
            print('voz indisponível', voz, erro)
    raise RuntimeError(f'nenhuma voz para {quem} em {lang}')


async def praia():
    falas_praia = json.loads(subprocess.check_output(['node', '-e',
        "console.log(JSON.stringify(require('./surf-falas.js').allLines()))"], cwd=RAIZ, text=True))
    SURF.mkdir(exist_ok=True)
    novas = 0
    for f in falas_praia:
        clips = m.setdefault('surf', {}).setdefault(f['lang'], {}).setdefault(f['voice'], {})
        if f['text'] in clips:
            continue
        voz, ajuste = await escolher(f['voice'], f['lang'])
        nome = f"{f['voice']}-{f['lang']}-{hashlib.sha1((f['text'] + voz + json.dumps(ajuste, sort_keys=True)).encode()).hexdigest()[:8]}.mp3"
        try:
            await gravar(f['text'], voz, ajuste, SURF / nome)
        except Exception as erro:   # uma fala que falhar fica sem voz até a próxima rodada; o resto é salvo
            print('falhou', f['voice'], f['lang'], f['text'], erro)
            continue
        clips[f['text']] = f"assets/ze-voice-natural/surf/{nome}"
        novas += 1
        print('gravada', f['voice'], f['lang'], f['text'])
    (SURF / 'teste.mp3').unlink(missing_ok=True)
    return novas


async def comercial():
    """Falas do comercial (scripts/comercial.json) gravadas em comercial/ID.mp3, com a mesma voz de cada personagem no site."""
    lista = json.loads((RAIZ / 'scripts' / 'comercial.json').read_text(encoding='utf-8'))
    pasta = RAIZ / 'comercial'
    pasta.mkdir(exist_ok=True)
    for f in lista:
        destino = pasta / f"{f['id']}.mp3"
        texto_salvo = pasta / f"{f['id']}.txt"
        assinatura = f['texto'] + json.dumps([f.get('edge'), f.get('ajuste')])
        if destino.exists() and texto_salvo.exists() and texto_salvo.read_text(encoding='utf-8') in (f['texto'], assinatura) and not f.get('edge'):
            continue
        if f.get('edge') and texto_salvo.exists() and texto_salvo.read_text(encoding='utf-8') == assinatura:
            continue
        if f.get('edge'):   # voz escolhida só para o comercial (ex.: Jorge em português nativo, mais fácil de entender)
            voz, ajuste = f['edge'], f.get('ajuste', {})
        else:
            voz, ajuste = (m['voices']['pt'], {}) if f['voz'] == 'ze' else await escolher(f['voz'], 'pt')
        try:
            await gravar(f['texto'], voz, ajuste, destino)
            texto_salvo.write_text(assinatura if f.get('edge') else f['texto'], encoding='utf-8')
            print('comercial gravado', f['id'])
        except Exception as erro:
            print('comercial falhou', f['id'], erro)


async def main():
    await comercial()
    novas = await praia()
    for lang, lista in falas.items():
        clips = m['clips'].setdefault(lang, {})
        for texto in lista:
            if texto in clips:
                continue
            nome = f"{lang}-v-{hashlib.sha1(texto.encode()).hexdigest()[:8]}.mp3"
            await edge_tts.Communicate(texto, m['voices'][lang]).save(str(PASTA / nome))
            clips[texto] = f"assets/ze-voice-natural/{nome}"
            novas += 1
            print('gravada', lang, texto)
    if not novas:
        print('nada novo para gravar')
        return
    MANIFEST.write_text(json.dumps(m, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    # Muda a versão do manifest e do script de voz para o navegador buscar os áudios novos.
    voz = RAIZ / 'ze-voice.js'
    t = voz.read_text(encoding='utf-8')
    voz.write_text(re.sub(r'manifest\.json\?v=(\d+)', lambda x: f'manifest.json?v={int(x[1]) + 1}', t), encoding='utf-8')
    idx = RAIZ / 'index.html'
    t = idx.read_text(encoding='utf-8')
    idx.write_text(re.sub(r'ze-voice\.js\?v=(\d+)', lambda x: f'ze-voice.js?v={int(x[1]) + 1}', t), encoding='utf-8')

asyncio.run(main())

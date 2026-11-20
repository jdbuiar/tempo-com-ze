"""Grava em mp3 toda fala nova do Zé (character-weather.js) que ainda não tem áudio.
Roda no GitHub Actions, que tem acesso ao serviço de voz. Usa as mesmas vozes do manifest."""
import asyncio, hashlib, json, re, subprocess, pathlib
import edge_tts

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PASTA = RAIZ / 'assets' / 'ze-voice-natural'
MANIFEST = PASTA / 'manifest.json'

falas = json.loads(subprocess.check_output(['node', '-e',
    "const W=require('./character-weather.js');console.log(JSON.stringify({pt:W.allLines('pt'),es:W.allLines('es'),en:W.allLines('en')}))"],
    cwd=RAIZ, text=True))
m = json.loads(MANIFEST.read_text(encoding='utf-8'))

async def main():
    novas = 0
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

/* Tempo com Zé: caixa de comentários (elogio, sugestão, reclamação).
   Os comentários vão para a tabela ze_comentarios no Supabase, que só aceita envio (ninguém lê pelo site). */
(() => {
'use strict';
const API = 'https://xanrzaeoapwziancxykj.supabase.co/rest/v1/ze_comentarios';
const KEY = 'sb_publishable_czmW7Ij1VQqDeZ_tXUxM4g_xG1Mfj-c';
const EMAIL = 'jdb8648@gmail.com';

const T = {
  pt: {eyebrow:'SUA OPINIÃO', title:'Fale com o Zé', text:'Achou algo errado, tem uma ideia ou quer deixar um elogio? Conta pra gente.', button:'Deixe seu comentário', or:'Ou escreva para', dialog:'Deixe seu comentário', kinds:{elogio:'Elogio', sugestao:'Sugestão', reclamacao:'Reclamação'}, message:'Seu comentário', placeholder:'Escreva aqui o que você achou…', name:'Seu nome (opcional)', contact:'E-mail ou telefone para resposta (opcional)', send:'Enviar', sending:'Enviando…', thanks:'Valeu! Seu comentário chegou para o Zé.', short:'Escreva pelo menos algumas palavras.', error:'Não deu para enviar agora. Tente de novo ou escreva para '+EMAIL+'.', close:'Fechar'},
  es: {eyebrow:'TU OPINIÓN', title:'Habla con Zé', text:'¿Encontraste algo mal, tienes una idea o quieres dejar un elogio? Cuéntanos.', button:'Deja tu comentario', or:'O escribe a', dialog:'Deja tu comentario', kinds:{elogio:'Elogio', sugestao:'Sugerencia', reclamacao:'Queja'}, message:'Tu comentario', placeholder:'Escribe aquí lo que te pareció…', name:'Tu nombre (opcional)', contact:'Correo o teléfono para responderte (opcional)', send:'Enviar', sending:'Enviando…', thanks:'¡Gracias! Tu comentario le llegó a Zé.', short:'Escribe al menos algunas palabras.', error:'No se pudo enviar ahora. Inténtalo de nuevo o escribe a '+EMAIL+'.', close:'Cerrar'},
  en: {eyebrow:'YOUR FEEDBACK', title:'Talk to Zé', text:'Found something wrong, have an idea or want to leave a compliment? Let us know.', button:'Leave a comment', or:'Or write to', dialog:'Leave a comment', kinds:{elogio:'Compliment', sugestao:'Suggestion', reclamacao:'Complaint'}, message:'Your comment', placeholder:'Tell us what you think…', name:'Your name (optional)', contact:'Email or phone for a reply (optional)', send:'Send', sending:'Sending…', thanks:'Thanks! Your comment reached Zé.', short:'Please write at least a few words.', error:'Could not send right now. Try again or write to '+EMAIL+'.', close:'Close'}
};
const lang = () => { const v = document.getElementById('language')?.value; return T[v] ? v : 'pt'; };
const t = () => T[lang()];

const css = document.createElement('style');
css.textContent = `
.feedback-card{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:26px 28px;margin-top:18px}
.feedback-card h2{font-size:22px;margin:4px 0 6px}
.feedback-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.feedback-actions{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}
.feedback-actions .primary-button{margin:0;cursor:pointer;font-size:13px}
.feedback-mail{font-size:12px;color:var(--muted)}
.feedback-mail a{color:var(--accent);font-weight:600;text-decoration:none}
.feedback-mail a:hover{text-decoration:underline}
#feedback-dialog form{display:flex;flex-direction:column;gap:12px}
.feedback-kinds{display:flex;gap:8px;flex-wrap:wrap}
.feedback-kinds button{border:1px solid #ffffffb0;background:#ffffff55;color:var(--ink);border-radius:20px;padding:8px 14px;font-size:12px;cursor:pointer}
.feedback-kinds button[aria-pressed="true"]{background:#267e91;color:#f1ffff;border-color:#b2e2e6}
#feedback-dialog label{font-size:11px;color:#567782;display:flex;flex-direction:column;gap:5px}
#feedback-dialog textarea,#feedback-dialog input{font:inherit;font-size:14px;color:var(--ink);background:#ffffff80;border:1px solid #ffffffc0;border-radius:14px;padding:11px 13px;outline:none}
#feedback-dialog textarea{min-height:120px;resize:vertical}
#feedback-dialog textarea:focus,#feedback-dialog input:focus{border-color:#267e91}
.feedback-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.feedback-status{font-size:12px;min-height:16px;margin:0;color:#597b85}
.feedback-status.ok{color:#1f7a4d;font-weight:600}
.feedback-status.bad{color:#a4452f}
#feedback-dialog .primary-button{align-self:flex-end;cursor:pointer;font-size:13px}
#feedback-dialog .primary-button:disabled{opacity:.6;cursor:default}
@media(max-width:700px){.feedback-card{flex-direction:column;align-items:flex-start}.feedback-actions{align-items:flex-start}}`;
document.head.append(css);

const card = document.createElement('section');
card.className = 'glass feedback-card';
card.id = 'comentarios';
card.innerHTML = `<div><p class="eyebrow" data-fb="eyebrow"></p><h2 data-fb="title"></h2><p data-fb="text"></p></div>
<div class="feedback-actions"><button type="button" class="primary-button" id="feedback-open" data-fb="button"></button>
<span class="feedback-mail"><span data-fb="or"></span> <a href="mailto:${EMAIL}?subject=Tempo%20com%20Z%C3%A9">${EMAIL}</a></span></div>`;
const anchor = document.querySelector('.knowledge-grid');
(anchor || document.querySelector('main')).after(card);

const dlg = document.createElement('dialog');
dlg.id = 'feedback-dialog';
dlg.innerHTML = `<div class="dialog-heading"><h2 data-fb="dialog"></h2><button type="button" class="icon-button" id="feedback-close">×</button></div>
<form novalidate>
<div class="feedback-kinds" role="group"></div>
<label><span data-fb="message"></span><textarea id="feedback-text" maxlength="2000" required></textarea></label>
<label><span data-fb="name"></span><input id="feedback-name" maxlength="80" autocomplete="name"></label>
<label><span data-fb="contact"></span><input id="feedback-contact" maxlength="120" autocomplete="email"></label>
<div class="feedback-hp" aria-hidden="true"><input id="feedback-site" tabindex="-1" autocomplete="off"></div>
<p class="feedback-status" id="feedback-status" role="status"></p>
<button type="submit" class="primary-button" id="feedback-send"></button>
</form>`;
document.body.append(dlg);

let kind = 'sugestao', openedAt = 0;
const kindsBox = dlg.querySelector('.feedback-kinds');
const status = dlg.querySelector('#feedback-status');
const sendBtn = dlg.querySelector('#feedback-send');

function translate() {
  const x = t();
  document.querySelectorAll('[data-fb]').forEach(el => { el.textContent = x[el.dataset.fb]; });
  dlg.querySelector('#feedback-text').placeholder = x.placeholder;
  dlg.querySelector('#feedback-close').setAttribute('aria-label', x.close);
  if (!sendBtn.disabled) sendBtn.textContent = x.send;
  kindsBox.replaceChildren(...Object.entries(x.kinds).map(([k, label]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.setAttribute('aria-pressed', String(k === kind));
    b.onclick = () => { kind = k; kindsBox.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', String(o === b))); };
    return b;
  }));
}

function cityNow() {
  try { return document.getElementById('location-name')?.textContent?.trim().slice(0, 120) || null; } catch { return null; }
}

document.getElementById('feedback-open').onclick = () => {
  status.textContent = ''; status.className = 'feedback-status';
  openedAt = Date.now(); dlg.showModal();
  setTimeout(() => dlg.querySelector('#feedback-text').focus(), 50);
};
dlg.querySelector('#feedback-close').onclick = () => dlg.close();
dlg.addEventListener('click', e => { const r = dlg.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close(); });

dlg.querySelector('form').addEventListener('submit', async e => {
  e.preventDefault();
  const x = t();
  const msg = dlg.querySelector('#feedback-text').value.trim();
  if (msg.length < 3) { status.textContent = x.short; status.className = 'feedback-status bad'; return; }
  /* robôs: campo escondido preenchido ou envio instantâneo */
  if (dlg.querySelector('#feedback-site').value || Date.now() - openedAt < 2000) { status.textContent = x.thanks; status.className = 'feedback-status ok'; return; }
  sendBtn.disabled = true; sendBtn.textContent = x.sending; status.textContent = ''; status.className = 'feedback-status';
  const body = {
    tipo: kind, mensagem: msg.slice(0, 2000),
    nome: dlg.querySelector('#feedback-name').value.trim().slice(0, 80) || null,
    contato: dlg.querySelector('#feedback-contact').value.trim().slice(0, 120) || null,
    cidade: cityNow(), idioma: lang(), pagina: location.pathname.slice(0, 200)
  };
  try {
    const r = await fetch(API, {method:'POST', headers:{'Content-Type':'application/json', apikey:KEY, Prefer:'return=minimal'}, body: JSON.stringify(body)});
    if (!r.ok) throw Error(r.status);
    status.textContent = x.thanks; status.className = 'feedback-status ok';
    dlg.querySelector('form').reset();
    setTimeout(() => { if (dlg.open) dlg.close(); }, 2200);
  } catch {
    status.textContent = x.error; status.className = 'feedback-status bad';
  } finally {
    sendBtn.disabled = false; sendBtn.textContent = x.send;
  }
});

document.getElementById('language')?.addEventListener('change', translate);
translate();
})();

# Tempo com Zé

Site completo em HTML, CSS e JavaScript, pronto para hospedagem estática. Inclui o visual de vidro azul, a previsão do tempo, o quadro de surfe, os personagens animados e todas as gravações masculinas em português, espanhol e inglês.

## Colocar no GitHub

1. Extraia este ZIP.
2. Abra a pasta `tempo-com-ze`.
3. Envie **o conteúdo dessa pasta** para a raiz do repositório. O `index.html` deve ficar na raiz, junto dos arquivos JavaScript, CSS e da pasta `assets`.
4. Para publicar com GitHub Pages, abra **Settings → Pages** no repositório.
5. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
6. Selecione a branch que contém os arquivos (normalmente `main`) e a pasta **/ (root)**. Salve.

O projeto não precisa de instalação de dependências nem de comando de build.

Referências oficiais:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Testar no computador

Na pasta onde está o `index.html`, execute:

```bash
python -m http.server 8000
```

Abra http://localhost:8000 no navegador. Use um servidor HTTP: abrir o HTML diretamente como arquivo pode impedir o carregamento dos áudios e dos dados. A previsão exige conexão com a internet.

## Arquivos

| Arquivo ou pasta | Conteúdo |
| --- | --- |
| `index.html` | Página principal |
| `style.css`, `surf.css` | Visual e adaptação para celular |
| `app.js`, `i18n.js`, `navigation.js`, `city-search.js` | Previsão, busca, idiomas e navegação com seleção correta dos botões |
| `surf.js` | Previsão marinha e os 16 picos em nove estados |
| `character.js`, `character-weather.js`, `walk-motion.js` | Animação e roupas do Zé conforme o clima |
| `surf-ze.js` | Entrada, falas variadas, hang loose e saída do Zé surfista |
| `ze-voice.js` | Reprodução das vozes masculinas |
| `assets/` | Todas as imagens, sprites, áudios e o catálogo de falas |

## Funcionamento atual

- Previsões meteorológicas e marinhas: Open-Meteo; qualidade do ar: CAMS via Open-Meteo; cidades: GeoNames via Open-Meteo.
- Os quadros consultam novos dados a cada 15 minutos enquanto a página está aberta. A atualização no servidor às 6h, 12h e 18h e a média de oito serviços ainda não estão implementadas.
- O Simepar ainda não está integrado. Seu acesso depende da resposta ao pedido enviado.
- A curva do nível do mar é uma estimativa de modelo. A página oferece o link para a tábua oficial da Marinha.
- As vozes são arquivos locais, sem chave de serviço de voz. O áudio usa velocidade normal; o Zé termina a fala antes de sair. Conforme a política do navegador, o som pode depender do primeiro toque comum na página; não há botão de ativação.
- Favoritos, idioma, unidade e sequência de frases ficam no navegador de cada visitante.
- A hospedagem original fornece seu próprio controle de acesso. Este pacote estático não inclui um servidor de login.
- O nome `www.tempocomze.com.br` aparece na identidade do projeto. Publicar este ZIP não registra nem configura o domínio: DNS e domínio personalizado são configurados na hospedagem escolhida.
- Mantenha os créditos exibidos na página e consulte os termos de uso e os limites da API: https://open-meteo.com/en/terms.

## Alterações incluídas nesta atualização

- Imagens convertidas para WebP: a pasta de imagens caiu de cerca de 14 MB para menos de 3 MB, sem perda visível. O logo do Zé passou de 2 MB para 23 KB. Favicon e ícone do iPhone ficaram em PNG pequeno.
- Removida a imagem sun-walk-cycle-v2.png, que não era usada, e os estilos que sobraram do antigo botão do Zé no surfe.
- Balão de fala do Zé no celular não é mais cortado na borda direita do cartão.
- Arquivo CNAME com www.tempocomze.com.br para o GitHub Pages.

- Falas em português do Zé surfista encerram com “Hang loose, bródi!”, com gravações masculinas atualizadas.

- Aparição do Zé independente da liberação do áudio: a animação entra automaticamente, mesmo se o navegador exigir o primeiro toque comum para liberar som.

- Busca por Nova York, Nova Iorque, New York e NYC corrigida: a cidade dos Estados Unidos aparece primeiro; estado e país distinguem as homônimas. As buscas das demais cidades foram preservadas.

- Botões de vidro azul no topo: Hoje, 15 dias, Mapa, Detalhes e Surfe, também visíveis no celular.
- Hoje volta ao topo e permanece selecionado corretamente.
- Removidos os botões Chamar o Zé e Ouvir: entrada e falas automáticas, respeitando a política de áudio do navegador.
- Zé de jeans e camisa para tempo ameno ou nublado, sem gesto de passar protetor. As roupas de verão ficam reservadas a dias quentes com sol.
- Ciclo de chuvisco com dez quadros e alinhamento dos pés e do corpo na ida e na volta.
- Menor espera antes da segunda fala, com o último tempo aprovado.
- Links de avisos do INMET atualizados no quadro geral e no surfe: https://avisos.inmet.gov.br/.

Exportação da versão aprovada em 04/11/2026.




Revisão de origem: `3caea1fe59fab802ff185ec037f899373c2e6966`.

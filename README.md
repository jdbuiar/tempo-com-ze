# Tempo com Zé

Site de previsão do tempo e do mar com o Zé, um personagem que muda de roupa conforme o céu e fala com o visitante em português, espanhol e inglês.

No ar em https://www.tempocomze.com.br

## Como funciona

Site estático (HTML, CSS e JavaScript puro), publicado pelo GitHub Pages a partir da branch `main`, pasta raiz. Não tem build nem dependências para instalar.

### De onde vêm os dados

| O quê | Fonte |
| --- | --- |
| Previsão por hora e de 15 dias | Open-Meteo |
| Previsão do mar (surfe) | Open-Meteo Marine |
| Qualidade do ar | CAMS, via Open-Meteo |
| Busca de cidades | GeoNames, via Open-Meteo |
| Nome da cidade pela localização | BigDataCloud |
| Condição de "agora" medida de verdade | Worker `ze-obs` na Cloudflare (METAR da estação de aeroporto mais próxima) |
| Chuva caindo agora | Radar da RainViewer |
| Avisos meteorológicos oficiais | Worker `ze-avisos` na Cloudflare, que consulta o INMET. Se o Worker falhar, o site consulta o INMET direto |
| Mapa | Windy (carrega só quando o visitante abre) |
| Comentários dos visitantes | Tabela `ze_comentarios` no Supabase (só aceita envio, ninguém lê pelo site) |

Os dois Workers ficam na conta Cloudflare do site (buiarjefferson). A API de estações do INMET não está liberada: o INMET só dá acesso com Acordo de Cooperação Técnica (ACT) firmado com uma instituição. Por isso o "agora" vem do METAR de aeroporto e do radar.

### Regras do Zé

- Medição real (aeroporto e radar) vale mais que o modelo para o "agora".
- Só corre avisando de tempestade com vento forte (rajadas de 60 km/h ou mais), granizo, ou trovoada com vento forte ou chuva forte, agora ou na próxima hora.
- Com aviso oficial do INMET de nível Perigo ou Grande Perigo, ele fala do aviso e manda ficar longe de árvores e postes. Só corre se o céu também confirmar.
- Céu só nublado não vira roupa de tempestade, mesmo com aviso no dia.
- Protetor solar só com céu limpo, de dia e com 24 °C ou mais. Com nuvens fechando, fica de jeans.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página principal |
| `style.css`, `surf.css` | Visual e adaptação para celular |
| `app.js` | Previsão, medição real, radar, gráficos, mapa |
| `i18n.js`, `navigation.js`, `city-search.js` | Idiomas, navegação e busca de cidades |
| `inmet-alerts.js` | Avisos oficiais do INMET |
| `surf.js`, `surf-ze.js` | Os 16 picos de surfe e o Zé surfista |
| `character.js`, `character-weather.js`, `walk-motion.js` | Animação e roupas do Zé |
| `ze-voice.js`, `ze-touch.js` | Voz do Zé e toque para falar |
| `feedback.js` | Caixa "Deixe seu comentário" |
| `install.js`, `sw.js`, `manifest.webmanifest` | Instalar como app e funcionar sem internet |
| `assets/` | Sprites do Zé (.webp), ícones e as falas gravadas (`assets/ze-voice-natural/`) |

## Atualizar o site

1. Altere os arquivos e envie para a branch `main`.
2. Ao mudar um `.js` ou `.css`, aumente o número `?v=` dele no `index.html`. Sem isso, quem já visitou continua com a versão antiga guardada no celular.
3. O GitHub Pages publica em cerca de 1 minuto.

## Testar no computador

Na pasta do projeto:

```bash
python -m http.server 8000
```

Abra http://localhost:8000. Abrir o `index.html` direto como arquivo impede o carregamento dos áudios e dos dados.

## Créditos

Mantenha os créditos exibidos na página e respeite os termos e limites da Open-Meteo: https://open-meteo.com/en/terms

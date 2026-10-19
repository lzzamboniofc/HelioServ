HELIOSERV V3 — HTML + CSS + Bootstrap + JavaScript

Estrutura:
- index.html
- assets/css/style.css   (mobile-first, comentado por seção)
- assets/js/main.js      (configurações no topo: número do WhatsApp e premissas do simulador)
- assets/img/favicon.svg

O que mudou na V3:
- Simulador real: estima consumo (kWh), potência (kWp), número de placas e área de telhado
  a partir da conta e da tarifa. Premissas editáveis no objeto SIM em main.js.
- Serviços, componentes e FAQ agora estão no HTML (indexáveis pelo Google).
- Schema LocalBusiness completo (área atendida, contatos) + Schema FAQPage.
- Open Graph com imagem, favicon e fonte Inter carregada de fato.
- Número do WhatsApp unificado (Hélio) em botões, Schema e links.
- Formulário com telefone, cidade e conta média; validação; honeypot anti-spam; aviso de privacidade.
- Seção de depoimentos fictícia substituída por "Confiança", com links para Instagram e avaliações do Facebook.
- Acessibilidade: link "pular para o conteúdo", foco visível, cards como botões,
  abas navegáveis por teclado, modal com título, contraste do amarelo corrigido.
- Desempenho: imagens com width/height e lazy loading, scripts com defer, preload da imagem principal.
- Links do WhatsApp funcionam mesmo sem JavaScript.

PENDÊNCIAS ANTES DE PUBLICAR:
1. Trocar as fotos do Unsplash por fotos reais de obras e da equipe (maior ganho de credibilidade).
2. Quando houver domínio, descomentar a tag <link rel="canonical"> no <head> e trocar a og:image por uma foto própria.
3. Conferir com a HelioServ as premissas do simulador (irradiação, placa de referência, tarifa padrão).
4. Se tiver perfil no Google Meu Negócio, trocar o link de avaliações do Facebook pelo do Google.

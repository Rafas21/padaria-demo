# Panificadora Bom Fermento: site de demonstração

## 1. O que é

É um site de uma página para uma padaria de bairro **fictícia** no Setor Campinas, em Goiânia. Serve como demonstração de portfólio e foi pensado primeiro para o celular. O visitante encontra logo no começo:

- **se a padaria está aberta agora**, com status calculado no fuso de Brasília;
- **a que horas sai o pão**, na linha do tempo das fornadas, com a próxima fornada marcada;
- **como encomendar**, em um formulário que monta a mensagem e abre o WhatsApp.

Também tem cardápio com preços, tabela de horários, mapa e dados para o Google (JSON-LD `Bakery`).

O site é feito em HTML, CSS e JavaScript puros. Não tem framework, etapa de build, dependências, backend, cookies nem analytics.

```
index.html        estrutura da página e textos de SEO
css/styles.css    visual; cores e fontes ficam em :root
js/dados.js       TODOS os dados do negócio
js/main.js        status, fornadas, cardápio, formulário, JSON-LD
img/              fotos em WebP (800 e 1600 px) e favicon.svg
CREDITOS.md       origem e licença das fotos
```

## 2. Como abrir localmente

Dê dois cliques em `index.html`. Funciona direto do arquivo.

Para simular outro horário e testar o status e as fornadas, rode um servidor local e acrescente `?agora=` à URL com a hora de Brasília:

```
index.html?agora=2026-11-05T21:00   → quinta, 21h: "Fechado · abre amanhã às 5h30"
index.html?agora=2026-11-08T10:00   → domingo, 10h: aberto, sem a fornada das 16h
```

Para servir a pasta (opcional, se tiver Node instalado):

```
npx serve .
```

## 3. Como adaptar para um cliente real

1. **`js/dados.js`**: troque nome, endereço, telefone, WhatsApp (só dígitos, com 55 e DDD), Instagram, horários, fornadas, itens de encomenda e cardápio.
   - `consultaMapa`: use o nome da loja como aparece no Google Maps. Assim o mapa e o botão "Abrir no Google Maps" apontam para a loja, e não para o bairro.
   - `aviso: ""` esconde a faixa "Site de demonstração" no topo e no rodapé.
   - `precosIlustrativos: false` esconde a nota de preços de exemplo.
   - `credito.link`: o link do seu portfólio.
2. **`index.html`, parte de cima**: atualize `<title>`, `meta description` e as tags `og:` com o nome e o bairro do cliente. Esses textos ficam no HTML para os buscadores lerem sem depender do JavaScript.
   - **Apague** a linha `<meta name="robots" content="noindex">`.
   - Em `og:image`, coloque a URL completa (`https://dominio.com.br/img/pao-frances-1600.webp`).
3. **Fotos**: substitua os arquivos em `img/` mantendo os mesmos nomes e os dois tamanhos (800 e 1600 px, WebP, proporção 4:3). Revise os textos `alt` no `index.html` e o crédito das fotos no rodapé. O `CREDITOS.md` lista as fotos que você precisa conseguir.
4. **Cores**: se o cliente tiver identidade própria, troque os tokens em `:root` no `css/styles.css`. Confira o contraste (mínimo de 4,5:1 para texto). O amarelo de destaque nunca deve virar cor de texto sobre fundo claro.
5. **Favicon**: troque `img/favicon.svg` pelas iniciais ou pela marca do cliente.
6. Teste com `?agora=` em alguns horários e envie uma encomenda de teste para o WhatsApp real do cliente.

## 4. Como publicar no Cloudflare Pages

O site é estático, então qualquer hospedagem de arquivos serve. No Cloudflare Pages:

**Upload direto (mais simples)**
1. Entre em https://dash.cloudflare.com, vá em **Workers e Pages → Criar → Pages → Fazer upload de ativos**.
2. Dê um nome ao projeto (vira `nome.pages.dev`) e arraste a pasta inteira do site.
3. Clique em **Implantar**. Para atualizar, faça um novo upload no mesmo projeto.

**Via Git (atualiza sozinho a cada commit)**
1. Suba a pasta para um repositório no GitHub ou no GitLab.
2. No painel, vá em **Workers e Pages → Criar → Pages → Conectar ao Git** e escolha o repositório.
3. Em **Comando de build**, deixe vazio. Em **Diretório de saída**, use `/`.
4. Salve. Cada `git push` na branch principal publica uma nova versão.

**Domínio próprio**: no projeto, abra **Domínios personalizados → Configurar domínio** e siga as instruções de DNS.

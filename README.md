# Nacional Site

Site institucional e comercial da **Nacional Site**, criada por Julio para ajudar pequenos negócios a apresentar seus serviços na internet e receber contatos pelo WhatsApp.

O projeto reúne planos de criação de sites, portfólio, demonstrações, serviços mensais e informações sobre a marca em uma página responsiva, com identidade visual escura e destaques em laranja.

## Funcionalidades

- Apresentação dos planos Simples, Médio e Pro e comparação de recursos.
- Portfólio com demonstrações e visualização em modais.
- Quiz para sugerir um plano de acordo com os objetivos do visitante.
- Botões de WhatsApp com mensagens relacionadas ao contexto do contato.
- Serviços mensais de hospedagem, atualizações e manutenção.
- Apresentação do fundador com foto, FAQ e espaço para depoimentos reais.
- Comunidade com dock de WhatsApp, Facebook e Instagram, ícones SVG e tooltips.
- Menu mobile, animações e efeitos visuais com Canvas.
- Recursos de acessibilidade, foco visível e respeito à preferência por movimento reduzido.
- Metadados de SEO, dados estruturados, sitemap, robots.txt e página 404.
- Eventos de analytics e captura de campanhas UTM, sem um serviço externo configurado por padrão.

## Tecnologias

O site utiliza **HTML, CSS e JavaScript puro**, sem framework e sem etapa obrigatória de build. Os estilos e o JavaScript principal ficam no `index.html`; os dados editáveis ficam centralizados em `assets/js/config.js`.

Os scripts auxiliares utilizam módulos nativos do **Node.js**, sem instalação de dependências. Node.js é necessário apenas para executar esses scripts; a hospedagem serve arquivos estáticos.

## Estrutura

```text
nacional-web/
├── index.html                  # Página principal, estilos e interações
├── 404.html                    # Página de endereço não encontrado
├── README.md                   # Apresentação e guia inicial
├── CONFIGURACAO.md             # Configuração e preparação para publicação
├── AUDITORIA-FASE-1.md          # Registro da auditoria inicial
├── RELATORIO-DE-MELHORIAS.md    # Registro das melhorias do projeto
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── logo-ns.png
│   ├── fundador.png
│   └── js/
│       └── config.js           # window.NS_CONFIG
└── tools/
    ├── check-site.cjs          # Integridade e conteúdo
    ├── check-behavior.cjs      # Comportamentos e utilitários
    ├── check-community.cjs     # Visibilidade e links da comunidade
    └── prepare-production.cjs  # Preparação do SEO estático
```

## Como visualizar localmente

Abra a pasta do projeto no editor e sirva seu conteúdo com um servidor HTTP local. No VS Code, por exemplo, use a extensão **Live Server** para abrir `index.html`.

Se já tiver Python instalado, também pode executar na raiz do projeto:

```sh
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`. Encerre o servidor com `Ctrl + C`.

## Configuração

Edite [assets/js/config.js](assets/js/config.js), preservando a estrutura de `window.NS_CONFIG`.

| Campo | Finalidade |
| --- | --- |
| `companyName` | Nome da empresa. |
| `siteUrl` | Endereço HTTPS definitivo do site. |
| `whatsappNumber` | Número comercial com DDI e DDD, somente dígitos. |
| `instagramUrl`, `tiktokUrl`, `facebookUrl`, `linkedinUrl` | Perfis públicos das redes sociais. |
| `whatsappGroupUrl`, `facebookGroupUrl` | Links das comunidades. |
| `founderImage` | Foto do fundador; atualmente `assets/fundador.png`. |
| `favicon` | Ícone personalizado; vazio utiliza o logo padrão. |
| `testimonials` | Depoimentos reais e autorizados. |
| `demoUrls` | Demonstrações dos planos Simples, Médio e Pro. |
| `projectImages` | Capturas reais das demonstrações. |
| `monthlyPlans` | Valores dos serviços mensais. |

Esse arquivo é público e não deve conter senhas ou tokens. Consulte [CONFIGURACAO.md](CONFIGURACAO.md) para os detalhes dos campos, regras comerciais e preparação do domínio.

### Comunidade

Preencha estes campos no objeto existente:

```js
whatsappGroupUrl: "",
facebookGroupUrl: "",
instagramUrl: "",
```

Cada botão aparece somente quando seu link HTTPS é válido. Se os três campos estiverem vazios ou inválidos, a seção Comunidade e os atalhos de navegação correspondentes permanecem ocultos. O link de navegação existente aponta para `#community`.

Os links abrem em nova aba com `noopener noreferrer`. Os cliques geram o evento `community_click`, identificando a rede em `network`.

## Verificações

Com Node.js instalado, execute na raiz do projeto:

```sh
node tools/check-site.cjs
node tools/check-behavior.cjs
node tools/check-community.cjs
```

Essas verificações cobrem integridade, utilitários e comportamentos específicos, incluindo combinações de links da comunidade. Elas não substituem a revisão visual no navegador, a navegação por teclado e a conferência em diferentes tamanhos de tela.

## Preparação para publicação

1. Preencha o domínio real em `siteUrl` e o contato em `whatsappNumber`.
2. Configure as redes, imagens, demonstrações e depoimentos que serão utilizados.
3. Gere os metadados estáticos com o comando abaixo.
4. Execute as verificações e revise o site no navegador.
5. Envie os arquivos públicos para uma hospedagem de sites estáticos, preservando a estrutura de `assets/`.

```sh
node tools/prepare-production.cjs
```

O comando atualiza os metadados de `index.html`, `robots.txt`, `sitemap.xml` e a base da página `404.html`. Ele **não publica o site**. A hospedagem precisa estar configurada para HTTPS e para utilizar a página 404 conforme os recursos do provedor.

No estado atual, o domínio definitivo, o número comercial de WhatsApp e a demonstração do plano Médio ainda estão pendentes. Os links de Comunidade também estão vazios, por isso essa seção fica escondida até a configuração.

## Manutenção

Para ajustes de dados, prefira `assets/js/config.js`. Para alterações de layout e comportamento, edite `index.html` e confira as demais seções antes de publicar. Utilize somente imagens, depoimentos e informações comerciais reais e autorizados.

O dock da Comunidade utiliza como referência visual o componente de **Itskrish01 no Uiverse.io**, adaptado para HTML e CSS puro, sem Tailwind ou bibliotecas de ícones.

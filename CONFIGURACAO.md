

# Configuração da Nacional Site

O site continua sendo a página de apresentação e venda de sites para pequenos negócios. Os planos principais, o portfólio, as demonstrações, o FAQ e o contato pelo WhatsApp fazem parte dessa experiência.

## 1. Preencher os dados reais

Edite `assets/js/config.js`. Esse arquivo define `window.NS_CONFIG`; mantenha os nomes dos campos e a estrutura do objeto. Ele é público: não coloque senhas, tokens ou outros segredos nele.

| Campo | Como preencher |
| --- | --- |
| `companyName` | Nome do negócio; atualmente `Nacional Site`. |
| `siteUrl` | URL HTTPS real da página, com `/` no final. Deixe `''` enquanto o domínio não estiver definido. Um caminho base, como `https://sua-conta.github.io/nacional-web/`, também é aceito. |
| `whatsappNumber` | Número real com DDI e DDD, somente dígitos. Confirme que esse número recebe mensagens no WhatsApp. |
| `instagramUrl`, `tiktokUrl`, `facebookUrl`, `linkedinUrl` | URLs públicas reais dos perfis. Campos vazios não precisam de links fictícios. |
| `communityUrl` | Campo de compatibilidade: funciona como alternativa ao LinkedIn quando `linkedinUrl` está vazio. Prefira configurar `linkedinUrl`. |
| `whatsappGroupUrl`, `facebookGroupUrl` | URLs reais dos grupos, se existirem. |
| `founderImage` | Caminho de arquivo local ou URL HTTPS da foto real do fundador. Vazio mantém a apresentação sem uma foto inventada. |
| `favicon` | Caminho local ou URL HTTPS de um ícone personalizado. Vazio usa `assets/logo-ns.png`. |
| `testimonials` | Lista apenas com depoimentos reais e autorizados, no formato `{ name: 'Nome', business: 'Negócio', text: 'Depoimento' }`. Mantenha `[]` enquanto não houver depoimentos. |
| `demoUrls.simples`, `demoUrls.medio`, `demoUrls.pro` | URLs HTTPS das demonstrações interativas. Os endereços existentes dos planos Simples e Pro já estão preenchidos. Só preencha Médio quando houver uma demonstração real. |
| `projectImages.simples`, `projectImages.medio`, `projectImages.pro` | Capturas reais de cada demonstração, como `assets/demo-simples.webp`. Aceita AVIF, WebP e outros formatos suportados pelo navegador. Vazio mantém o mockup ilustrativo; uma imagem inválida não o substitui. |
| `monthlyPlans.hosting`, `monthlyPlans.updates`, `monthlyPlans.maintenance` | Valores mensais em reais, como **números**, sem símbolo ou vírgula: `29.9`, `49.9` e `79.9`. As chaves representam Hospedagem, Hospedagem + Atualizações e Hospedagem PRO, respectivamente; `maintenance` mantém o nome por compatibilidade. |

Exemplo de edição de campos dentro do objeto existente:

```js
siteUrl: '',             // TODO: domínio real em HTTPS
whatsappNumber: '',      // TODO: número real com DDI e DDD
monthlyPlans: {
    hosting: 29.9,       // Hospedagem — R$29,90/mês
    updates: 49.9,       // Hospedagem + Atualizações — R$49,90/mês
    maintenance: 79.9    // Hospedagem PRO — R$79,90/mês
},
```

Os planos mensais definidos são:

- **Hospedagem — R$29,90/mês:** site hospedado, online e com manutenção técnica básica.
- **Hospedagem + Atualizações — R$49,90/mês:** tudo da hospedagem + pequenas alterações de textos, imagens e preços.
- **Hospedagem PRO — R$79,90/mês:** hospedagem + atualizações ilimitadas + prioridade no atendimento.

As URLs das demonstrações e os valores dos três planos de criação são assuntos diferentes. Alterar `monthlyPlans` não altera os preços de criação dos planos Simples, Médio e Pro.

## 2. Preparar o domínio e o SEO estático

Enquanto `siteUrl` estiver vazio, o domínio `https://SEU-DOMINIO.com.br/` nos arquivos de SEO é uma pendência explícita. Ele não é um endereço de produção. Nenhum domínio ou contato real foi presumido.

Depois de definir o domínio, preencha `siteUrl`, abra o terminal na pasta do projeto e execute com Node.js:

```powershell
node tools/prepare-production.cjs
```

Não é necessário instalar dependências. O comando:

- valida uma URL HTTPS sem credenciais, parâmetros ou fragmento; recusa localhost, IPs e domínios de exemplo;
- prepara canonical, `og:url`, `og:image`, `twitter:image` e os campos `url`/`logo` da organização no JSON-LD de `index.html`;
- usa `assets/logo-ns.png` como imagem social padrão e lê a largura e a altura diretamente do PNG;
- atualiza `robots.txt` e `sitemap.xml` com o endereço real da única página principal;
- define o endereço base de `404.html` para que o ícone, a configuração e o retorno ao início funcionem também em URLs inexistentes com vários níveis;
- calcula o resultado antes de gravar e substitui cada arquivo por meio de arquivo temporário;
- pode ser executado novamente; sem alterações na configuração, não regrava os arquivos.

O comando não publica o site. Revise os arquivos gerados antes de enviá-los à hospedagem. Se o domínio mudar, altere `siteUrl` e execute novamente. Os endereços das demonstrações ficam preservados.

Com `siteUrl: ''`, o comando apenas informa o TODO e não altera nenhum arquivo. Uma URL inválida também impede a preparação. Os metadados são escritos no HTML porque robôs de busca e serviços de compartilhamento precisam encontrá-los sem depender de JavaScript no navegador.

O `favicon` personalizado afeta o ícone no navegador. A imagem social e o logo do Schema usam o PNG padrão; para trocar essa identidade, substitua o arquivo por um PNG válido e execute novamente a preparação.

## 3. Conferir a experiência antes da publicação

Sirva a pasta por HTTP com a ferramenta local que você já utiliza e abra a página no navegador. Confira:

1. WhatsApp com o destinatário e a mensagem corretos nos botões de contato e dos planos.
2. Menu no celular, links de navegação e ausência de cortes nos cards.
3. Demonstrações conceituais e externas, fechamento dos modais por botão e tecla Esc.
4. Abertura e fechamento das respostas do FAQ.
5. Navegação por teclado, foco visível e preferência de movimento reduzido.
6. URLs das redes e imagens reais que foram configuradas.
7. Canonical, imagem social e URL da organização no código-fonte após preparar o domínio.
8. Resposta da hospedagem para um endereço inexistente, usando a página `404.html` conforme o suporte do provedor.

Não publique o domínio provisório como endereço final. A configuração do número real de WhatsApp continua sendo necessária para concluir o fluxo de contato.

## 4. Pendências que dependem do negócio

- **Privacidade:** definir os dados efetivamente tratados, responsável, contato e fornecedores utilizados antes de escrever ou publicar uma política. O projeto não presume uma política jurídica pronta. Reavalie isso se adicionar formulários, cookies, pixels ou ferramentas de analytics.
- **Serviços mensais:** os preços e benefícios acima estão definidos. As demais condições de contratação continuam pendentes de confirmação.
- **SEO local:** definir cidade, área de atendimento e dados reais. Páginas locais futuras precisam ter conteúdo próprio e uma finalidade útil; não foram criadas páginas com cidades fictícias.
- **Prova social:** só adicionar clientes, fotos, métricas e depoimentos que possam ser comprovados e utilizados com autorização.
- **Hospedagem:** confirmar HTTPS, resolução do domínio, comportamento da página 404 e localização de `robots.txt`/`sitemap.xml`. Em subdiretórios, o provedor precisa tratar corretamente o arquivo `robots.txt` na raiz do domínio.

O esqueleto de eventos de analytics existente não configura, por si só, um serviço externo. Se integrar uma ferramenta depois, verifique a implementação e os requisitos de privacidade antes de ativá-la.

## 5. Eventos, campanhas e recomendação

O site continua emitindo `ns:analytics` para observação local. Quando houver uma
integração externa real, usa `gtag` se disponível; caso contrário, usa `dataLayer`.
Não conecte um segundo encaminhamento externo ao evento local, pois isso voltaria
a duplicar a contagem. Não foi instalado nenhum ID de Google Analytics.

Os campos `utm_source`, `utm_medium`, `utm_campaign` e `utm_content` ficam em
`sessionStorage` durante a sessão. Uma nova campanha substitui a anterior e
nenhuma UTM é acrescentada ao texto do WhatsApp. O bloqueio de armazenamento não
impede o uso do site. As respostas do quiz ficam na página até o visitante
decidir abrir o WhatsApp; o projeto não envia essas respostas a um backend.

O quiz recomenda por regras visíveis: essencial com até dois objetivos indica
Simples; três ou mais objetivos, portfólio ou apresentação completa indicam
Médio; apresentação avançada indica Pro. É uma sugestão inicial, não um escopo
fechado. Revisões, prazos e recursos contratados precisam ser confirmados.

## 6. Decisões comerciais — TODO: DEFINIR

Quantidade de páginas/seções, revisões, prazo, suporte pós-entrega, demais
condições dos serviços mensais, mudanças estruturais, novas páginas, cancelamento/migração da
hospedagem, titularidade do domínio e entrega dos arquivos. Essas condições não
foram inventadas nem adicionadas como promessas ao FAQ.

Uma futura `politica-de-privacidade.html` precisa refletir os tratamentos reais
do negócio e das integrações efetivamente ativadas. Não há link para uma página
inexistente nem texto jurídico presumido nesta versão. Para SEO local, preparar
páginas reais de criação de sites e segmentos/cidades atendidos somente quando
houver conteúdo próprio e dados confirmados.

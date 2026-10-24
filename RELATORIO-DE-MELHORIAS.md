# Melhorias da Nacional Site

O objetivo continua o mesmo: apresentar sites profissionais para pequenos negócios,
mostrar demonstrações e facilitar o contato pelo WhatsApp. A base existente foi
mantida; o site não foi refeito do zero e não foi publicado nesta etapa.

## Alterações

- Configuração em `assets/js/config.js`, compartilhada com a página 404.
- Preços de criação mantidos em R$230, R$280 e R$360.
- Oferta mais explícita no H1, com o slogan original preservado.
- Canvas mantido como fundo da prévia desktop/celular, com animação pausada no
  mobile, fora da tela, em aba oculta e com preferência por movimento reduzido.
- Falha do canvas isolada da inicialização do FAQ, dos modais e dos contatos.
- Intro de aproximadamente 900 ms, uma vez por sessão; pode ser pulada e é
  dispensada com movimento reduzido. Sem JavaScript, não bloqueia o conteúdo.
- Correções para cards em telas estreitas, foco do menu e conteúdo de fundo
  inativo durante menu, intro e modal.
- Menu com rolagem própria em telas baixas, incluindo celular na horizontal.
- Modal com opção de abrir a mesma demonstração em nova aba.
- Médio preparado para uma URL real futura, com estado “Demonstração em breve”.
- Mockups preparados para capturas reais em `projectImages`, sem imagens falsas.
- Selo “Recomendado”, comparação de conversão mais clara e escopo a confirmar.
- Planos mensais configurados: Hospedagem por R$29,90/mês (site hospedado, online
  e manutenção técnica básica); Hospedagem + Atualizações por R$49,90/mês (tudo
  da hospedagem + pequenas alterações de textos, imagens e preços); Hospedagem
  PRO por R$79,90/mês (hospedagem + atualizações ilimitadas + prioridade no atendimento).
- Mini recomendação de plano sem backend, com regras visíveis e respostas
  incluídas na mensagem ao WhatsApp; o escopo final depende do atendimento.
- Eventos existentes preservados, eventos do quiz e visualização de preços,
  com um único envio externo por evento (gtag ou dataLayer).
- UTM temporária em sessionStorage, sem alongar a mensagem de contato.
- Avisos de configuração incompleta no console, sem bloquear a página.
- SEO preparado para domínio real por `tools/prepare-production.cjs`, sem
  depender de JavaScript para canonical, compartilhamento e Schema.
- `404.html`, instruções de configuração e verificadores locais sem dependências.
  O preparo do domínio também define a base da 404 para URLs inexistentes aninhadas.

## Funcionalidades preservadas

Logo e cores, navegação, menu mobile, conteúdo original, quatro demonstrações
conceituais, demos externas de Simples e Pro, modal/iframe, FAQ com 14 perguntas,
contatos com mensagens por plano, botão flutuante, CONFIG, depoimentos reais
condicionais, redes/grupos condicionais, eventos, foco visível, Escape no
documento principal, restauração de foco e movimento reduzido.

Projetos fictícios continuam explicitamente identificados como conceituais.
Não foram adicionados clientes, depoimentos, resultados, endereços ou contatos.
CSS e lógica principal permanecem incorporados no HTML para limitar a migração.

Durante a reordenação, uma validação detectou conteúdo omitido por um erro no
editor de blocos. As 17 seções foram recuperadas do histórico das leituras e
validadas antes da entrega. Seis parágrafos descritivos foram reconstituídos
mantendo o sentido; os controles, IDs, preços, demos e perguntas foram preservados.

## Dados que precisam ser preenchidos

- [ ] Domínio real em `siteUrl`; executar a preparação do SEO depois.
- [ ] Número real de WhatsApp com DDI e DDD.
- [ ] Redes e grupos reais, somente se existirem.
- [ ] Foto do fundador, se desejado.
- [ ] URL real da demo Médio.
- [ ] Capturas reais dos projetos, se disponíveis.
- [ ] Demais condições de contratação dos planos mensais; preços e benefícios já definidos.

## Decisões comerciais pendentes — TODO: DEFINIR

- Quantidade de páginas, seções, revisões e prazo de entrega.
- Demais condições dos serviços mensais e cobrança de mudanças estruturais.
- Novas páginas, suporte pós-entrega e monitoramento contratados.
- Pagamento, cancelamento, migração da hospedagem e entrega dos arquivos.
- Titularidade do domínio e condições de propriedade/uso do projeto entregue.
- Dados e fornecedores efetivamente usados para uma política de privacidade.

Não foram publicadas respostas de FAQ que inventassem essas políticas. A
estrutura existente pode recebê-las quando forem definidas. A preparação da
política e de páginas locais futuras está documentada em `CONFIGURACAO.md`.

## Verificação e limites

Os comandos de verificação são `node tools/check-site.cjs` e
`node tools/check-behavior.cjs`. Validam a integridade estrutural, sintaxe,
referências locais, preços e funções de configuração e contato. Não substituem
testes visuais em navegador e aparelhos reais.

Resultado da execução local: **236 verificações estruturais sem erros** e
**74 asserções de comportamento aprovadas**. `git diff --check` também passou.
Os avisos restantes são domínio, WhatsApp e demonstração Médio ainda não
configurados; a ferramenta de produção não altera arquivos com domínio vazio.

Não havia navegador ou ferramenta de automação de navegador disponível neste
ambiente. Portanto, contraste, dimensões renderizadas, desempenho real e foco
dentro de iframes externos ainda precisam de validação manual. Eventos de
teclado dentro de um iframe de outra origem não chegam ao documento pai;
o botão de fechar e a opção de nova aba ficam disponíveis no cabeçalho.

## Antes de publicar

- [ ] Conferir WhatsApp real e mensagens de cada plano e do quiz.
- [ ] Configurar domínio e gerar canonical, OG, Schema, robots e sitemap.
- [ ] Verificar logo, favicon e foto configurada.
- [ ] Verificar demos Simples/Pro e Médio quando houver URL real.
- [ ] Testar menu, FAQ, modal, Tab, Shift+Tab e Escape no navegador.
- [ ] Testar 320, 360, 375, 390, 412, 480, 768, 1024, 1440 e 1920 px.
- [ ] Testar movimento reduzido, armazenamento bloqueado e JavaScript desativado.
- [ ] Conferir console: distinguir avisos de dados pendentes de erros de execução.
- [ ] Confirmar rota 404 e regras de hospedagem.
- [ ] Revisar condições comerciais e privacidade antes de integrar analytics.

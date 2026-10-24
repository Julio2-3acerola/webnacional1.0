# Auditoria inicial — Nacional Site

Registro do diagnóstico que orientou a implementação. Para o estado final,
consulte `RELATORIO-DE-MELHORIAS.md` e `CONFIGURACAO.md`.

## Base analisada

`index.html` com CSS e JavaScript incorporados, `robots.txt`, `sitemap.xml` e
`assets/logo-ns.png`. O HTML tinha 1.893 linhas, um H1 e 17 seções no main.
Já existiam alterações locais; a implementação partiu dessa versão de trabalho.

Não foram encontrados IDs duplicados nem destinos ausentes nas âncoras internas
do HTML principal. Sintaxe JavaScript e JSON-LD válida. Preços R$230/280/360,
quatro demos conceituais, duas demos externas e 14 perguntas do FAQ identificados.

## Prioridades encontradas

1. WhatsApp vazio e domínio provisório nos arquivos de SEO.
2. Canvas sem proteção contra contexto indisponível, podendo interromper FAQ/modais.
3. Intro longa, repetida e bloqueando a página sem JavaScript.
4. Grids com mínimo de 300/290 px em uma área útil de cerca de 280 px a 320 px.
5. Menu mobile sem foco inicial ou isolamento do conteúdo atrás do menu.
6. Modal sem alternativa de nova aba; eventos do iframe externo não chegam ao pai.
7. Analytics enviando para gtag e dataLayer simultaneamente quando ambos existem.
8. Selo “Mais escolhido” sem evidência e comparação de conversão inconsistente.
9. Demo Médio sem URL central, mensalidades sem configuração e escopo a definir.

## Preservação

Identidade visual, logo, navegação, mobile, demos, FAQ, WhatsApp, configuração,
seções condicionais, preços, eventos, acessibilidade e movimento reduzido.
Não inventar contatos, clientes, resultados, políticas ou domínio.

## Limites

O diagnóstico foi estático. Validação visual, teclado dentro de iframes,
contraste e desempenho em aparelhos reais dependem de teste no navegador.

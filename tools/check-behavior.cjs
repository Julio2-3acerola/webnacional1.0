/* Executa utilitários reais do index.html em contextos isolados, sem dependências.
 * Não simula layout, teclado, foco ou comportamento completo do navegador.
 * Uso: node tools/check-behavior.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').replace(/\r\n/g, '\n');
let assertions = 0;

function equal(actual, expected, description) {
    assert.equal(actual, expected, description);
    assertions++;
}

function objectEqual(actual, expected, description) {
    // Objetos de vm possuem outro prototype; comparar o conteúdo serializável.
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected, description);
    assertions++;
}

function extractFunction(name) {
    const start = source.indexOf('            function ' + name + '(');
    assert.ok(start >= 0, 'Função não encontrada: ' + name);
    const ending = '\n            }';
    const end = source.indexOf(ending, start);
    assert.ok(end >= 0, 'Fim da função não encontrado: ' + name);
    return source.slice(start, end + ending.length);
}

const helpers = ['safeUrl', 'safeAsset', 'getWhatsAppNumber', 'getWhatsAppLink']
    .map(extractFunction).join('\n');

function utilities(config = {}, base = 'https://nacionalsite.example/preview/') {
    const context = vm.createContext({
        URL,
        URLSearchParams,
        CONFIG: config,
        DEFAULT_MESSAGE: 'Olá! Quero um site para meu negócio.',
        window: { location: { origin: 'https://nacionalsite.example' } },
        document: { baseURI: base }
    });
    vm.runInContext(helpers, context, { filename: 'index.html:utilitarios' });
    return context;
}

const util = utilities();
equal(util.safeUrl('https://example.com/contato?origem=site#fale'), 'https://example.com/contato?origem=site#fale', 'HTTPS válido preservado');
equal(util.safeUrl('  https://example.com  '), 'https://example.com/', 'Espaço externo removido e endereço normalizado');
for (const value of ['', null, 12, {}, 'javascript:alert(1)', 'data:text/html,oi', 'http://example.com', '//example.com', '/contato', 'https://user:secret@example.com', 'https://user@example.com']) {
    equal(util.safeUrl(value), '', 'URL externa rejeitada: ' + String(value));
}

for (const value of ['assets/logo-ns.png', './assets/logo-ns.png', '/assets/logo-ns.png', '../assets/fundador.png', 'assets/foto%20real.png']) {
    equal(util.safeAsset(value), value, 'Imagem local preservada: ' + value);
}
equal(util.safeAsset('https://images.example.com/foto.png'), 'https://images.example.com/foto.png', 'Imagem HTTPS externa permitida');
for (const value of ['', null, 12, 'javascript:alert(1)', 'data:image/svg+xml,oi', 'http://example.com/foto.png', 'https://user:secret@example.com/foto.png', '//example.com/foto.png', '\\example.com/foto.png', '/\\example.com/foto.png', 'assets\\foto.png']) {
    equal(util.safeAsset(value), '', 'Imagem insegura rejeitada: ' + String(value));
}
equal(utilities({}, 'https://externo.example/').safeAsset('foto.png'), '', 'Base externa não transforma caminho local em recurso de outra origem');

for (const value of ['', null, 'abc', '123', '123456789', '1234567890123456']) {
    const context = utilities({ whatsappNumber: value });
    equal(context.getWhatsAppNumber(), '', 'Número de contato vazio/inválido rejeitado');
    equal(context.getWhatsAppLink('Quero um site'), '', 'Contato inválido não gera link');
}
const whatsapp = utilities({ whatsappNumber: '+55 (11) 99999-9999' });
equal(whatsapp.getWhatsAppNumber(), '5511999999999', 'DDI, DDD e número são normalizados');
const message = 'Olá! Quero o plano Pro: R$ 360 & uma seção de serviços.';
equal(whatsapp.getWhatsAppLink(message), 'https://wa.me/5511999999999?text=' + encodeURIComponent(message), 'Mensagem acentuada e caracteres especiais codificados');
equal(whatsapp.getWhatsAppLink(), 'https://wa.me/5511999999999?text=' + encodeURIComponent('Olá! Quero um site para meu negócio.'), 'Mensagem padrão mantida');

const campaignStart = source.indexOf('            const campaignData = (function() {');
const campaignEnding = '\n            })();';
const campaignEnd = source.indexOf(campaignEnding, campaignStart);
assert.ok(campaignStart >= 0 && campaignEnd >= 0, 'Atribuição de campanha não encontrada');
const campaignScript = source.slice(campaignStart, campaignEnd + campaignEnding.length) + '\nglobalThis.result = campaignData;';

function campaign(search, stored, blocked = false) {
    let persisted;
    const context = vm.createContext({
        URLSearchParams,
        window: { location: { search } },
        sessionStorage: {
            getItem(key) {
                assert.equal(key, 'ns:campaign');
                if (blocked) throw new Error('Storage indisponível');
                return stored;
            },
            setItem(key, value) {
                assert.equal(key, 'ns:campaign');
                if (blocked) throw new Error('Storage indisponível');
                persisted = JSON.parse(value);
            }
        }
    });
    vm.runInContext(campaignScript, context, { filename: 'index.html:campanha' });
    return { result: context.result, persisted };
}

objectEqual(campaign('', '{inválido').result, {}, 'JSON inválido do storage não interrompe a página');
objectEqual(campaign('', null, true).result, {}, 'Storage bloqueado funciona sem campanha');
objectEqual(campaign('?utm_source=instagram&utm_campaign=outubro', null, true).result, { utm_source: 'instagram', utm_campaign: 'outubro' }, 'Campanha da URL funciona mesmo com storage bloqueado');

const prior = JSON.stringify({ utm_source: 'antiga', utm_medium: 'email', utm_campaign: 'anterior', utm_content: 'primeiro', password: 'ignorar', utm_term: 'ignorar' });
const current = campaign('?utm_source=google&utm_campaign=nova&utm_term=ignorar&password=ignorar', prior);
objectEqual(current.result, { utm_source: 'google', utm_campaign: 'nova' }, 'Nova atribuição substitui todos os campos da campanha anterior e filtra extras');
objectEqual(current.persisted, { utm_source: 'google', utm_campaign: 'nova' }, 'Persistência contém somente a campanha permitida atual');
objectEqual(campaign('', prior).result, { utm_source: 'antiga', utm_medium: 'email', utm_campaign: 'anterior', utm_content: 'primeiro' }, 'Navegação sem nova atribuição conserva somente campos permitidos');
objectEqual(campaign('?utm_source=', prior).result, {}, 'Nova campanha vazia limpa atribuição anterior');
objectEqual(campaign('', JSON.stringify({ utm_source: 42, utm_medium: {}, utm_campaign: 'x'.repeat(250) })).result, { utm_campaign: 'x'.repeat(200) }, 'Storage ignora tipos inválidos e limita tamanho');
objectEqual(campaign('?utm_content=' + 'a'.repeat(250), null).result, { utm_content: 'a'.repeat(200) }, 'URL limita tamanho dos campos de campanha');

// Executa apenas a decisão de plano real; formulário, renderização e foco não são simulados.
const recommendationStart = source.indexOf('                    let plan = ');
const recommendationEnd = source.indexOf('                    output.textContent', recommendationStart);
assert.ok(recommendationStart >= 0 && recommendationEnd > recommendationStart, 'Regra de recomendação não encontrada');
const recommend = vm.runInNewContext('(function(level, goals) {\n' + source.slice(recommendationStart, recommendationEnd) + '\nreturn plan;\n})');
const recommendationCases = [
    { level: 'essential', goals: ['Receber contatos'], name: 'Simples', price: 230 },
    { level: 'essential', goals: ['Receber contatos', 'Apresentar serviços'], name: 'Simples', price: 230 },
    { level: 'essential', goals: ['Receber contatos', 'Apresentar serviços', 'Mostrar localização'], name: 'Médio', price: 280 },
    { level: 'essential', goals: ['Mostrar portfólio'], name: 'Médio', price: 280 },
    { level: 'complete', goals: ['Receber contatos'], name: 'Médio', price: 280 },
    { level: 'advanced', goals: ['Receber contatos', 'Apresentar serviços', 'Mostrar portfólio'], name: 'Pro', price: 360 }
];
for (const item of recommendationCases) {
    const recommendation = recommend(item.level, item.goals);
    equal(recommendation.name, item.name, 'Plano recomendado: ' + item.level + ' / ' + item.goals.join(', '));
    equal(recommendation.price, item.price, 'Preço original do plano ' + item.name);
}

// Observa eventos com EventTarget/CustomEvent nativos do Node, sem criar DOM.
const analyticsStart = source.indexOf('                track(eventName, params) {');
const analyticsEnding = '\n                }';
const analyticsEnd = source.indexOf(analyticsEnding, analyticsStart);
assert.ok(analyticsStart >= 0 && analyticsEnd > analyticsStart, 'Método Analytics.track não encontrado');
const analyticsScript = 'globalThis.analytics = ({\n' + source.slice(analyticsStart, analyticsEnd + analyticsEnding.length) + '\n});';

function analytics(hasGtag) {
    const calls = [];
    const dataLayer = [];
    const observed = [];
    const target = new EventTarget();
    target.addEventListener('ns:analytics', event => observed.push(event.detail));
    const context = vm.createContext({
        CustomEvent,
        campaignData: { utm_source: 'instagram' },
        window: {
            dataLayer,
            ...(hasGtag ? { gtag: (...args) => calls.push(args) } : {}),
            dispatchEvent: event => target.dispatchEvent(event)
        }
    });
    vm.runInContext(analyticsScript, context, { filename: 'index.html:analytics' });
    context.analytics.track('quiz_complete', { plan: 'Médio' });
    return { calls, dataLayer, observed };
}

const primaryAnalytics = analytics(true);
equal(primaryAnalytics.calls.length, 1, 'gtag recebe o evento uma única vez');
objectEqual(primaryAnalytics.calls[0], ['event', 'quiz_complete', { utm_source: 'instagram', plan: 'Médio' }], 'gtag recebe campanha e parâmetros do evento');
equal(primaryAnalytics.dataLayer.length, 0, 'dataLayer não duplica evento já enviado ao gtag');
objectEqual(primaryAnalytics.observed, [{ event: 'quiz_complete', utm_source: 'instagram', plan: 'Médio' }], 'ns:analytics mantém observação local única');
const fallbackAnalytics = analytics(false);
equal(fallbackAnalytics.calls.length, 0, 'Sem gtag, não existe envio para gtag');
objectEqual(fallbackAnalytics.dataLayer, [{ event: 'quiz_complete', utm_source: 'instagram', plan: 'Médio' }], 'dataLayer recebe o evento uma única vez como destino alternativo');
objectEqual(fallbackAnalytics.observed, [{ event: 'quiz_complete', utm_source: 'instagram', plan: 'Médio' }], 'Destino alternativo também preserva observação local única');

console.log('Comportamentos verificados: ' + assertions + ' asserções (URLs, imagens, WhatsApp, campanhas, recomendação e analytics).');

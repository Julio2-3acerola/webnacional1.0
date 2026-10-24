'use strict';

// Validação local sem dependências: node tools/check-site.cjs
// Confere integridade dos arquivos e o conteúdo comercial que deve ser preservado.
// Não substitui a validação visual e de teclado em um navegador.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const failures = [];
const warnings = [];
let checks = 0;
function check(condition, message) {
    checks++;
    if (!condition) failures.push(message);
}
function attributes(source) {
    const result = {};
    for (const match of source.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
    }
    return result;
}
function localPath(value, base = root) {
    if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return null;
    try { return path.resolve(base, decodeURIComponent(value.split(/[?#]/)[0].replace(/^\//, ''))); }
    catch { return null; }
}
const scriptBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
const schemas = [];
const javascript = [];
let config = null;
let configScriptIndex = -1;
for (const [index, match] of scriptBlocks.entries()) {
    const attr = attributes(match[1]);
    const filename = attr.src || `index.html (script ${index + 1})`;
    try {
        const file = localPath(attr.src);
        const body = attr.src ? (file ? fs.readFileSync(file, 'utf8') : null) : match[2];
        if (body === null) continue;
        if (attr.type === 'application/ld+json') schemas.push(JSON.parse(body));
        else if (!attr.type || /^(?:text|application)\/javascript$/.test(attr.type)) {
            new vm.Script(body, { filename });
            javascript.push(body);
            if (attr.src === 'assets/js/config.js') {
                const context = { window: {} };
                vm.runInNewContext(body, context, { filename, timeout: 1000 });
                config = context.window.NS_CONFIG;
                configScriptIndex = index;
            }
        }
        checks++;
    } catch (error) { check(false, `${filename}: ${error.message}`); }
}

// Os scripts podem conter HTML de demonstração; não fazem parte do DOM inicial.
const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
const tags = [...markup.matchAll(/<([a-z][a-z\d-]*)\b([^>]*)>/gi)]
    .map(match => ({ name: match[1].toLowerCase(), attr: attributes(match[2]), raw: match[0] }));
const ids = new Map();
for (const tag of tags) {
    if (tag.attr.id) {
        check(!ids.has(tag.attr.id), `ID duplicado: ${tag.attr.id}`);
        ids.set(tag.attr.id, tag);
    }
    for (const key of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
        if (tag.attr[key]) {
            for (const id of tag.attr[key].split(/\s+/)) {
                check(tags.some(item => item.attr.id === id), `${key} aponta para ID ausente: ${id}`);
            }
        }
    }
    for (const key of ['src', 'href']) {
        const value = tag.attr[key];
        if (!value) continue;
        if (value.startsWith('#') && value !== '#') {
            check(tags.some(item => item.attr.id === value.slice(1)), `Âncora sem destino: ${value}`);
        }
        const file = localPath(value);
        if (file) check(fs.existsSync(file), `Arquivo local ausente: ${value}`);
    }
    if (tag.name === 'img') check(Object.hasOwn(tag.attr, 'alt'), `Imagem sem alt: ${tag.attr.src}`);
    if (tag.name === 'a' && tag.attr.target === '_blank') {
        check(/(?:^|\s)noopener(?:\s|$)/.test(tag.attr.rel || ''), `Link _blank sem noopener: ${tag.attr.href}`);
    }
}
check(tags.filter(tag => tag.name === 'h1').length === 1, 'Deve haver um único título principal h1.');
check(/<html\b[^>]*\blang="pt-BR"/i.test(markup), 'Idioma pt-BR ausente.');
for (const id of ['main', 'problem', 'before-after', 'create', 'portfolio', 'why', 'pricing', 'comparison',
    'services', 'delivery', 'process', 'about', 'testimonials', 'community', 'faq', 'final-cta', 'demoModal']) {
    check(ids.has(id), `Seção ou recurso principal ausente: ${id}`);
}

const byClass = name => tags.filter(tag => (tag.attr.class || '').split(/\s+/).includes(name));
check(tags.filter(tag => tag.name === 'section').length === 17, 'As 17 seções originais devem ser preservadas.');
check(byClass('problem-card').length === 6, 'Os seis exemplos da seção de problemas devem ser preservados.');
check(byClass('why-card').length === 12, 'Os quatro benefícios e os oito diferenciais devem ser preservados.');
check(byClass('open-demo').length === 4, 'As quatro demonstrações conceituais devem ser preservadas.');
check(config && typeof config === 'object', 'Configuração externa window.NS_CONFIG ausente ou inválida.');
check(configScriptIndex >= 0 && scriptBlocks.slice(configScriptIndex + 1).some(block => /window\.NS_CONFIG/.test(block[2])),
    'Carregar a configuração externa antes do código que a utiliza.');
const demoButtons = byClass('open-iframe-demo');
check(demoButtons.length === 3, 'Manter controles para demonstrações Simples, Médio e Pro.');
const demos = config?.demoUrls || {};
const existingDemos = {
    simples: 'https://julio2-3acerola.github.io/mvpa-aidahoraclint/',
    pro: 'https://julio2-3acerola.github.io/mvpa-aiteria/'
};
for (const [plan, expectedUrl] of Object.entries(existingDemos)) {
    check(demos[plan] === expectedUrl, `URL da demonstração ${plan} alterada ou ausente na configuração.`);
}
for (const plan of ['simples', 'medio', 'pro']) {
    check(typeof demos[plan] === 'string', `Campo demoUrls.${plan} ausente ou inválido.`);
    const button = demoButtons.find(item => item.attr['data-demo-plan'] === plan);
    check(!!button, `Controle de demonstração ausente para ${plan}.`);
    if (!demos[plan] && button) {
        check(Object.hasOwn(button.attr, 'disabled'), `Demonstração ${plan} sem URL deve iniciar desativada.`);
    }
}
check(byClass('faq-question').length === 14, 'As 14 perguntas do FAQ devem ser preservadas.');
check(byClass('whatsapp-cta').length > 10, 'Chamadas principais de WhatsApp ausentes.');
const expectedPrices = new Map([['Simples', '230'], ['Médio', '280'], ['Pro', '360']]);
const offers = schemas.flatMap(schema => schema.makesOffer || []);
for (const [plan, price] of expectedPrices) {
    const buttons = tags.filter(tag => tag.attr['data-plan'] === plan);
    check(buttons.length === 2, `Plano ${plan}: manter chamada no card e na comparação.`);
    for (const button of buttons) {
        check((button.attr['data-price'] || '').replace(/\D/g, '') === price, `Preço incorreto no plano ${plan}.`);
        check((button.attr['data-wa-message'] || '').includes(price), `Mensagem do plano ${plan} sem preço correspondente.`);
    }
    check(offers.some(offer => offer.name === `Plano ${plan}` && String(offer.price) === price && offer.priceCurrency === 'BRL'),
        `Preço Schema.org incorreto ou ausente para ${plan}.`);
}
const visiblePrices = [...markup.matchAll(/class="pricing-price"[^>]*>([\s\S]*?)<\/div>/g)]
    .map(match => match[1].replace(/<[^>]+>/g, '').replace(/\D/g, ''));
check(visiblePrices.join(',') === [...expectedPrices.values()].join(','), 'Preços visíveis dos cards alterados.');

for (const body of javascript) {
    for (const match of body.matchAll(/\$\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        check(ids.has(match[1]), `JavaScript usa um ID ausente: ${match[1]}`);
    }
}
if (/SEU-DOMINIO/i.test(html)) warnings.push('Domínio de produção ainda precisa ser configurado nos metadados de SEO.');
if (!config?.whatsappNumber) warnings.push('Número de WhatsApp ainda vazio na configuração.');
if (!demos.medio) warnings.push('Demonstração do plano Médio ainda não disponível.');

for (const message of failures) console.error(`ERRO: ${message}`);
for (const message of warnings) console.warn(`PENDENTE: ${message}`);
console.log(`${checks} verificações; ${failures.length} erro(s); ${warnings.length} pendência(s) de configuração.`);
process.exitCode = failures.length ? 1 : 0;

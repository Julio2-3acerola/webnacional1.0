#!/usr/bin/env node
'use strict';

// Gera o SEO estático com os dados reais, sem dependências e sem publicar o site.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const net = require('node:net');

function normalizeSiteUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const input = value.trim();
    let url;
    try { url = new URL(input); } catch {
        throw new Error('siteUrl deve ser uma URL HTTPS válida do seu domínio real.');
    }
    const host = url.hostname.toLowerCase();
    const placeholder = /(?:^|[.-])(?:seu-?dominio|your-?domain|placeholder|localhost)(?:[.-]|$)/i;
    const reserved = /(?:^|\.)(?:example\.(?:com|net|org)|localhost|local|invalid|test|example)$/i;
    if (url.protocol !== 'https:' || !/^https:\/\//i.test(input) || /[\\\s?#]/.test(input) ||
        url.username || url.password || !host.includes('.') || net.isIP(host.replace(/^\[|\]$/g, '')) ||
        placeholder.test(host) || reserved.test(host)) {
        throw new Error('siteUrl precisa usar HTTPS e um domínio real, sem credenciais, query ou fragmento. Localhost e domínios de exemplo não são aceitos.');
    }
    // Um caminho base (por exemplo, /nacional-web/) também pode hospedar o site.
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return url.href;
}

function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readAttribute(tag, name) {
    const pattern = new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i');
    const match = pattern.exec(tag);
    return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function writeAttribute(tag, name, value) {
    const encoded = escapeHtml(value);
    const pattern = new RegExp('(\\s' + name + '\\s*=\\s*)(?:"[^"]*"|\'[^\']*\'|[^\\s>]+)', 'i');
    if (pattern.test(tag)) return tag.replace(pattern, (_, prefix) => prefix + '"' + encoded + '"');
    return tag.replace(/\s*\/?\s*>$/, () => ' ' + name + '="' + encoded + '">');
}

function upsertTag(head, tagName, key, identity, attribute, value, newline) {
    let count = 0;
    const pattern = new RegExp('<' + tagName + '\\b[^>]*>', 'gi');
    const updated = head.replace(pattern, tag => {
        if ((readAttribute(tag, key) || '').toLowerCase() !== identity) return tag;
        count += 1;
        return writeAttribute(tag, attribute, value);
    });
    if (count > 1) throw new Error('Tag SEO duplicada: ' + identity + '. Revise index.html antes de preparar.');
    if (count === 1) return updated;
    const tag = '<' + tagName + ' ' + key + '="' + identity + '" ' + attribute + '="' + escapeHtml(value) + '">';
    return updated.replace(/\s*$/, newline + '    ' + tag + newline);
}

function pngDimensions(filename) {
    const buffer = fs.readFileSync(filename);
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature) || buffer.toString('ascii', 12, 16) !== 'IHDR') {
        throw new Error('assets/logo-ns.png precisa ser um PNG válido para gerar os metadados da imagem.');
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (!width || !height) throw new Error('A imagem padrão tem dimensões inválidas.');
    return { width, height };
}

function updateIndex(html, siteUrl, dimensions, companyName) {
    const newline = html.includes('\r\n') ? '\r\n' : '\n';
    const imageUrl = new URL('assets/logo-ns.png', siteUrl).href;
    let foundHead = false;
    const result = html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head\s*>)/i, (_, opening, originalHead, closing) => {
        foundHead = true;
        let head = originalHead;
        for (const [tag, key, identity, attribute, value] of [
            ['link', 'rel', 'canonical', 'href', siteUrl],
            ['meta', 'property', 'og:url', 'content', siteUrl],
            ['meta', 'property', 'og:image', 'content', imageUrl],
            ['meta', 'name', 'twitter:image', 'content', imageUrl],
            ['meta', 'property', 'og:image:alt', 'content', 'Logo da ' + companyName],
            ['meta', 'property', 'og:image:width', 'content', String(dimensions.width)],
            ['meta', 'property', 'og:image:height', 'content', String(dimensions.height)]
        ]) {
            head = upsertTag(head, tag, key, identity, attribute, value, newline);
        }

        let organizations = 0;
        head = head.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (script, start, body, end) => {
            if ((readAttribute(start, 'type') || '').toLowerCase() !== 'application/ld+json') return script;
            let data;
            try { data = JSON.parse(body); } catch {
                throw new Error('O JSON-LD em index.html é inválido. Nenhum arquivo foi alterado.');
            }
            let changed = false;
            function updateOrganization(node) {
                if (Array.isArray(node)) { node.forEach(updateOrganization); return; }
                if (!node || typeof node !== 'object') return;
                if (node['@graph']) updateOrganization(node['@graph']);
                const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
                if (!types.includes('Organization')) return;
                organizations += 1;
                node.url = siteUrl;
                if (node.logo && typeof node.logo === 'object' && !Array.isArray(node.logo)) {
                    node.logo.url = imageUrl;
                    if ('contentUrl' in node.logo) node.logo.contentUrl = imageUrl;
                } else {
                    node.logo = imageUrl;
                }
                changed = true;
            }
            updateOrganization(data);
            if (!changed) return script;
            const formatted = JSON.stringify(data, null, 2).split('\n').map(line => '    ' + line).join(newline);
            return start + newline + formatted + newline + '    ' + end;
        });
        if (!organizations) throw new Error('Não foi encontrado um Schema.org Organization em index.html.');
        return opening + head + closing;
    });
    if (!foundHead) throw new Error('Não foi encontrado <head> em index.html.');
    return result;
}

function updateNotFound(html, siteUrl) {
    const newline = html.includes('\r\n') ? '\r\n' : '\n';
    let foundHead = false;
    const result = html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head\s*>)/i, (_, opening, originalHead, closing) => {
        foundHead = true;
        let count = 0;
        let head = originalHead.replace(/<base\b[^>]*>/gi, tag => {
            count += 1;
            return writeAttribute(tag, 'href', siteUrl);
        });
        if (count > 1) throw new Error('Tag base duplicada em 404.html. Revise antes de preparar.');
        // A base deve ser declarada antes dos links, imagens e scripts relativos.
        if (!count) head = newline + '    <base href="' + escapeHtml(siteUrl) + '">' + head;
        return opening + head + closing;
    });
    if (!foundHead) throw new Error('Não foi encontrado <head> em 404.html.');
    return result;
}

function prepareProduction(root = path.resolve(__dirname, '..')) {
    const configFile = path.join(root, 'assets', 'js', 'config.js');
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(configFile, 'utf8'), sandbox, {
        filename: configFile,
        timeout: 1000,
        contextCodeGeneration: { strings: false, wasm: false }
    });
    const config = sandbox.window.NS_CONFIG;
    if (!config || typeof config !== 'object') throw new Error('Defina window.NS_CONFIG em assets/js/config.js.');
    const siteUrl = normalizeSiteUrl(config.siteUrl);
    if (!siteUrl) {
        return { status: 'pending', changed: [], message: 'TODO: preencha siteUrl em assets/js/config.js com o domínio HTTPS real e execute novamente. Nenhum arquivo foi alterado.' };
    }

    const indexFile = path.join(root, 'index.html');
    const originalIndex = fs.readFileSync(indexFile, 'utf8');
    const originalNotFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
    const newline = originalIndex.includes('\r\n') ? '\r\n' : '\n';
    const dimensions = pngDimensions(path.join(root, 'assets', 'logo-ns.png'));
    const companyName = typeof config.companyName === 'string' && config.companyName.trim() ? config.companyName.trim() : 'Nacional Site';
    // Todos os arquivos são calculados e validados antes da primeira gravação.
    const output = new Map([
        ['index.html', updateIndex(originalIndex, siteUrl, dimensions, companyName)],
        ['404.html', updateNotFound(originalNotFound, siteUrl)],
        ['robots.txt', ['User-agent: *', 'Allow: /', '', 'Sitemap: ' + new URL('sitemap.xml', siteUrl).href, ''].join(newline)],
        ['sitemap.xml', [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            '  <url>',
            '    <loc>' + escapeHtml(siteUrl) + '</loc>',
            '    <changefreq>monthly</changefreq>',
            '    <priority>1.0</priority>',
            '  </url>',
            '</urlset>',
            ''
        ].join(newline)]
    ]);

    const changes = [];
    for (const [relative, contents] of output) {
        const filename = path.join(root, relative);
        const original = fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
        if (original !== contents) changes.push({ relative, filename, original, contents });
    }
    const token = process.pid + '-' + Date.now();
    const written = [];
    try {
        for (const change of changes) {
            change.temporary = change.filename + '.ns-' + token + '.tmp';
            fs.writeFileSync(change.temporary, change.contents, { encoding: 'utf8', flag: 'wx' });
        }
        for (const change of changes) {
            fs.renameSync(change.temporary, change.filename);
            written.push(change);
        }
    } catch (error) {
        for (const change of written.reverse()) {
            if (change.original === null) fs.unlinkSync(change.filename);
            else fs.writeFileSync(change.filename, change.original, 'utf8');
        }
        throw error;
    } finally {
        for (const change of changes) {
            if (change.temporary && fs.existsSync(change.temporary)) fs.unlinkSync(change.temporary);
        }
    }
    return {
        status: 'ready',
        changed: changes.map(change => change.relative),
        message: changes.length ? 'SEO estático preparado para ' + siteUrl + ': ' + changes.map(change => change.relative).join(', ') + '.' : 'SEO estático já está atualizado para ' + siteUrl + '.'
    };
}

if (require.main === module) {
    try { console.log(prepareProduction().message); }
    catch (error) { console.error('Não foi possível preparar o site: ' + error.message); process.exitCode = 1; }
}

module.exports = { normalizeSiteUrl, updateIndex, updateNotFound, prepareProduction };

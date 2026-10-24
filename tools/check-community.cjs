'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const safeUrl = html.match(/            function safeUrl\(value\) \{[\s\S]*?\n            \}/)[0];
const init = html.slice(html.indexOf('            const communityItems = ['), html.indexOf('            let socialCount = 0;'));
const keys = ['whatsappGroupUrl', 'facebookGroupUrl', 'instagramUrl'];
const ids = ['whatsappGroupLink', 'facebookGroupLink', 'communityLink'];
let cases = 0;
for (let mask = 0; mask < 8; mask++) {
    for (const absent of ['', 'javascript:alert(1)', 'http://example.com', 'https://user:password@example.com']) {
        const CONFIG = Object.fromEntries(keys.map((key, i) => [key, mask & (1 << i) ? 'https://example.com/' + i : absent]));
        const links = Object.fromEntries(ids.map(id => [id, {
            box: { hidden: true }, attributes: {},
            closest(selector) { assert.equal(selector, '.community-app'); return this.box; },
            setAttribute(key, value) { this.attributes[key] = value; }
        }]));
        const section = { hidden: true };
        const menu = [{ hidden: true }, { hidden: true }];
        vm.runInNewContext(safeUrl + '\n' + init, {
            URL, CONFIG,
            $: id => id === 'community' ? section : links[id],
            document: { querySelectorAll: () => menu }
        });
        ids.forEach((id, i) => {
            const visible = !!(mask & (1 << i));
            assert.equal(links[id].box.hidden, !visible);
            assert.equal(!!links[id].attributes.href, visible);
        });
        assert.equal(section.hidden, mask === 0);
        menu.forEach(item => assert.equal(item.hidden, mask === 0));
        cases++;
    }
}
const section = html.match(/<section id="community"[\s\S]*?<\/section>/)[0];
assert.equal((section.match(/data-community-network=/g) || []).length, 3);
assert.equal((section.match(/rel="noopener noreferrer"/g) || []).length, 3);
assert.equal((section.match(/target="_blank"/g) || []).length, 3);
assert.equal((section.match(/<a[^>]+aria-label=/g) || []).length, 3);
assert.ok(html.includes("Analytics.track('community_click', { network: community.getAttribute('data-community-network') })"));
console.log('Comunidade: ' + cases + ' combinações de configuração e validação de links passaram.');

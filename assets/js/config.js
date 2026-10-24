/*
 * CONFIGURAÇÃO CENTRAL DA NACIONAL SITE
 * Preencha somente com informações reais. Campos vazios permanecem desativados.
 * URLs externas: use endereços HTTPS completos. Imagens também aceitam caminhos locais.
 * TODO: definir domínio, contato, redes e políticas comerciais antes da publicação.
 */
window.NS_CONFIG = {
    companyName: "Nacional Site",
    siteUrl: "",                  // TODO: domínio HTTPS definitivo, sem caminhos de páginas.
    whatsappNumber: "",          // TODO: número real com DDI e DDD, somente dígitos.
    instagramUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
    communityUrl: "",            // Compatibilidade: usado como LinkedIn se linkedinUrl estiver vazio.
    whatsappGroupUrl: "",
    facebookGroupUrl: "",
    founderImage: "assets/fundador.png", // Foto do Julio, fundador da Nacional Site.
    favicon: "",                 // Vazio mantém assets/logo-ns.png.
    testimonials: [],             // Somente relatos reais autorizados: { name, business, text }.
    demoUrls: {
        simples: "https://julio2-3acerola.github.io/mvpa-aidahoraclint/",
        medio: "",               // TODO: inserir uma demonstração real do plano Médio quando disponível.
        pro: "https://julio2-3acerola.github.io/mvpa-aiteria/"
    },
    // Capturas reais das demos (WebP/AVIF/PNG). Vazio mantém o mockup ilustrativo.
    projectImages: { simples: "", medio: "", pro: "" },
    // Mensalidades em reais, como números. Campo vazio exibe "Consulte o valor mensal".
    monthlyPlans: {
        hosting: 29.90,           // Hospedagem + manutenção técnica básica.
        updates: 49.90,           // Hospedagem + pequenas alterações de textos, imagens e preços.
        maintenance: 79.90        // Hospedagem PRO; chave mantida por compatibilidade.
    }
};

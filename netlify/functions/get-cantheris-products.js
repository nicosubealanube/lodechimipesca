// netlify/functions/get-cantheris-products.js

function cleanProductName(rawName) {
    if (!rawName) return 'Producto Cantheris';
    let name = String(rawName).trim();

    // Shorten overly long SEO titles (e.g. "CUELLO MULTIFUNCION con Filtro Uv Deportivo...")
    if (/^cuello multifuncion/i.test(name)) {
        const modMatch = name.match(/mod:\s*([^\.\,]+)/i);
        return modMatch ? `Cuello UV ${modMatch[1].trim()}` : 'Cuello Multifunción UV';
    }
    if (/^gorra deportiva/i.test(name)) {
        const short = name.replace(/regulable\s+tactel\s+cantheris\s*/i, '').replace(/\.$/, '').trim();
        return short || 'Gorra Deportiva';
    }

    // Convert ALL CAPS short model names to readable Title Case
    if (name === name.toUpperCase() && name.length > 3) {
        name = name
            .toLowerCase()
            .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    }

    return name.length > 32 ? `${name.slice(0, 30).trim()}…` : name;
}

function extractProductsFromHtml(html) {
    const products = [];
    const seenUrls = new Set();
    const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        try {
            const parsed = JSON.parse(match[1].trim());
            const items = Array.isArray(parsed) ? parsed : [parsed];

            for (const item of items) {
                if (!item || item['@type'] !== 'Product') continue;

                const url =
                    (typeof item.mainEntityOfPage === 'string'
                        ? item.mainEntityOfPage
                        : item.mainEntityOfPage?.['@id']) || item.url;

                const image = Array.isArray(item.image) ? item.image[0] : item.image;
                const name = cleanProductName(item.name);

                if (url && image && !seenUrls.has(url)) {
                    seenUrls.add(url);
                    products.push({ name, image, url });
                }
            }
        } catch {
            // Skip malformed JSON-LD blocks
        }
    }

    return products.slice(0, 12);
}

export const handler = async function (event) {
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    try {
        const response = await fetch('https://www.cantheris.com/productos/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ChimiPescaBot/1.0)',
                Accept: 'text/html,application/xhtml+xml',
            },
        });

        if (!response.ok) {
            throw new Error(`Cantheris returned status ${response.status}`);
        }

        const html = await response.text();
        const products = extractProductsFromHtml(html);

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                // Cache for 6 hours at Netlify Edge so catalog stays fresh automatically
                'Cache-Control': 'public, max-age=21600, s-maxage=21600',
            },
            body: JSON.stringify({ products }),
        };
    } catch (error) {
        console.error('Error fetching Cantheris products:', error);
        return {
            statusCode: 502,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to fetch Cantheris products', products: [] }),
        };
    }
};

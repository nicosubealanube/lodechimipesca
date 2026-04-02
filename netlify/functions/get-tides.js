// netlify/functions/get-tides.js
exports.handler = async function (event, context) {
    const { lat, lon } = event.queryStringParameters;

    if (!lat || !lon) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: JSON.stringify({ error: "Missing lat or lon parameters" })
        };
    }

    try {
        const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=sea_level_height_msl&forecast_days=3&timezone=auto`);
        
        if (!response.ok) {
            throw new Error(`Open-Meteo API returned status ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                // Enable edge caching
                "Cache-Control": "public, max-age=3600"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Error fetching tide data:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: JSON.stringify({ error: "Failed to fetch tide data from Open-Meteo" })
        };
    }
};

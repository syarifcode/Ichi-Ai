// File: netlify/functions/api-proxy.js
exports.handler = async (event, context) => {
    try {
        // Ambil pesan dari parameter URL
        const prompt = event.queryStringParameters.prompt;
        
        if (!prompt) {
            return { statusCode: 400, body: "Prompt is required" };
        }

        // Panggil API Magma dari sisi server (Bebas CORS)
        const targetUrl = `https://magma-api.biz.id/ai/deepseek?prompt=${encodeURIComponent(prompt)}`;
        const response = await fetch(targetUrl);
        const data = await response.json();

        // Kirim balik ke frontend dengan izin akses penuh (Bypass CORS)
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Izinkan semua website mengakses
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed fetching data", details: error.toString() })
        };
    }
};

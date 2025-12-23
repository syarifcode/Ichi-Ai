const https = require('https');

exports.handler = async (event, context) => {
    // Ambil prompt dari URL
    const prompt = event.queryStringParameters.prompt;
    
    if (!prompt) {
        return { statusCode: 400, body: "Prompt is required" };
    }

    const targetUrl = `https://magma-api.biz.id/ai/deepseek?prompt=${encodeURIComponent(prompt)}`;

    // Kita gunakan teknik manual 'https' agar kompatibel dengan semua versi server Netlify
    return new Promise((resolve, reject) => {
        const request = https.get(targetUrl, (res) => {
            let data = '';

            // Kumpulkan data potongan demi potongan
            res.on('data', (chunk) => {
                data += chunk;
            });

            // Setelah data lengkap, kirim balik ke website
            res.on('end', () => {
                resolve({
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json"
                    },
                    body: data
                });
            });
        });

        // Jika error koneksi
        request.on('error', (err) => {
            resolve({
                statusCode: 500,
                body: JSON.stringify({ error: "Failed to fetch data", details: err.message })
            });
        });
    });
};

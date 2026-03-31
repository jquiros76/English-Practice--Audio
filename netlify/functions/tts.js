// netlify/functions/tts.js

const cache = {};

exports.handler = async (event) => {
  try {
    // 🧠 Solo permitir POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    // 🧠 Leer body seguro
    let text = "";
    try {
      const body = JSON.parse(event.body || "{}");
      text = body.text || "";
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON" })
      };
    }

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Text is required" })
      };
    }

    // 🔥 CACHE (evita pagar OpenAI varias veces)
    if (cache[text]) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: cache[text] })
      };
    }

    // 🔥 LLAMADA A OPENAI TTS
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  model: "gpt-4o-mini-tts",
  input: text,
  voice: "nova",
  format: "mp3"
})

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OpenAI error", detail: errText })
      };
    }

    // 🔥 convertir audio a base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const audio = `data:audio/mp3;base64,${base64}`;

    // 🔥 guardar en cache
    cache[text] = audio;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

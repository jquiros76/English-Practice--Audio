const cache = {};

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    // 🔥 SI YA EXISTE → NO LLAMA A OPENAI
    if (cache[text]) {
      return {
        statusCode: 200,
        body: JSON.stringify({ audio: cache[text] })
      };
    }

    // 🔥 SI NO EXISTE → GENERA
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        input: text,
        voice: "nova",
        response_format: "mp3"
      })
    });

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const audio = `data:audio/mp3;base64,${base64}`;

    // 🔥 GUARDA EN CACHE GLOBAL
    cache[text] = audio;

    return {
      statusCode: 200,
      body: JSON.stringify({ audio })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

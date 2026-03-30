exports.handler = async (event) => {
  try {

    // 🧠 Aceptar GET o POST
    let text = "Hello";

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      text = body.text || "Hello";
    }

    // 🔥 RESPUESTA DE PRUEBA (para validar frontend)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        audio: `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

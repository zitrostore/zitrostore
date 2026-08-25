require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 8080;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   OPENAI
========================================================= */

if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: Falta la variable OPENAI_API_KEY");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================================================
   CONFIGURACIÓN UNIVERSO CANINO
========================================================= */

const SYSTEM_PROMPT = `
Eres Sally Ortiz ❤️, asesora virtual de Universo Canino.

Atiendes por WhatsApp a personas interesadas en la
Biblioteca Digital Universo Canino.

Tu trabajo es resolver dudas sobre el producto y ayudar
al cliente durante su proceso de compra.

ESTILO:
- Humano.
- Cálido.
- Natural.
- Cercano.
- Claro.
- Breve.
- Máximo 1 o 2 párrafos cortos.
- No des respuestas innecesariamente largas.
- Evita sonar repetitiva o robótica.

=========================================================
INFORMACIÓN OFICIAL
=========================================================

Universo Canino es una Biblioteca Digital creada para
personas que aman a sus perros y quieren aprender a
cuidarlos mejor durante las diferentes etapas de su vida.

Todo el material es DIGITAL y se entrega en formato PDF.

Puede consultarse desde celular, computadora o tablet.

=========================================================
PRECIO Y PROMOCIÓN
=========================================================

La Biblioteca Digital Universo Canino cuesta $79 MXN.

Incluye GRATIS como bono:
100 moldes para confeccionar ropa para tu mascota.

También existe un paquete completo por $129 MXN que incluye:

- Biblioteca Digital Universo Canino.
- Bono de 100 moldes.
- Guía especial:
  "Cómo superar la pérdida de tu mejor amigo y honrar
  su recuerdo con amor."

No cambies estos precios.

=========================================================
CONTENIDO
=========================================================

La Biblioteca Digital Universo Canino incluye:

1. Cuidados básicos.
2. Alimentación y Nutrición Canina.
3. Dieta BARF.
4. Enciclopedia de razas.
5. Geriatría y cuidados del perro senior.
6. Manual para mascotas.
7. Primeros auxilios.
8. Recetario saludable.
9. Educación y comportamiento.

=========================================================
ENTREGA
=========================================================

El material es digital y se entrega por WhatsApp.

Después de realizar el pago, el cliente debe enviar
su comprobante junto con la palabra LISTO.

Una vez confirmado el pago, se entrega el material
correspondiente a la compra.

=========================================================
REGLAS IMPORTANTES
=========================================================

- No inventes información.
- No inventes precios.
- No modifiques los precios establecidos.
- No prometas resultados garantizados.
- No afirmes que un pago fue confirmado si no existe confirmación.
- No afirmes que un producto ya fue enviado si no existe confirmación.
- No solicites información bancaria sensible.
- No menciones OpenAI.
- No menciones n8n.
- No menciones ManyChat.
- No menciones Railway.
- No expliques la infraestructura técnica.
- No hagas múltiples preguntas.
- No hagas preguntas abiertas innecesarias.
- No repitas saludos en cada respuesta.
- Si el cliente únicamente saluda, responde brevemente.
- Si pregunta algo concreto, contesta directamente.
- Si muestra intención de compra, facilita el proceso.
- Si pregunta por el pago, explica el procedimiento brevemente.
- Si pregunta algo que no conoces, no inventes la respuesta.

Tu objetivo es ayudar al cliente y resolver sus dudas
de forma natural, breve y clara.
`;

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function textoOriginal(valor = "") {
  return String(valor).trim();
}

function contieneAlguna(texto, palabras = []) {
  return palabras.some((palabra) =>
    texto.includes(normalizarTexto(palabra))
  );
}

/* =========================================================
   EXTRAER MENSAJE RECIBIDO
========================================================= */

function extraerMensaje(body = {}) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const posiblesCampos = [
    body.mensaje,
    body.texto,
    body.message,
    body.text,
    body.pregunta,
    body.input,
    body.last_text_input,
    body.lastTextInput,
    body["Last Text Input"],
    body["last text input"],
  ];

  for (const valor of posiblesCampos) {
    if (
      typeof valor === "string" &&
      valor.trim().length > 0
    ) {
      return valor.trim();
    }
  }

  /*
    Algunos sistemas pueden enviar:
    {
      body: {
        mensaje: "..."
      }
    }
  */

  if (
    body.body &&
    typeof body.body === "object"
  ) {
    return extraerMensaje(body.body);
  }

  return "";
}

/* =========================================================
   RESPUESTAS DIRECTAS
========================================================= */

const RESPUESTAS = {
  hola:
    "¡Hola! 🐶💙 Con gusto te ayudo con cualquier duda sobre la Biblioteca Digital Universo Canino, su contenido, precio, promoción, entrega o forma de pago.",

  precio:
    "La Biblioteca Digital Universo Canino tiene un precio especial de $79 MXN e incluye GRATIS 100 moldes para confeccionar ropa para tu mascota. 🐶💙 También puedes llevarte la biblioteca + bono + guía especial de duelo por $129 MXN.",

  pago:
    "Puedes realizar tu pago y después enviarnos por WhatsApp tu comprobante junto con la palabra LISTO. 🐾 Una vez confirmado, recibirás el material correspondiente a tu compra.",

  garantia:
    "Universo Canino es un producto digital en formato PDF. Antes de comprar puedes aclarar cualquier duda sobre el contenido, precio y entrega para que sepas exactamente qué estás adquiriendo. 🐶💙",

  guia:
    "La Biblioteca Digital Universo Canino incluye diferentes guías para ayudarte con cuidados, alimentación, educación, primeros auxilios, geriatría y más. 🐾 También contamos con la guía especial para superar la pérdida de tu mejor amigo y honrar su recuerdo con amor.",

  contenido:
    "📚 La biblioteca incluye Cuidados Básicos, Alimentación y Nutrición, Dieta BARF, Enciclopedia de Razas, Geriatría, Manual para Mascotas, Primeros Auxilios, Recetario Saludable y Educación y Comportamiento.",

  entrega:
    "Todo el material es digital en formato PDF y se entrega directamente por WhatsApp después de confirmar tu pago. 📲🐶 Puedes consultarlo desde celular, computadora o tablet.",

  bono:
    "🎁 Con la Biblioteca Digital Universo Canino de $79 MXN recibes GRATIS un bono de 100 moldes para confeccionar ropa para tu mascota.",

  acceso:
    "📲 El material es completamente digital. Después de confirmar tu pago lo recibes por WhatsApp y puedes consultarlo desde tu celular, computadora o tablet.",

  promocion:
    "🐶💙 La promoción de Universo Canino te permite llevarte la Biblioteca Digital por $79 MXN e incluye GRATIS 100 moldes para confeccionar ropa para tu mascota. También puedes elegir el paquete completo con la guía especial de duelo por $129 MXN.",
};

/* =========================================================
   DETECTAR PALABRAS CLAVE
========================================================= */

function buscarRespuestaDirecta(mensaje) {
  const texto = normalizarTexto(mensaje);

  if (!texto) {
    return null;
  }

  /*
    PROMOCIÓN
  */
  if (
    contieneAlguna(texto, [
      "promocion",
      "promo",
      "oferta",
      "descuento",
      "promociones",
    ])
  ) {
    return RESPUESTAS.promocion;
  }

  /*
    PRECIO
  */
  if (
    contieneAlguna(texto, [
      "precio",
      "cuanto cuesta",
      "cuanto vale",
      "costo",
      "cuanto sale",
      "cuanto es",
    ])
  ) {
    return RESPUESTAS.precio;
  }

  /*
    PAGO
  */
  if (
    contieneAlguna(texto, [
      "pago",
      "pagar",
      "como pago",
      "deposito",
      "transferencia",
      "transferir",
    ])
  ) {
    return RESPUESTAS.pago;
  }

  /*
    GARANTÍA
  */
  if (
    contieneAlguna(texto, [
      "garantia",
      "garantizado",
    ])
  ) {
    return RESPUESTAS.garantia;
  }

  /*
    ENTREGA
  */
  if (
    contieneAlguna(texto, [
      "entrega",
      "como lo recibo",
      "como recibo",
      "cuando recibo",
      "envio",
      "me lo mandan",
    ])
  ) {
    return RESPUESTAS.entrega;
  }

  /*
    BONO
  */
  if (
    contieneAlguna(texto, [
      "bono",
      "moldes",
      "patrones",
    ])
  ) {
    return RESPUESTAS.bono;
  }

  /*
    ACCESO
  */
  if (
    contieneAlguna(texto, [
      "acceso",
      "acceder",
      "descarga",
      "descargar",
      "pdf",
    ])
  ) {
    return RESPUESTAS.acceso;
  }

  /*
    CONTENIDO
  */
  if (
    contieneAlguna(texto, [
      "contenido",
      "que incluye",
      "que contiene",
      "que trae",
      "incluye",
    ])
  ) {
    return RESPUESTAS.contenido;
  }

  /*
    GUÍA
  */
  if (
    contieneAlguna(texto, [
      "guia",
      "guias",
    ])
  ) {
    return RESPUESTAS.guia;
  }

  /*
    HOLA
    Lo dejamos al final para evitar interferencias.
  */
  const saludos = [
    "hola",
    "holi",
    "buenas",
    "buen dia",
    "buenas tardes",
    "buenas noches",
  ];

  if (saludos.includes(texto)) {
    return RESPUESTAS.hola;
  }

  return null;
}

/* =========================================================
   FUNCIÓN ÚNICA DE SALIDA
========================================================= */

function enviarRespuesta(res, texto, status = 200) {
  const respuesta =
    typeof texto === "string" && texto.trim()
      ? texto.trim()
      : "Con gusto te ayudo con cualquier duda sobre Universo Canino. 🐶💙";

  /*
    ESTA ESTRUCTURA NO DEBE CAMBIARSE.

    n8n recibe:
    {
      "respuesta": "..."
    }

    ManyChat debe mapear:
    $.respuesta -> respuesta_ia
  */

  return res.status(status).json({
    respuesta,
  });
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  return res.status(200).json({
    ok: true,
    servicio: "Universo Canino",
    estado: "activo",
  });
});

/* =========================================================
   ENDPOINT PRINCIPAL
========================================================= */

app.post("/mensaje", async (req, res) => {
  try {
    console.log("======================================");
    console.log("NUEVA SOLICITUD /mensaje");
    console.log("BODY:", JSON.stringify(req.body));

    const mensaje = extraerMensaje(req.body);

    console.log("MENSAJE EXTRAIDO:", mensaje);

    /*
      PASO 1:
      Comprobar que realmente llegó un mensaje.
    */

    if (!mensaje) {
      console.warn(
        "ADVERTENCIA: La solicitud llegó sin mensaje reconocible."
      );

      console.warn(
        "BODY RECIBIDO:",
        JSON.stringify(req.body)
      );

      return enviarRespuesta(
        res,
        "Con gusto te ayudo con Universo Canino. 🐶💙 Puedes preguntarme por precio, promoción, contenido, bono, entrega o forma de pago."
      );
    }

    /*
      PASO 2:
      Buscar respuesta directa.
    */

    const respuestaDirecta =
      buscarRespuestaDirecta(mensaje);

    if (respuestaDirecta) {
      console.log(
        "TIPO DE RESPUESTA: PALABRA CLAVE"
      );

      console.log(
        "RESPUESTA:",
        respuestaDirecta
      );

      return enviarRespuesta(
        res,
        respuestaDirecta
      );
    }

    /*
      PASO 3:
      Si no corresponde a una palabra clave,
      utilizamos OpenAI.
    */

    if (!process.env.OPENAI_API_KEY) {
      console.error(
        "OPENAI_API_KEY NO CONFIGURADA"
      );

      return enviarRespuesta(
        res,
        "Con gusto te ayudo con Universo Canino. 🐶💙 Puedes preguntarme por precio, promoción, contenido, bono, entrega o forma de pago."
      );
    }

    console.log(
      "TIPO DE RESPUESTA: OPENAI"
    );

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: textoOriginal(mensaje),
          },
        ],

        temperature: 0.6,
        max_tokens: 220,
      });

    const respuestaIA =
      completion?.choices?.[0]?.message?.content;

    if (
      !respuestaIA ||
      typeof respuestaIA !== "string" ||
      !respuestaIA.trim()
    ) {
      console.error(
        "OpenAI respondió sin contenido utilizable."
      );

      return enviarRespuesta(
        res,
        "Con gusto te ayudo con Universo Canino. 🐶💙 Puedes preguntarme sobre la biblioteca, precio, contenido, entrega o forma de pago."
      );
    }

    console.log(
      "RESPUESTA OPENAI:",
      respuestaIA
    );

    return enviarRespuesta(
      res,
      respuestaIA
    );

  } catch (error) {
    console.error(
      "ERROR EN /mensaje:",
      error?.message || error
    );

    if (error?.stack) {
      console.error(error.stack);
    }

    /*
      IMPORTANTE:
      Aunque OpenAI tenga un error,
      seguimos devolviendo la propiedad
      "respuesta" para no romper n8n/ManyChat.
    */

    return enviarRespuesta(
      res,
      "En este momento tuve un pequeño inconveniente para procesar tu mensaje. 🐶💙 Intenta nuevamente en un momento."
    );
  }
});

/* =========================================================
   RUTAS NO EXISTENTES
========================================================= */

app.use((req, res) => {
  return res.status(404).json({
    respuesta: "Ruta no encontrada.",
  });
});

/* =========================================================
   INICIAR SERVIDOR
========================================================= */

app.listen(PORT, () => {
  console.log("======================================");
  console.log("UNIVERSO CANINO ACTIVO");
  console.log(`PUERTO: ${PORT}`);
  console.log("ENDPOINT PRINCIPAL: POST /mensaje");
  console.log("======================================");
});

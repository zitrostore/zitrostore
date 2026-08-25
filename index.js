require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   OPENAI
========================================================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================================================
   PROMPT UNIVERSO CANINO
========================================================= */

const SYSTEM_PROMPT = `
Eres Sally Ortiz ❤️, asistente de atención de Universo Canino.

Atiendes por WhatsApp a personas interesadas en la
Biblioteca Digital Universo Canino.

RESPONDE:
- De forma humana, cálida y natural.
- Breve y clara.
- Máximo 1 o 2 párrafos cortos.
- Sin sonar robótica.
- Sin repetir saludos innecesariamente.
- Sin hacer preguntas abiertas innecesarias.

INFORMACIÓN OFICIAL:

La Biblioteca Digital Universo Canino cuesta $79 MXN.

Incluye GRATIS:
100 moldes para confeccionar ropa para mascotas.

El paquete completo cuesta $129 MXN e incluye:
- Biblioteca Digital Universo Canino.
- Bono de 100 moldes.
- Guía especial:
"Cómo superar la pérdida de tu mejor amigo y honrar
su recuerdo con amor."

CONTENIDO DE LA BIBLIOTECA:

1. Cuidados básicos.
2. Alimentación y Nutrición Canina.
3. Dieta BARF.
4. Enciclopedia de razas.
5. Geriatría y perro senior.
6. Manual para mascotas.
7. Primeros auxilios.
8. Recetario saludable.
9. Educación y comportamiento.

ENTREGA:

Todo el material es digital en formato PDF.

Se entrega por WhatsApp después de confirmar el pago.

El cliente debe enviar su comprobante junto con
la palabra LISTO.

REGLAS:

- Nunca inventes precios.
- Nunca cambies los precios.
- No prometas resultados garantizados.
- No afirmes que un pago está confirmado si no lo sabes.
- No afirmes que ya se entregó material si no lo sabes.
- No menciones OpenAI.
- No menciones Railway.
- No menciones n8n.
- No menciones ManyChat.
- No expliques la infraestructura técnica.
- Si preguntan algo concreto, responde directamente.
`;

/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   EXTRAER MENSAJE
   ACEPTAMOS VARIAS FORMAS DE ENTRADA
========================================================= */

function extraerMensaje(body = {}) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const campos = [
    body.mensaje,
    body.message,
    body.texto,
    body.text,
    body.pregunta,
    body.input,
    body.ultima_entrada_texto,
    body.ultimaEntradaTexto,
    body.last_text_input,
    body.lastTextInput,
    body["Last Text Input"],
    body["Última entrada de texto"],
    body["Ultima entrada de texto"],
  ];

  for (const campo of campos) {
    if (
      typeof campo === "string" &&
      campo.trim() !== ""
    ) {
      return campo.trim();
    }
  }

  // Si viene anidado dentro de body
  if (
    body.body &&
    typeof body.body === "object"
  ) {
    const encontrado = extraerMensaje(body.body);

    if (encontrado) {
      return encontrado;
    }
  }

  // Si viene dentro de data
  if (
    body.data &&
    typeof body.data === "object"
  ) {
    const encontrado = extraerMensaje(body.data);

    if (encontrado) {
      return encontrado;
    }
  }

  return "";
}

/* =========================================================
   RESPUESTAS DIRECTAS
========================================================= */

const RESPUESTAS = {

  hola:
    "¡Hola! 🐶💙 Con gusto te ayudo con cualquier duda sobre Universo Canino, su contenido, precio, promoción, entrega o forma de pago.",

  precio:
    "🐶 La Biblioteca Digital Universo Canino tiene un precio especial de $79 MXN e incluye GRATIS 100 moldes para confeccionar ropa para tu mascota. También tenemos el paquete completo por $129 MXN con la guía especial de duelo.",

  pago:
    "💳 Para adquirir Universo Canino puedes realizar tu pago y después enviar por WhatsApp tu comprobante junto con la palabra LISTO. Una vez confirmado, recibirás el material correspondiente a tu compra.",

  garantia:
    "🐶 Universo Canino es un producto digital en formato PDF. Antes de comprar puedes resolver tus dudas sobre el contenido, precio y forma de entrega para saber exactamente qué estás adquiriendo.",

  guia:
    "📚 Universo Canino reúne guías sobre cuidados, alimentación, Dieta BARF, razas, geriatría, primeros auxilios, recetas y educación. También contamos con una guía especial para superar la pérdida de tu mejor amigo y honrar su recuerdo con amor.",

  contenido:
    "📚 La biblioteca incluye Cuidados Básicos, Alimentación y Nutrición, Dieta BARF, Enciclopedia de Razas, Geriatría, Manual para Mascotas, Primeros Auxilios, Recetario Saludable y Educación y Comportamiento.",

  entrega:
    "📲 Todo el material es digital en formato PDF y se entrega por WhatsApp después de confirmar tu pago. Puedes consultarlo desde celular, computadora o tablet.",

  bono:
    "🎁 Al adquirir la Biblioteca Digital Universo Canino por $79 MXN recibes GRATIS un bono de 100 moldes para confeccionar ropa para tu mascota.",

  acceso:
    "📲 El acceso es digital. Una vez confirmado tu pago, recibirás por WhatsApp el material correspondiente y podrás consultarlo desde celular, computadora o tablet.",

  promocion:
    "🐶💙 La promoción de Universo Canino es de $79 MXN por la Biblioteca Digital más 100 moldes GRATIS. También puedes llevarte el paquete completo con Biblioteca + bono + guía especial de duelo por $129 MXN."
};

/* =========================================================
   DETECTOR DE PALABRAS
========================================================= */

function tiene(texto, palabras) {
  return palabras.some((palabra) =>
    texto.includes(normalizar(palabra))
  );
}

function respuestaPorPalabraClave(mensaje) {

  const texto = normalizar(mensaje);

  if (!texto) return null;

  /* PROMOCION */

  if (
    tiene(texto, [
      "promocion",
      "promoción",
      "promo",
      "oferta",
      "descuento"
    ])
  ) {
    return RESPUESTAS.promocion;
  }

  /* PRECIO */

  if (
    tiene(texto, [
      "precio",
      "cuanto cuesta",
      "cuánto cuesta",
      "cuanto vale",
      "cuánto vale",
      "costo",
      "cuanto sale",
      "cuánto sale"
    ])
  ) {
    return RESPUESTAS.precio;
  }

  /* PAGO */

  if (
    tiene(texto, [
      "pago",
      "pagar",
      "quiero pagar",
      "como pago",
      "cómo pago",
      "deposito",
      "depósito",
      "transferencia"
    ])
  ) {
    return RESPUESTAS.pago;
  }

  /* GARANTIA */

  if (
    tiene(texto, [
      "garantia",
      "garantía"
    ])
  ) {
    return RESPUESTAS.garantia;
  }

  /* ENTREGA */

  if (
    tiene(texto, [
      "entrega",
      "como lo recibo",
      "cómo lo recibo",
      "cuando lo recibo",
      "cuándo lo recibo",
      "envio",
      "envío",
      "me lo mandan"
    ])
  ) {
    return RESPUESTAS.entrega;
  }

  /* BONO */

  if (
    tiene(texto, [
      "bono",
      "moldes",
      "patrones"
    ])
  ) {
    return RESPUESTAS.bono;
  }

  /* ACCESO */

  if (
    tiene(texto, [
      "acceso",
      "acceder",
      "descargar",
      "descarga",
      "pdf"
    ])
  ) {
    return RESPUESTAS.acceso;
  }

  /* CONTENIDO */

  if (
    tiene(texto, [
      "contenido",
      "que incluye",
      "qué incluye",
      "que contiene",
      "qué contiene",
      "que trae",
      "qué trae"
    ])
  ) {
    return RESPUESTAS.contenido;
  }

  /* GUIA */

  if (
    tiene(texto, [
      "guia",
      "guía",
      "guias",
      "guías"
    ])
  ) {
    return RESPUESTAS.guia;
  }

  /* HOLA */

  if (
    tiene(texto, [
      "hola",
      "buen dia",
      "buen día",
      "buenas tardes",
      "buenas noches"
    ])
  ) {
    return RESPUESTAS.hola;
  }

  return null;
}

/* =========================================================
   FUNCIÓN DE RESPUESTA

   IMPORTANTE:
   SIEMPRE DEVUELVE:
   {
      "respuesta": "..."
   }

   PARA QUE n8n Y MANYCHAT PUEDAN LEER $.respuesta
========================================================= */

function responder(res, texto, status = 200) {

  let respuesta = texto;

  if (
    typeof respuesta !== "string" ||
    respuesta.trim() === ""
  ) {
    respuesta =
      "Con gusto te ayudo con cualquier duda sobre Universo Canino. 🐶💙";
  }

  return res
    .status(status)
    .type("application/json")
    .json({
      respuesta: respuesta.trim()
    });
}

/* =========================================================
   RUTA DE PRUEBA
========================================================= */

app.get("/", (req, res) => {

  return res.status(200).json({
    ok: true,
    servicio: "Universo Canino",
    estado: "activo"
  });

});

/* =========================================================
   ENDPOINT /mensaje
========================================================= */

app.post("/mensaje", async (req, res) => {

  console.log("\n======================================");
  console.log("NUEVA SOLICITUD");
  console.log("FECHA:", new Date().toISOString());
  console.log("BODY COMPLETO:");
  console.log(JSON.stringify(req.body, null, 2));

  try {

    /* -----------------------------------------
       1. EXTRAER MENSAJE
    ----------------------------------------- */

    const mensaje = extraerMensaje(req.body);

    console.log("MENSAJE EXTRAIDO:");
    console.log(mensaje || "[VACIO]");

    /* -----------------------------------------
       2. SI NO LLEGÓ TEXTO
    ----------------------------------------- */

    if (!mensaje) {

      console.error(
        "ERROR: llegó la petición pero no encontré el texto."
      );

      return responder(
        res,
        "Con gusto te ayudo con Universo Canino. 🐶💙 Puedes preguntarme por precio, promoción, contenido, entrega, bono o forma de pago."
      );
    }

    /* -----------------------------------------
       3. PALABRAS CLAVE
    ----------------------------------------- */

    const directa =
      respuestaPorPalabraClave(mensaje);

    if (directa) {

      console.log(
        "RESPUESTA DIRECTA ACTIVADA"
      );

      console.log(
        "RESPUESTA:",
        directa
      );

      return responder(
        res,
        directa
      );
    }

    /* -----------------------------------------
       4. SI NO HAY API KEY
    ----------------------------------------- */

    if (!process.env.OPENAI_API_KEY) {

      console.error(
        "ERROR: OPENAI_API_KEY NO CONFIGURADA"
      );

      return responder(
        res,
        "Con gusto te ayudo con Universo Canino. 🐶💙 Puedes preguntarme por precio, promoción, contenido, entrega, bono o forma de pago."
      );
    }

    /* -----------------------------------------
       5. CONSULTAR OPENAI
    ----------------------------------------- */

    console.log(
      "CONSULTANDO OPENAI..."
    );

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: mensaje
          }
        ],

        temperature: 0.5,
        max_tokens: 220
      });

    /* -----------------------------------------
       6. EXTRAER RESPUESTA
    ----------------------------------------- */

    const respuestaIA =
      completion &&
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message &&
      completion.choices[0].message.content
        ? completion.choices[0].message.content.trim()
        : "";

    console.log(
      "RESPUESTA OPENAI:"
    );

    console.log(
      respuestaIA || "[VACIA]"
    );

    /* -----------------------------------------
       7. RESPUESTA VACÍA DE OPENAI
    ----------------------------------------- */

    if (!respuestaIA) {

      return responder(
        res,
        "Con gusto te ayudo con Universo Canino. 🐶💙 Puedes preguntarme sobre precio, contenido, promoción, entrega o forma de pago."
      );
    }

    /* -----------------------------------------
       8. RESPUESTA FINAL
    ----------------------------------------- */

    return responder(
      res,
      respuestaIA
    );

  } catch (error) {

    console.error(
      "ERROR GENERAL EN /mensaje:"
    );

    console.error(
      error?.message || error
    );

    if (error?.stack) {
      console.error(error.stack);
    }

    /*
      INCLUSO SI OPENAI FALLA,
      DEVOLVEMOS $.respuesta.
    */

    return responder(
      res,
      "En este momento tuve un inconveniente para procesar tu mensaje. 🐶💙 Intenta nuevamente en un momento."
    );
  }
});

/* =========================================================
   404
========================================================= */

app.use((req, res) => {

  return res.status(404).json({
    respuesta: "Ruta no encontrada."
  });

});

/* =========================================================
   SERVIDOR
========================================================= */

app.listen(PORT, () => {

  console.log("\n======================================");
  console.log("UNIVERSO CANINO");
  console.log("SERVIDOR ACTIVO");
  console.log(`PUERTO: ${PORT}`);
  console.log("POST /mensaje");
  console.log("======================================\n");

});

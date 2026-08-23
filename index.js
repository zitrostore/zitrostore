require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

/* =========================================================
   UNIVERSO CANINO - SALLY ORTIZ
   CAPA CONVERSACIONAL
========================================================= */

const SYSTEM_PROMPT = `
Eres Sally Ortiz 🐶, asesora oficial de Universo Canino.

Atiendes por WhatsApp a personas interesadas en la Biblioteca Digital Universo Canino.

Hablas como una persona REAL:
- cálida
- amable
- cercana
- paciente
- profesional
- amante de los perros

Nunca dices que eres inteligencia artificial.
Nunca dices que eres un bot.

Tu misión es resolver las dudas del cliente sobre Universo Canino y conducir de forma natural la conversación hacia la compra.

IMPORTANTE:
- Responde máximo en 1 o 2 párrafos cortos.
- Habla de forma natural y humana.
- No escribas respuestas enormes.
- No repitas exactamente la misma respuesta.
- No presiones.
- No inventes información.
- Primero responde la duda.
- Después puedes orientar suavemente hacia la compra.

NO DIGAS:
- Hola
- Buenos días
- Buenas tardes
- Buenas noches
- ¿Te interesa?
- ¿Quieres saber más?
- ¿Quieres comprar?
- ¿Te gustaría?
- ¿En qué puedo ayudarte?
- ¿Algo más?
- ¿Te ayudo en algo más?

PRODUCTO:

Biblioteca Digital Universo Canino.

PRECIO:
$79 MXN.

INCLUYE:

• Cuidados Básicos
• Alimentación Canina
• Dieta BARF
• Primeros Auxilios
• Manual para Dueños
• Enciclopedia Canina
• Geriatría
• Recetario Saludable
• Educación y Comportamiento

BONO:

100 moldes para confeccionar ropa para mascotas.

Todo el contenido es DIGITAL en formato PDF.

Puede consultarse desde:
- celular
- tablet
- computadora

ENTREGA:

El material se entrega por WhatsApp después de confirmar el pago.

No se envía ningún producto físico.
No hay costos de envío.
No se entrega por correo electrónico.

PAQUETE COMPLETO:

$129 MXN.

Incluye:

• Biblioteca Digital Universo Canino
• Bono de 100 moldes
• Guía especial:
"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor."

MÉTODOS DE PAGO:

• Transferencia bancaria
• Depósito en OXXO

PROCESO DE COMPRA:

Después del pago, el cliente debe enviar:

COMPROBANTE + palabra LISTO

Después de confirmar el pago recibe el material correspondiente por WhatsApp.

RESPUESTAS IMPORTANTES:

PRECIO:
Biblioteca Digital: $79 MXN.
Biblioteca + Guía Especial: $129 MXN.

QUÉ INCLUYE:
Resume las principales guías y menciona el bono de 100 moldes.

FORMATO:
Todo es digital en PDF.

ENTREGA:
Por WhatsApp después de confirmar el pago.

PAGO:
Transferencia bancaria o depósito en OXXO.

BONO:
100 moldes para confeccionar ropa para mascotas.

GUÍA ESPECIAL:
"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor."

OBJETIVO COMERCIAL:

Ayuda primero.
Resuelve la duda.
Después orienta naturalmente hacia la compra.

Nunca presiones al cliente.
Nunca inventes información.
`;


/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


function elegirAleatoria(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}


function limpiarRespuesta(texto) {
  let limpio = String(texto || "").trim();

  limpio = limpio
    .replace(/^¡?\s*hola[\s,!.]*/i, "")
    .replace(/^buenos días[\s,!.]*/i, "")
    .replace(/^buenos dias[\s,!.]*/i, "")
    .replace(/^buenas tardes[\s,!.]*/i, "")
    .replace(/^buenas noches[\s,!.]*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return limpio;
}


/*
  IMPORTANTE:
  Esta función permite recibir mensajes aunque n8n
  mande el texto con diferentes nombres o estructuras.
*/

function obtenerTexto(body) {

  if (!body) {
    return "";
  }

  /*
    BODY como texto directo
  */
  if (typeof body === "string") {
    return body.trim();
  }

  /*
    FORMATOS DIRECTOS
  */
  const candidatosDirectos = [
    body.texto,
    body.mensaje,
    body.message,
    body.text,
    body.content,
    body.input,
    body.query,
    body.prompt
  ];

  for (const valor of candidatosDirectos) {
    if (typeof valor === "string" && valor.trim()) {
      return valor.trim();
    }
  }

  /*
    FORMATOS ANIDADOS COMUNES
    MANYCHAT / N8N / WEBHOOK
  */

  if (body.body) {

    if (typeof body.body === "string") {
      return body.body.trim();
    }

    const candidatosBody = [
      body.body.texto,
      body.body.mensaje,
      body.body.message,
      body.body.text,
      body.body.content
    ];

    for (const valor of candidatosBody) {
      if (typeof valor === "string" && valor.trim()) {
        return valor.trim();
      }
    }
  }


  if (body.data) {

    const candidatosData = [
      body.data.texto,
      body.data.mensaje,
      body.data.message,
      body.data.text,
      body.data.content
    ];

    for (const valor of candidatosData) {
      if (typeof valor === "string" && valor.trim()) {
        return valor.trim();
      }
    }
  }


  if (body.contact) {

    const candidatosContact = [
      body.contact.text,
      body.contact.message,
      body.contact.mensaje
    ];

    for (const valor of candidatosContact) {
      if (typeof valor === "string" && valor.trim()) {
        return valor.trim();
      }
    }
  }


  /*
    ÚLTIMO RECURSO:
    buscar recursivamente un campo de texto conocido.
  */

  const camposPermitidos = [
    "texto",
    "mensaje",
    "message",
    "text",
    "content"
  ];


  function buscar(objeto, profundidad = 0) {

    if (!objeto || profundidad > 5) {
      return "";
    }

    if (typeof objeto !== "object") {
      return "";
    }

    for (const campo of camposPermitidos) {

      if (
        typeof objeto[campo] === "string" &&
        objeto[campo].trim()
      ) {
        return objeto[campo].trim();
      }
    }


    for (const clave of Object.keys(objeto)) {

      const valor = objeto[clave];

      if (
        valor &&
        typeof valor === "object"
      ) {

        const encontrado = buscar(
          valor,
          profundidad + 1
        );

        if (encontrado) {
          return encontrado;
        }
      }
    }

    return "";
  }


  return buscar(body);
}


/* =========================================================
   CIERRE
========================================================= */

function cierrePago() {

  const cierres = [

    `🐶 Para adquirir Universo Canino puedes pagar por transferencia bancaria o depósito en OXXO. Después envía tu comprobante junto con la palabra LISTO y, al confirmar el pago, recibirás el material por WhatsApp. 💙`,

    `🐾 Cuando decidas adquirir la Biblioteca, puedes realizar tu pago por transferencia u OXXO. Después envíanos el comprobante con la palabra LISTO para recibir tu material por WhatsApp. 💙`,

    `💙 La compra puede realizarse por transferencia bancaria o depósito en OXXO. Una vez realizado el pago, envía tu comprobante junto con la palabra LISTO. 🐶`
  ];

  return elegirAleatoria(cierres);
}


function agregarCierre(texto) {

  const limpio = limpiarRespuesta(texto);

  if (!limpio) {
    return cierrePago();
  }

  return `${limpio}

${cierrePago()}`;
}


/* =========================================================
   RESPUESTAS DIRECTAS
========================================================= */

function respuestaDirecta(textoNormalizado) {

  /*
    PRECIO
  */

  if (
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("cuanto cuesta") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado === "79" ||
    textoNormalizado === "129"
  ) {

    const respuestas = [

      `La Biblioteca Digital Universo Canino cuesta $79 MXN 🐶 e incluye todas las guías más el bono de 100 moldes para confeccionar ropa para mascotas.

El paquete completo cuesta $129 MXN e incluye además la guía especial "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor". 💙`,

      `La Biblioteca Digital tiene un precio de $79 MXN 🐾 e incluye las guías y el bono de 100 moldes. El paquete completo cuesta $129 MXN y agrega la guía especial sobre la pérdida de tu mejor amigo.`

    ];

    return agregarCierre(
      elegirAleatoria(respuestas)
    );
  }


  /*
    CONTENIDO
  */

  if (
    textoNormalizado.includes("que incluye") ||
    textoNormalizado.includes("que contiene") ||
    textoNormalizado.includes("que trae") ||
    textoNormalizado.includes("contenido") ||
    textoNormalizado.includes("guias")
  ) {

    const respuestas = [

      `Incluye Cuidados Básicos, Alimentación Canina, Dieta BARF, Primeros Auxilios, Manual para Dueños, Enciclopedia Canina, Geriatría, Recetario Saludable y Educación y Comportamiento. 🐶

Además recibes como bono 100 moldes para confeccionar ropa para mascotas.`,

      `Universo Canino reúne guías de cuidados, alimentación, BARF, primeros auxilios, razas, geriatría, recetas saludables, educación y comportamiento 🐾. También incluye el bono de 100 moldes para ropa de mascotas.`

    ];

    return agregarCierre(
      elegirAleatoria(respuestas)
    );
  }


  /*
    DIGITAL / PDF
  */

  if (
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("fisico")
  ) {

    const respuestas = [

      `Todo el material es digital en formato PDF 🐶. Puedes consultarlo desde celular, tablet o computadora y se entrega directamente por WhatsApp después de confirmar el pago.`,

      `La Biblioteca es 100% digital en PDF 🐾. Una vez confirmado el pago, recibes el material correspondiente directamente por WhatsApp.`

    ];

    return agregarCierre(
      elegirAleatoria(respuestas)
    );
  }


  /*
    ENTREGA
  */

  if (
    textoNormalizado.includes("como lo recibo") ||
    textoNormalizado.includes("cuando llega") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("recibir")
  ) {

    const respuestas = [

      `La entrega se realiza directamente por WhatsApp 🐶. Después de confirmar tu pago recibes el material correspondiente a tu compra.`,

      `Recibes todo directamente por WhatsApp 💙. Envías tu comprobante junto con la palabra LISTO y, una vez confirmado el pago, se entrega tu material.`

    ];

    return agregarCierre(
      elegirAleatoria(respuestas)
    );
  }


  /*
    PAGO
  */

  if (
    textoNormalizado.includes("como pago") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("transferencia") ||
    textoNormalizado.includes("oxxo") ||
    textoNormalizado.includes("deposito")
  ) {

    return `Puedes realizar el pago mediante transferencia bancaria o depósito en OXXO 🐶. Después envía tu comprobante junto con la palabra LISTO y, al confirmar el pago, recibirás tu material por WhatsApp. 💙`;
  }


  /*
    BONO
  */

  if (
    textoNormalizado.includes("bono") ||
    textoNormalizado.includes("patrones") ||
    textoNormalizado.includes("moldes")
  ) {

    const respuestas = [

      `El bono incluye 100 moldes para confeccionar ropa para mascotas 🐶 y viene incluido con la Biblioteca Digital de $79 MXN.`,

      `Recibes como bono 100 moldes para confeccionar ropa para mascotas 🐾, incluidos con la Biblioteca Digital Universo Canino.`

    ];

    return agregarCierre(
      elegirAleatoria(respuestas)
    );
  }


  /*
    GUÍA DE DUELO
  */

  if (
    textoNormalizado.includes("perdida") ||
    textoNormalizado.includes("duelo") ||
    textoNormalizado.includes("guia especial")
  ) {

    const respuestas = [

      `La guía especial se llama "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor" 💙. Está incluida en el paquete completo de $129 MXN junto con la Biblioteca y el bono.`,

      `El paquete completo de $129 MXN incluye la guía especial para acompañar la pérdida de tu mejor amigo y honrar su recuerdo con amor 🐾, además de toda la Biblioteca y el bono.`

    ];

    return agregarCierre(
      elegirAleatoria(respuestas)
    );
  }


  /*
    BARF / ALIMENTACIÓN
  */

  if (
    textoNormalizado.includes("barf") ||
    textoNormalizado.includes("alimentacion") ||
    textoNormalizado.includes("recetario")
  ) {

    return agregarCierre(
      `Sí 🐶. La Biblioteca incluye Alimentación Canina, Dieta BARF y un Recetario Saludable, además del resto de las guías de Universo Canino.`
    );
  }


  /*
    PRIMEROS AUXILIOS
  */

  if (
    textoNormalizado.includes("primeros auxilios")
  ) {

    return agregarCierre(
      `Sí 🐶. Primeros Auxilios es una de las guías incluidas dentro de la Biblioteca Digital Universo Canino.`
    );
  }


  return null;
}


/* =========================================================
   ENDPOINT PRINCIPAL
========================================================= */

app.get("/", (req, res) => {

  res.send("Bot ventas activo ✅");

});


app.post("/mensaje", async (req, res) => {

  try {

    /*
      MOSTRAR EXACTAMENTE QUÉ MANDA N8N
    */

    console.log(
      "BODY RECIBIDO:",
      JSON.stringify(req.body, null, 2)
    );


    /*
      EXTRAER MENSAJE
    */

    const texto = obtenerTexto(req.body);


    console.log(
      "TEXTO DETECTADO:",
      texto
    );


    /*
      SI NO ENCONTRAMOS TEXTO
    */

    if (!texto) {

      console.log(
        "ADVERTENCIA: No se encontró texto en el body."
      );

      return res.json({
        respuesta:
          "Soy Sally de Universo Canino 🐶. No pude leer correctamente el mensaje. Intenta enviarlo nuevamente."
      });
    }


    /*
      NORMALIZAR
    */

    const textoNormalizado =
      normalizarTexto(texto);


    /*
      BUSCAR RESPUESTA DIRECTA
    */

    const directa =
      respuestaDirecta(textoNormalizado);


    if (directa) {

      console.log(
        "RESPUESTA DIRECTA:",
        directa
      );

      return res.json({
        respuesta: directa
      });
    }


    /*
      CONSULTAR OPENAI
    */

    console.log(
      "ENVIANDO MENSAJE A OPENAI..."
    );


    const response =
      await openai.responses.create({

        model: "gpt-4.1-mini",

        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: texto
          }
        ]

      });


    /*
      OBTENER RESPUESTA
    */

    let respuestaIA =
      response.output_text || "";


    respuestaIA =
      limpiarRespuesta(respuestaIA);


    /*
      RESPALDO
    */

    if (!respuestaIA) {

      console.log(
        "OPENAI devolvió respuesta vacía."
      );

      respuestaIA =
        "Universo Canino 🐶 es una Biblioteca Digital con información práctica sobre cuidados, alimentación, primeros auxilios, educación y diferentes etapas de la vida de tu perro.";
    }


    console.log(
      "RESPUESTA OPENAI:",
      respuestaIA
    );


    /*
      RESPUESTA A N8N
    */

    return res.json({
      respuesta: respuestaIA
    });


  } catch (error) {

    console.error(
      "ERROR COMPLETO /mensaje:",
      error
    );


    if (error && error.message) {

      console.error(
        "MENSAJE DEL ERROR:",
        error.message
      );

    }


    return res.json({
      respuesta:
        "Soy Sally de Universo Canino 🐶. En este momento tuve un problema para procesar el mensaje. Intenta enviarlo nuevamente."
    });

  }

});


/* =========================================================
   SERVIDOR
========================================================= */

app.listen(PORT, () => {

  console.log(
    `Servidor corriendo en puerto ${PORT}`
  );

});

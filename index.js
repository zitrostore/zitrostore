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
   UNIVERSO CANINO
   AGENTE DE SOPORTE Y VENTAS PARA WHATSAPP
========================================================= */

const SYSTEM_PROMPT = `
Eres Sally Ortiz ❤️, asesora de Universo Canino.

Atiendes por WhatsApp a personas interesadas en la
Biblioteca Digital Universo Canino.

Tu forma de responder debe sentirse HUMANA, CÁLIDA,
NATURAL, CERCANA y BREVE.

Nunca debes parecer un robot ni decir que eres una IA.

=========================================================
INFORMACIÓN OFICIAL DE UNIVERSO CANINO
=========================================================

Universo Canino es una Biblioteca Digital creada para
personas que aman a sus perros y quieren aprender a
cuidarlos mejor durante las diferentes etapas de su vida.

El material es DIGITAL y se entrega en formato PDF.

Puede consultarse desde celular, computadora o tablet.

=========================================================
PRECIO
=========================================================

Biblioteca Digital Universo Canino:

$79 MXN

Incluye GRATIS:

100 moldes para confeccionar ropa para tu mascota.

También está disponible el paquete completo:

Biblioteca Digital Universo Canino
+ 100 moldes
+ guía especial:

"Cómo superar la pérdida de tu mejor amigo
y honrar su recuerdo con amor."

Precio del paquete completo:

$129 MXN.

=========================================================
CONTENIDO DE LA BIBLIOTECA
=========================================================

La biblioteca incluye material sobre:

- Cuidados básicos del perro
- Alimentación y nutrición canina
- Dieta BARF
- Enciclopedia de razas
- Geriatría y cuidados del perro senior
- Manual para mascotas
- Primeros auxilios
- Recetario saludable
- Educación y comportamiento

=========================================================
ENTREGA
=========================================================

Todo el material es DIGITAL.

Se entrega por WhatsApp después de confirmar el pago.

El cliente debe enviar su comprobante de pago junto
con la palabra:

LISTO

Después de confirmar el pago se envía el material
correspondiente a su compra.

=========================================================
FORMA DE RESPONDER
=========================================================

IMPORTANTE:

- Responde máximo en 1 o 2 párrafos cortos.
- No escribas respuestas largas.
- No repitas información innecesariamente.
- No hagas varias preguntas.
- No hagas preguntas abiertas innecesarias.
- No inventes información.
- No inventes precios.
- No cambies los precios.
- No prometas resultados.
- No digas que eres inteligencia artificial.
- No menciones OpenAI.
- No menciones n8n.
- No menciones ManyChat.
- No menciones Railway.
- No expliques procesos técnicos.
- No uses lenguaje robótico.
- No saludes repetidamente durante la conversación.
- Si el usuario únicamente saluda, responde brevemente
  y oriéntalo hacia Universo Canino.
- Si pregunta algo relacionado con el producto,
  responde directamente.
- Si muestra intención de compra, facilita el cierre.
- Si pregunta cómo pagar, explica que puede realizar
  su pago y después enviar el comprobante junto con
  la palabra LISTO.
- Nunca afirmes que un pago fue recibido o confirmado
  si no existe confirmación.
- Nunca afirmes que ya enviaste materiales si no
  existe confirmación.

Tu objetivo es resolver dudas y ayudar naturalmente
al cliente a tomar una decisión de compra sin presionarlo.
`;

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function normalizarTexto(texto = "") {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function contiene(texto, palabras) {
  return palabras.some((palabra) => texto.includes(palabra));
}

function respuestaPrecio() {
  return `La Biblioteca Digital Universo Canino tiene un precio especial de $79 MXN e incluye GRATIS 100 moldes para confeccionar ropa para tu mascota. 🐶💙 También puedes llevarte la biblioteca + los moldes + la guía “Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor” por $129 MXN.`;
}

function respuestaPago() {
  return `Puedes realizar tu pago y, al terminar, enviarnos por WhatsApp tu comprobante junto con la palabra LISTO. 🐾 En cuanto se confirme el pago recibirás el material correspondiente a tu compra.`;
}

function respuestaHola() {
  return `¡Hola! 🐶💙 Con gusto te ayudo con cualquier duda sobre la Biblioteca Digital Universo Canino, su contenido, precio, entrega o forma de pago.`;
}

function respuestaGarantia() {
  return `Universo Canino es una biblioteca digital en formato PDF. Antes de realizar tu compra puedo aclararte cualquier duda sobre el contenido, precio y forma de entrega para que sepas exactamente qué estás adquiriendo. 🐾`;
}

function respuestaGuia() {
  return `La Biblioteca Digital Universo Canino reúne guías prácticas sobre cuidados, alimentación, primeros auxilios, educación, geriatría, razas y más. 🐶 También tenemos la guía especial “Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor”.`;
}

function respuestaContenido() {
  return `La biblioteca incluye Cuidados Básicos, Alimentación y Nutrición, Dieta BARF, Enciclopedia de Razas, Geriatría, Manual para Mascotas, Primeros Auxilios, Recetario Saludable y Educación y Comportamiento. 📚🐾`;
}

function respuestaEntrega() {
  return `Todo el material es digital en formato PDF y se entrega directamente por WhatsApp después de confirmar tu pago. 📲🐶 Puedes consultarlo desde celular, computadora o tablet.`;
}

function respuestaBono() {
  return `Con la Biblioteca Digital Universo Canino de $79 MXN recibes GRATIS un bono de 100 moldes para confeccionar ropa para tu mascota. 🐶🎁`;
}

function respuestaAcceso() {
  return `El material es completamente digital y lo recibes por WhatsApp después de confirmar tu pago. 📲 Puedes guardarlo y consultarlo desde tu celular, computadora o tablet.`;
}

function cierrePago() {
  return `Con gusto te ayudo con cualquier duda sobre Universo Canino. 🐶💙 Puedes preguntarme sobre precio, contenido, entrega, bono o forma de pago.`;
}

/* =========================================================
   RESPUESTAS DIRECTAS POR PALABRAS CLAVE
========================================================= */

function buscarRespuestaDirecta(mensaje) {
  const texto = normalizarTexto(mensaje);

  // 1. PRECIO
  if (
    contiene(texto, [
      "precio",
      "cuanto cuesta",
      "cuanto vale",
      "costo",
      "cuanto sale"
    ])
  ) {
    return respuestaPrecio();
  }

  // 2. PAGO
  if (
    contiene(texto, [
      "pago",
      "pagar",
      "deposito",
      "transferencia",
      "como pago"
    ])
  ) {
    return respuestaPago();
  }

  // 3. HOLA
  if (
    texto === "hola" ||
    texto === "holi" ||
    texto === "buenas" ||
    texto === "buen dia" ||
    texto === "buenas tardes" ||
    texto === "buenas noches"
  ) {
    return respuestaHola();
  }

  // 4. GARANTIA
  if (
    contiene(texto, [
      "garantia",
      "garantía"
    ])
  ) {
    return respuestaGarantia();
  }

  // 5. GUIA
  if (
    contiene(texto, [
      "guia",
      "guías",
      "guias"
    ])
  ) {
    return respuestaGuia();
  }

  // 6. CONTENIDO
  if (
    contiene(texto, [
      "contenido",
      "que incluye",
      "que contiene",
      "que trae"
    ])
  ) {
    return respuestaContenido();
  }

  // 7. ENTREGA
  if (
    contiene(texto, [
      "entrega",
      "como lo recibo",
      "como recibo",
      "cuando recibo",
      "envio"
    ])
  ) {
    return respuestaEntrega();
  }

  // 8. BONO
  if (
    contiene(texto, [
      "bono",
      "moldes",
      "patrones"
    ])
  ) {
    return respuestaBono();
  }

  // 9. ACCESO
  if (
    contiene(texto, [
      "acceso",
      "acceder",
      "descargar",
      "pdf"
    ])
  ) {
    return respuestaAcceso();
  }

  return null;
}

/* =========================================================
   ENDPOINT DE SALUD
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    servicio: "Universo Canino",
  });
});

/* =========================================================
   ENDPOINT PRINCIPAL
   MANYCHAT / N8N -> RAILWAY
========================================================= */

app.post("/mensaje", async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", JSON.stringify(req.body));

    const mensaje =
      req.body?.texto ||
      req.body?.mensaje ||
      req.body?.message ||
      "";

    const mensajeLimpio = String(mensaje).trim();

    console.log("MENSAJE RECIBIDO:", mensajeLimpio);

    /*
      MUY IMPORTANTE:
      Railway SIEMPRE debe regresar:
      {
        "respuesta": "..."
      }
    */

    if (!mensajeLimpio) {
      console.log("MENSAJE VACIO");

      return res.status(200).json({
        respuesta: cierrePago(),
      });
    }

    /* RESPUESTAS DIRECTAS */

    const respuestaDirecta =
      buscarRespuestaDirecta(mensajeLimpio);

    if (respuestaDirecta) {
      console.log("RESPUESTA DIRECTA:", respuestaDirecta);

      return res.status(200).json({
        respuesta: respuestaDirecta,
      });
    }

    /* RESPUESTA CON OPENAI */

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: mensajeLimpio,
        },
      ],

      temperature: 0.7,
      max_tokens: 220,
    });

    const respuestaIA =
      completion?.choices?.[0]?.message?.content?.trim();

    const respuestaFinal =
      respuestaIA || cierrePago();

    console.log("RESPUESTA IA:", respuestaFinal);

    return res.status(200).json({
      respuesta: respuestaFinal,
    });

  } catch (error) {
    console.error("ERROR EN /mensaje:", error);

    /*
      Incluso si OpenAI falla, devolvemos JSON válido
      para no romper n8n ni ManyChat.
    */

    return res.status(200).json({
      respuesta:
        "En este momento tuve un pequeño inconveniente para procesar tu mensaje. 🐶💙 Puedes escribirme nuevamente y con gusto te ayudo.",
    });
  }
});

/* =========================================================
   MANEJO DE RUTAS NO ENCONTRADAS
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    respuesta: "Ruta no encontrada",
  });
});

/* =========================================================
   INICIAR SERVIDOR
========================================================= */

app.listen(PORT, () => {
  console.log(`Universo Canino activo en puerto ${PORT}`);
});

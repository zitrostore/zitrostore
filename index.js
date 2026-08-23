require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

/*
=========================================================
OPENAI
=========================================================
*/

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let openai = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  console.log("OPENAI_API_KEY detectada correctamente ✅");
} else {
  console.error("ERROR: OPENAI_API_KEY no está configurada en Railway ❌");
}

/*
=========================================================
SYSTEM PROMPT
=========================================================
*/

const SYSTEM_PROMPT = `
Eres Sally Ortiz 🐶, asesora oficial de Universo Canino.

Atiendes por WhatsApp a personas interesadas en la Biblioteca Digital Universo Canino.

Tu trabajo es responder dudas de forma NATURAL, BREVE, HUMANA y CERCANA, como una persona real atendiendo con cariño.

IDENTIDAD:

Tu nombre es Sally Ortiz 🐶.

Eres:
- cálida
- amable
- cercana
- paciente
- profesional
- amante de los perros

Nunca dices que eres inteligencia artificial.
Nunca dices que eres un bot.

IMPORTANTE:

- Nunca suenes robótica.
- Nunca respondas exactamente igual cada vez.
- Varía ligeramente las palabras y la estructura.
- Mantén respuestas cálidas y naturales.
- No escribas demasiado.
- Responde máximo en 1 o 2 párrafos cortos.
- Primero resuelve la duda.
- Después orienta.
- Finalmente invita de forma natural a realizar la compra.
- Nunca presiones.

REGLAS:

- NO saludes.
- NO uses "Hola".
- NO digas "Buenos días".
- NO digas "Buenas tardes".
- NO digas "Buenas noches".
- NO hagas múltiples preguntas.
- NO hagas preguntas abiertas innecesarias.

NO digas:

- "¿Te interesa?"
- "¿Quieres saber más?"
- "¿Quieres comprar?"
- "¿Te gustaría?"
- "¿En qué puedo ayudarte?"
- "¿Algo más?"
- "¿Te ayudo en algo más?"
- "¿Quieres que te cuente?"

- NO seas agresiva vendiendo.
- NO presiones.
- NO inventes información.
- NO menciones correo electrónico.
- NO digas que el producto es físico.
- NO inventes productos.
- NO inventes precios.

MISIÓN:

Ayudar a los dueños de perros a conocer mejor la Biblioteca Digital Universo Canino y resolver sus dudas para que tengan información práctica para cuidar mejor a su mascota.

OBJETIVO COMERCIAL:

Convertir conversaciones de WhatsApp en ventas de la Biblioteca Digital Universo Canino.

Siempre conduce la conversación de forma amable hacia la compra, sin presión.

PRODUCTO PRINCIPAL:

Biblioteca Digital Universo Canino.

PRECIO:

$79 MXN.

INCLUYE:

- Cuidados Básicos
- Alimentación Canina
- Dieta BARF
- Primeros Auxilios
- Manual para Dueños
- Enciclopedia Canina
- Geriatría
- Recetario Saludable
- Educación y Comportamiento

BONO:

100 moldes para confeccionar ropa para mascotas.

FORMATO:

Todo el contenido es DIGITAL en PDF.

Compatible con:

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

- Biblioteca Digital Universo Canino
- Bono de 100 moldes
- Guía especial:
"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor."

MÉTODOS DE PAGO:

- Transferencia bancaria
- Depósito en OXXO

PROCESO DE COMPRA:

Después de realizar el pago, el cliente debe enviar:

COMPROBANTE + palabra LISTO

Después de confirmar el pago recibe el material correspondiente por WhatsApp.

BENEFICIOS:

Universo Canino ayuda al dueño a:

- evitar errores comunes
- conocer mejor la alimentación de su perro
- aprender información sobre primeros auxilios
- conocer mejor a su mascota
- acompañar diferentes etapas de su vida
- tener información clara y práctica

DIFERENCIADOR:

Universo Canino no vende solamente PDFs.

Vende tranquilidad.
Vende conocimiento.
Vende prevención.
Vende bienestar.

Está pensado para personas que consideran a su perro parte de la familia.

RESPUESTAS IMPORTANTES:

Si preguntan PRECIO:

Biblioteca Digital:
$79 MXN.

Biblioteca + Guía Especial:
$129 MXN.

Si preguntan QUÉ INCLUYE:

Resume las principales guías y menciona el bono de 100 moldes.

Si preguntan si es PDF:

Sí.
Todo es digital.

Si preguntan CÓMO LO RECIBEN:

Por WhatsApp después de confirmar el pago.

Si preguntan CÓMO PAGAR:

Transferencia bancaria o depósito en OXXO.

Si preguntan por el BONO:

Son 100 moldes para confeccionar ropa para mascotas.

Si preguntan por la GUÍA ESPECIAL:

Se llama:
"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor."

Está incluida en el paquete completo de $129 MXN.

CIERRE:

Después de responder una duda relacionada con la compra, puedes cerrar de forma natural explicando que debe realizar su pago y enviar el comprobante junto con la palabra LISTO.

Nunca cierres agresivamente.
Nunca presiones.
`;

/*
=========================================================
FUNCIONES AUXILIARES
=========================================================
*/

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
  texto = String(texto || "").trim();

  texto = texto
    .replace(/^¡?\s*hola\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^gracias por preguntar\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenos días\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenos dias\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenas tardes\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenas noches\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "");

  texto = texto
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

/*
=========================================================
CIERRE DE PAGO
=========================================================
*/

function cierrePago() {
  const cierres = [
    `🐶 Para adquirir la Biblioteca puedes realizar tu pago por transferencia bancaria o depósito en OXXO. Después envía tu comprobante junto con la palabra LISTO y, al confirmarlo, recibirás tu material por WhatsApp. 💙`,

    `🐾 Cuando decidas adquirir Universo Canino, puedes pagar por transferencia u OXXO. Después envíanos tu comprobante con la palabra LISTO para recibir el material por WhatsApp. 💙`,

    `💙 Para realizar tu compra puedes elegir transferencia bancaria o depósito en OXXO. Después manda tu comprobante junto con la palabra LISTO y recibirás tu material una vez confirmado el pago. 🐶`,
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

/*
=========================================================
RESPUESTAS DIRECTAS
=========================================================
*/

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
    const respuestasPrecio = [
      `La Biblioteca Digital Universo Canino cuesta $79 MXN 🐶 e incluye todas las guías más el bono de 100 moldes para confeccionar ropa para mascotas.

El paquete completo cuesta $129 MXN e incluye además la guía especial "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor". 💙`,

      `La Biblioteca Digital cuesta $79 MXN 🐾 e incluye las guías y el bono de 100 moldes. El paquete completo cuesta $129 MXN e incluye también la guía especial para superar la pérdida de tu mejor amigo y honrar su recuerdo con amor.`,
    ];

    return agregarCierre(
      elegirAleatoria(respuestasPrecio)
    );
  }

  /*
  CONTENIDO
  */

  if (
    textoNormalizado.includes("que incluye") ||
    textoNormalizado.includes("contenido") ||
    textoNormalizado.includes("guias") ||
    textoNormalizado.includes("que contiene") ||
    textoNormalizado.includes("que trae")
  ) {
    const respuestasContenido = [
      `La Biblioteca incluye Cuidados Básicos, Alimentación Canina, Dieta BARF, Primeros Auxilios, Manual para Dueños, Enciclopedia Canina, Geriatría, Recetario Saludable y Educación y Comportamiento. 🐶

Además recibes el bono de 100 moldes para confeccionar ropa para mascotas.`,

      `Universo Canino reúne guías de cuidados, alimentación, BARF, primeros auxilios, razas, geriatría, recetas saludables, educación y comportamiento 🐾. También incluye 100 moldes para confeccionar ropa para mascotas.`,
    ];

    return agregarCierre(
      elegirAleatoria(respuestasContenido)
    );
  }

  /*
  PDF / DIGITAL
  */

  if (
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("fisico")
  ) {
    const respuestasDigital = [
      `Todo el material es digital en formato PDF 🐶. Puedes consultarlo desde tu celular, tablet o computadora y se entrega por WhatsApp después de confirmar el pago.`,

      `La Biblioteca es 100% digital en PDF 🐾. Después de confirmar el pago recibes el material directamente por WhatsApp.`,
    ];

    return agregarCierre(
      elegirAleatoria(respuestasDigital)
    );
  }

  /*
  ENTREGA
  */

  if (
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("como lo recibo") ||
    textoNormalizado.includes("cuando llega") ||
    textoNormalizado.includes("recibir")
  ) {
    const respuestasEntrega = [
      `La entrega se realiza directamente por WhatsApp 🐶. Una vez confirmado tu pago recibes el material correspondiente a tu compra.`,

      `Recibes todo directamente por WhatsApp 💙. Después de realizar el pago, envías tu comprobante junto con la palabra LISTO y, una vez confirmado, se entrega el material.`,
    ];

    return agregarCierre(
      elegirAleatoria(respuestasEntrega)
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
    const respuestasBono = [
      `El bono incluye 100 moldes para confeccionar ropa para mascotas 🐶 y viene incluido con la Biblioteca Digital de $79 MXN.`,

      `Recibes como bono 100 moldes para confeccionar ropa para mascotas 🐾, incluidos con la Biblioteca Digital Universo Canino.`,
    ];

    return agregarCierre(
      elegirAleatoria(respuestasBono)
    );
  }

  /*
  DUELO
  */

  if (
    textoNormalizado.includes("perdida") ||
    textoNormalizado.includes("duelo") ||
    textoNormalizado.includes("guia especial")
  ) {
    const respuestasDuelo = [
      `La guía especial se llama "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor" 💙. Está incluida en el paquete completo de $129 MXN junto con la Biblioteca y el bono.`,

      `El paquete completo de $129 MXN incluye la guía especial sobre la pérdida de tu mejor amigo 🐾, además de toda la Biblioteca Digital y el bono de 100 moldes.`,
    ];

    return agregarCierre(
      elegirAleatoria(respuestasDuelo)
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

/*
=========================================================
ENDPOINT DE PRUEBA
=========================================================
*/

app.get("/", (req, res) => {
  res.send("Bot ventas activo ✅");
});

/*
=========================================================
ENDPOINT /mensaje
=========================================================
*/

app.post("/mensaje", async (req, res) => {
  try {

    const texto =
      req.body.texto ||
      req.body.mensaje ||
      req.body.message ||
      req.body.text ||
      "";

    console.log("Texto recibido:", texto);

    /*
    SI NO HAY TEXTO
    */

    if (!texto) {
      return res.json({
        respuesta:
          "Soy Sally de Universo Canino 🐶. Escríbeme tu duda y con gusto te doy la información.",
      });
    }

    /*
    RESPUESTAS DIRECTAS
    */

    const textoNormalizado =
      normalizarTexto(texto);

    const directa =
      respuestaDirecta(textoNormalizado);

    if (directa) {
      console.log(
        "Respuesta directa:",
        directa
      );

      return res.json({
        respuesta: directa,
      });
    }

    /*
    VERIFICAR OPENAI
    */

    if (!openai) {
      console.error(
        "No se puede consultar OpenAI porque falta OPENAI_API_KEY."
      );

      return res.json({
        respuesta:
          "Soy Sally de Universo Canino 🐶. En este momento no puedo procesar esa consulta. Intenta nuevamente en unos minutos.",
      });
    }

    /*
    OPENAI
    */

    console.log(
      "Consultando OpenAI..."
    );

    const response =
      await openai.responses.create({
        model: "gpt-4.1-mini",

        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: texto,
          },
        ],
      });

    /*
    RESPUESTA
    */

    let respuestaIA =
      response.output_text || "";

    respuestaIA =
      limpiarRespuesta(respuestaIA);

    if (!respuestaIA) {
      respuestaIA =
        "Universo Canino 🐶 es una Biblioteca Digital con información práctica sobre cuidados, alimentación, primeros auxilios, educación y las diferentes etapas de la vida de tu perro.";
    }

    console.log(
      "Respuesta enviada:",
      respuestaIA
    );

    return res.json({
      respuesta: respuestaIA,
    });

  } catch (error) {

    console.error(
      "Error en /mensaje:",
      error
    );

    return res.json({
      respuesta:
        "Soy Sally de Universo Canino 🐶. En este momento tuve un problema para procesar tu mensaje. Intenta nuevamente en unos minutos.",
    });
  }
});

/*
=========================================================
SERVIDOR
=========================================================
*/

app.listen(PORT, () => {
  console.log(
    `Servidor corriendo en puerto ${PORT}`
  );
});

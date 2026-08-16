require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

const SYSTEM_PROMPT = `
Eres Saly Ortiz ❤️, una asistente humana, cálidal y cercana que responde dudas por WhatsApp sobre el libro digital "Universo Canino".

Tu trabajo es responder dudas de forma NATURAL, BREVE y HUMANA, como si fueras una persona real atendiendo con cariño.

IMPORTANTE:
- Nunca suenes robótica.
- Nunca respondas exactamente igual cada vez.
- Varía ligeramente las palabras y estructura.
- Mantén respuestas cálidas y naturales.
- No escribas demasiado.
- Responde máximo en 1 o 2 párrafos cortos.

REGLAS:
- NO saludes.
- NO uses "Hola".
- NO hagas múltiples preguntas.
- NO hagas preguntas abiertas innecesarias.
- NO digas:
  - "¿Quieres saber más?"
  - "¿Te interesa?"
  - "¿Te gustaría?"
  - "¿Te ayudo en algo más?"
  - "¿Quieres que te cuente?"
- NO seas agresiva vendiendo.
- NO presiones.
- NO inventes información.
- NO menciones correo electrónico.
- NO digas que el libro es físico.

IINFORMACIÓN REAL:

- Universo Canino es una Biblioteca Digital en formato PDF.
- Todo el material es 100% digital.
- No se envía ningún producto físico.
- La entrega se realiza por WhatsApp después de confirmar el pago.
- El material puede leerse desde celular, tablet o computadora.
- La Biblioteca Digital Universo Canino tiene un precio de 79 MXN e incluye un bono de 100 moldes para confeccionar ropa para mascotas.
- La Biblioteca Digital Universo Canino + la guía "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor" tiene un precio de 129 MXN.
- Los métodos de pago son:
  - Transferencia bancaria.
  - Depósito en OXXO.
- Una vez realizado el pago, el cliente debe enviar su comprobante junto con la palabra "LISTO".
- Después de confirmar el pago, el material se entrega inmediatamente por WhatsApp.

OBJETIVO:
Después de resolver la duda de forma amable y humana, confirma el deposito o transferencia mediante:
- transferencia bancaria
- depósito en Oxxo

Haz que el cierre se sienta natural, amable, nunca como presión de venta.
`;

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
    .replace(/^¡?\s*hola\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^gracias por preguntar\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenos días\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenos dias\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenas tardes\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenas noches\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "");

  texto = texto
    .replace(/¿[^?]*(quieres|te interesa|te gustaría|te gustaria|te cuento|te explico|te ayudo|puedo ayudarte|hay algo más|hay algo mas|te parece|te comparto|te paso)[^?]*\?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

function cierrePago() {
  const cierres = [
    `💌 Puedes comprar la biblioteca universo canino por transferencia bancaria o depósito en Oxxo ✨

¿Cuál método prefieres? 🙏`,

    `💌 Si deseas adquirir universo canino, puedes hacerlo por transferencia bancaria o depósito en Oxxo ✨

¿Qué método prefieres? 🙏`,

    `💌 Para adquirir universo canino puedes elegir transferencia bancaria o depósito en Oxxo ✨

¿Cuál opción prefieres? 🙏`,
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

if (
  textoNormalizado.includes("raza") ||
  textoNormalizado.includes("razas") ||
  textoNormalizado.includes("cachorro") ||
  textoNormalizado.includes("adulto") ||
  textoNormalizado.includes("viejito") ||
  textoNormalizado.includes("senior") ||
  textoNormalizado.includes("perro") ||
  textoNormalizado.includes("perrita") ||
  textoNormalizado.includes("funciona") ||
  textoNormalizado.includes("sirve")
) {
  const respuestasCompatibilidad = [
    `Sí 😊

La Biblioteca Digital Universo Canino está pensada para cualquier raza y para todas las etapas de la vida de tu perro, desde cachorro hasta adulto mayor. Encontrarás información práctica que podrás aplicar sin importar el tamaño o la raza de tu mascota. 🐶`,

    `Claro 🐾

El contenido está diseñado para ayudar a cualquier dueño de perro. Incluye temas de salud, alimentación, educación, primeros auxilios y cuidados para perros de todas las edades y razas.`,

    `Sí, sin problema ❤️

La información de Universo Canino no está enfocada en una sola raza. Es una biblioteca creada para ayudarte a cuidar mejor a tu perro, ya sea cachorro, adulto o senior.`
  ];

  return agregarCierre(elegirAleatoria(respuestasCompatibilidad));
}
  }

  if (
    textoNormalizado.includes("envio") ||
    textoNormalizado.includes("enviar") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("descargar") ||
    textoNormalizado.includes("recibir") ||
    textoNormalizado.includes("recibo") ||
    textoNormalizado.includes("archivo") ||
    textoNormalizado.includes("entrego") ||
    textoNormalizado.includes("llega")
  ) {
    const respuestasEnvio = [
      `El libro es completamente digital 😊

El PDF ya fue enviado anteriormente aquí mismo en WhatsApp, así que solo necesitas abrirlo o descargarlo desde esta conversación 🌿`,

      `No es un libro físico 🙏

Es un material digital en PDF que ya te compartimos anteriormente en esta misma conversación de WhatsApp para que puedas leerlo cuando quieras ✨`,

      `El material ya fue enviado por WhatsApp 😊

Lo encuentras más arriba en esta conversación. Solo necesitas descargar el PDF en tu celular o computadora 🌿`,

      `La entrega es digital 😊

El PDF ya está enviado más arriba en este mismo chat de WhatsApp. No llega nada físico ni se manda por correo; solo debes descargarlo desde aquí mismo 🌿`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEnvio));
  }

  if (
    textoNormalizado.includes("cuanto") ||
    textoNormalizado.includes("cuesta") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("vale") ||
    textoNormalizado.includes("apoyo") ||
    textoNormalizado.includes("apoyar") ||
    textoNormalizado.includes("aportacion") ||
    textoNormalizado.includes("compra") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("pago")
  ) {
    const respuestasPago = [
      `El libro se comparte como información para dueños de mascotas 🙏

const respuestasPago = [

`La Biblioteca Digital Universo Canino tiene un precio especial de **$79 MXN** e incluye un bono de **100 moldes para confeccionar ropa para mascotas**. 🐶📚

Si prefieres la experiencia más completa, por **$129 MXN** también recibirás la guía especial **"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor".`,

`Actualmente puedes elegir entre dos formas de adquirir el material. 😊

🐾 **Biblioteca Digital Universo Canino + Bono:** **$79 MXN**

❤️ **Biblioteca + Bono + Guía especial sobre el duelo por la pérdida de tu mejor amigo:** **$129 MXN**.`,

`Tenemos una promoción de lanzamiento para que elijas la opción que mejor se adapte a ti. 🐶

📚 **Biblioteca Digital Universo Canino** con bono de **100 moldes para confeccionar ropa para mascotas:** **$79 MXN**.

❤️ Si deseas el paquete más completo, puedes obtener la Biblioteca, el bono y la guía **"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor"** por solo **$129 MXN**.`
];

    return agregarCierre(elegirAleatoria(respuestasPago));
  }

  return null;
}

app.get("/", (req, res) => {
  res.send("Bot ventas activo ✅");
});

app.post("/mensaje", async (req, res) => {
  try {
    const texto = req.body.texto || req.body.mensaje || req.body.message || "";

    console.log("Texto recibido:", texto);

    if (!texto) {
      return res.json({ respuesta: cierrePago() });
    }

    const textoNormalizado = normalizarTexto(texto);
    const directa = respuestaDirecta(textoNormalizado);

    if (directa) {
      console.log("Respuesta directa:", directa);
      return res.json({ respuesta: directa });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: texto },
      ],
    });

    const respuestaIA = response.output_text || "";
    const respuestaFinal = agregarCierre(respuestaIA);

    console.log("Respuesta enviada:", respuestaFinal);

    return res.json({ respuesta: respuestaFinal });
  } catch (error) {
    console.error("Error en /mensaje:", error);

    return res.json({ respuesta: cierrePago() });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

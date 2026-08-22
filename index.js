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
Eres Sally Ortiz 🐶, asesora oficial de Universo Canino.

Atiendes por WhatsApp a personas interesadas en la Biblioteca Digital Universo Canino.

Tu trabajo es responder dudas de forma NATURAL, BREVE, HUMANA y CERCANA, como una persona real que ama a los perros y atiende con paciencia y profesionalismo.

IDENTIDAD:
- Eres Sally Ortiz 🐶.
- Eres cálida, amable, cercana, paciente y profesional.
- Hablas como una persona real atendiendo por WhatsApp.
- Nunca dices que eres inteligencia artificial.
- Nunca dices que eres un bot.
- Siempre respondes de forma natural.

IMPORTANTE:
- Nunca suenes robótica.
- Nunca respondas exactamente igual cada vez.
- Varía ligeramente las palabras y la estructura.
- Mantén respuestas cálidas y naturales.
- No escribas demasiado.
- Responde máximo en 1 o 2 párrafos cortos.
- Primero ayuda y resuelve la duda.
- Después orienta.
- Finalmente invita de manera natural a realizar la compra.
- Nunca presiones.

REGLAS:
- NO saludes.
- NO uses "Hola".
- NO digas "Buenos días".
- NO digas "Buenas tardes".
- NO digas "Buenas noches".
- NO hagas múltiples preguntas.
- NO hagas preguntas abiertas innecesarias.
- NO digas:
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
- NO menciones productos que no existen.
- NO digas que el producto es físico.
- NO menciones correo electrónico.
- NO prometas resultados garantizados.

MISIÓN:
Ayudar a los dueños de perros a conocer mejor la Biblioteca Digital Universo Canino y resolver sus dudas para que tengan información práctica para cuidar mejor a su mascota durante las diferentes etapas de su vida.

OBJETIVO COMERCIAL:
Convertir de forma natural las conversaciones de WhatsApp en ventas de la Biblioteca Digital Universo Canino.

Siempre conduce la conversación de forma amable hacia la compra, sin presión.

PRODUCTO PRINCIPAL:
Biblioteca Digital Universo Canino.

PRECIO:
$79 MXN.

INCLUYE:
- Cuidados Básicos.
- Alimentación Canina.
- Dieta BARF.
- Primeros Auxilios.
- Manual para Dueños.
- Enciclopedia Canina.
- Geriatría.
- Recetario Saludable.
- Educación y Comportamiento.

BONO:
100 moldes para confeccionar ropa para mascotas.

FORMATO:
Todo el contenido es DIGITAL en PDF.

La entrega se realiza por WhatsApp después de confirmar el pago.

El material puede consultarse desde:
- celular
- tablet
- computadora

No existe envío físico.
No hay costos de envío.
No se entrega por correo electrónico.

GUÍA ESPECIAL:
"Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor."

PAQUETE COMPLETO:
Biblioteca Digital Universo Canino + bono de 100 moldes + guía especial sobre la pérdida de tu mejor amigo.

Precio total:
$129 MXN.

MÉTODOS DE PAGO:
- Transferencia bancaria.
- Depósito en OXXO.

PROCESO DE COMPRA:
Después de realizar el pago, el cliente debe enviar por WhatsApp:
- su comprobante
- junto con la palabra LISTO

Después de confirmar el pago recibe el material correspondiente a su compra por WhatsApp.

RESPUESTAS IMPORTANTES:

Si preguntan el precio:
Explica que la Biblioteca Digital cuesta $79 MXN y que el paquete completo con la guía especial cuesta $129 MXN.

Si preguntan qué incluye:
Resume los contenidos principales de la Biblioteca y menciona el bono de 100 moldes.

Si preguntan si es PDF:
Aclara que sí, todo el contenido es digital en PDF.

Si preguntan si es físico:
Aclara amablemente que no. Todo es digital.

Si preguntan cómo reciben el material:
Explica que se entrega por WhatsApp después de confirmar el pago.

Si preguntan cuándo llega:
Explica que se entrega después de confirmar el pago.

Si preguntan cómo pagar:
Explica que pueden hacerlo mediante transferencia bancaria o depósito en OXXO.

Si preguntan por el bono:
Explica que son 100 moldes para confeccionar ropa para mascotas y están incluidos con la Biblioteca.

Si preguntan por la guía especial:
Explica que se llama "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor" y que está incluida en el paquete completo de $129 MXN.

Si preguntan si sirve para cualquier perro o raza:
Explica que la Biblioteca contiene información general y práctica para dueños de perros, incluyendo temas de cuidados, alimentación, educación, primeros auxilios, geriatría y razas.

BENEFICIOS:
Universo Canino ayuda a los dueños a:
- evitar errores comunes en el cuidado de su perro
- conocer mejor su alimentación
- aprender información útil sobre primeros auxilios
- conocer mejor a su mascota
- acompañar las diferentes etapas de su vida
- tener información clara y práctica a la mano

DIFERENCIADOR:
Universo Canino no busca vender solamente PDFs.

Busca brindar tranquilidad, conocimiento, prevención y bienestar a quienes consideran a su perro parte de la familia.

CIERRE:
Después de resolver la duda, conduce suavemente hacia la compra.

Puedes explicar de forma natural que cuando la persona decida adquirir la Biblioteca, puede realizar su pago y enviar el comprobante junto con la palabra LISTO para recibir el material por WhatsApp.

Nunca cierres de forma agresiva.
Nunca presiones.
Nunca inventes urgencia o escasez.
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
    .replace(/^¡?\s*hola\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^gracias por preguntar\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenos días\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenos dias\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenas tardes\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "")
    .replace(/^buenas noches\s*[😊🙏❤️✨🌿🐶🐾💙,\.\!]*\s*/gi, "");

  texto = texto
    .replace(/¿[^?]*(quieres|te interesa|te gustaría|te gustaria|te cuento|te explico|te ayudo|puedo ayudarte|hay algo más|hay algo mas|te parece|te comparto|te paso|quieres comprar)[^?]*\?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

function cierrePago() {
  const cierres = [
    `🐶 Cuando decidas adquirir la Biblioteca, realiza tu pago por transferencia o depósito en OXXO y envíanos tu comprobante junto con la palabra LISTO. En cuanto lo confirmemos recibirás tu material por WhatsApp. 💙`,

    `🐾 Para adquirirla, puedes realizar tu pago por transferencia bancaria o depósito en OXXO. Después envía tu comprobante junto con la palabra LISTO y recibirás el material por WhatsApp una vez confirmado. 💙`,

    `💙 Cuando estés listo para adquirir Universo Canino, realiza tu pago por transferencia u OXXO y envíanos el comprobante con la palabra LISTO. Después de confirmarlo recibirás el material correspondiente por WhatsApp. 🐶`,
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

function respuestaDirecta(textoNormalizado) {
  if (
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("cuanto cuesta") ||
    textoNormalizado.includes("cuanto") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("vale") ||
    textoNormalizado.includes("79") ||
    textoNormalizado.includes("129")
  ) {
    const respuestasPrecio = [
      `La Biblioteca Digital Universo Canino cuesta $79 MXN 🐶 e incluye todas las guías más el bono de 100 moldes para confeccionar ropa para mascotas.

El paquete completo cuesta $129 MXN e incluye además la guía especial "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor". 💙`,

      `Tienes la Biblioteca Digital Universo Canino por $79 MXN 🐾, con todas las guías y el bono de 100 moldes. Si prefieres el paquete completo de $129 MXN, también incluye la guía especial para superar la pérdida de tu mejor amigo y honrar su recuerdo con amor.`,

      `La Biblioteca Digital tiene un precio de $79 MXN e incluye el bono de 100 moldes 🐶. El paquete completo cuesta $129 MXN y agrega la guía especial sobre cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor. 💙`,
    ];

    return agregarCierre(elegirAleatoria(respuestasPrecio));
  }

  if (
    textoNormalizado.includes("que incluye") ||
    textoNormalizado.includes("contenido") ||
    textoNormalizado.includes("guias") ||
    textoNormalizado.includes("biblioteca") ||
    textoNormalizado.includes("trae") ||
    textoNormalizado.includes("contiene")
  ) {
    const respuestasContenido = [
      `La Biblioteca incluye Cuidados Básicos, Alimentación Canina, Dieta BARF, Primeros Auxilios, Manual para Dueños, Enciclopedia Canina, Geriatría, Recetario Saludable y Educación y Comportamiento. 🐶

Además recibes GRATIS el bono de 100 moldes para confeccionar ropa para mascotas.`,

      `Por $79 MXN recibes la Biblioteca Digital con guías de cuidados, alimentación, BARF, primeros auxilios, razas, geriatría, recetas, educación y comportamiento, entre otros temas prácticos. 🐾 También incluye el bono de 100 moldes para ropa de mascotas.`,

      `Universo Canino reúne información práctica sobre cuidados, alimentación, Dieta BARF, primeros auxilios, razas, etapa senior, recetas saludables, educación y comportamiento. 🐶 Y con la Biblioteca recibes también 100 moldes para confeccionar ropa para mascotas.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasContenido));
  }

  if (
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("archivo") ||
    textoNormalizado.includes("descarga")
  ) {
    const respuestasDigital = [
      `Todo el material de Universo Canino es digital en formato PDF 🐶. Puedes consultarlo desde tu celular, tablet o computadora y se entrega directamente por WhatsApp después de confirmar el pago.`,

      `La Biblioteca es 100% digital en PDF 🐾. No necesitas esperar ningún paquete: después de confirmar tu pago recibes el material correspondiente directamente por WhatsApp.`,

      `Sí, todo viene en formato PDF 💙. La Biblioteca está pensada para que puedas tenerla a la mano en celular, tablet o computadora y recibirla por WhatsApp después de confirmar el pago.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasDigital));
  }

  if (
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("recibir") ||
    textoNormalizado.includes("recibo") ||
    textoNormalizado.includes("cuando llega") ||
    textoNormalizado.includes("como llega") ||
    textoNormalizado.includes("whatsapp") ||
    textoNormalizado.includes("enviar") ||
    textoNormalizado.includes("envio")
  ) {
    const respuestasEntrega = [
      `La entrega se realiza directamente por WhatsApp 🐶. Una vez confirmado tu pago, recibes por aquí todo el material correspondiente a tu compra.`,

      `Recibes todo directamente por WhatsApp 💙. Después de realizar tu pago, envías el comprobante junto con la palabra LISTO y, una vez confirmado, se entrega el material.`,

      `Todo se entrega por WhatsApp 🐾. Solo necesitamos confirmar tu pago y después recibes aquí mismo el material digital correspondiente a tu compra.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEntrega));
  }

  if (
    textoNormalizado.includes("pago") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("transferencia") ||
    textoNormalizado.includes("oxxo") ||
    textoNormalizado.includes("deposito") ||
    textoNormalizado.includes("comprobante") ||
    textoNormalizado.includes("listo")
  ) {
    const respuestasPago = [
      `Puedes realizar tu pago mediante transferencia bancaria o depósito en OXXO 🐶. Después envíanos el comprobante junto con la palabra LISTO y, al confirmarlo, recibirás tu material por WhatsApp.`,

      `Tenemos pago por transferencia bancaria y depósito en OXXO 🐾. Una vez realizado, manda tu comprobante con la palabra LISTO para confirmar y liberar el material correspondiente a tu compra.`,

      `El pago puede hacerse por transferencia o depósito en OXXO 💙. Después solo envía tu comprobante junto con la palabra LISTO y, en cuanto se confirme, recibirás el material por WhatsApp.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasPago));
  }

  if (
    textoNormalizado.includes("bono") ||
    textoNormalizado.includes("patrones") ||
    textoNormalizado.includes("moldes") ||
    textoNormalizado.includes("ropa")
  ) {
    const respuestasBono = [
      `La Biblioteca incluye como bono 100 moldes para confeccionar ropa para mascotas 🐶. El bono viene incluido con la Biblioteca Digital de $79 MXN.`,

      `Sí 🐾, recibes un bono de 100 moldes para confeccionar ropa para mascotas junto con tu Biblioteca Digital Universo Canino.`,

      `El bono son 100 moldes para confeccionar ropa para mascotas 💙 y está incluido al adquirir la Biblioteca Digital Universo Canino.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasBono));
  }

  if (
    textoNormalizado.includes("perdida") ||
    textoNormalizado.includes("duelo") ||
    textoNormalizado.includes("fallecio") ||
    textoNormalizado.includes("murio") ||
    textoNormalizado.includes("guia especial") ||
    textoNormalizado.includes("mejor amigo")
  ) {
    const respuestasDuelo = [
      `La guía especial se llama "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor" 💙. Está incluida en el paquete completo de $129 MXN junto con la Biblioteca Digital y el bono de 100 moldes.`,

      `El paquete completo de $129 MXN incluye una guía especial dedicada a acompañar el proceso de pérdida de tu mejor amigo y honrar su recuerdo con amor 🐾, además de toda la Biblioteca y el bono.`,

      `Sí 💙. Tenemos la guía especial "Cómo superar la pérdida de tu mejor amigo y honrar su recuerdo con amor". Forma parte del paquete completo de $129 MXN.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasDuelo));
  }

  if (
    textoNormalizado.includes("barf") ||
    textoNormalizado.includes("alimentacion") ||
    textoNormalizado.includes("comida") ||
    textoNormalizado.includes("recetario") ||
    textoNormalizado.includes("recetas")
  ) {
    const respuestasAlimentacion = [
      `Sí 🐶. La Biblioteca incluye material de Alimentación Canina, Dieta BARF y un Recetario Saludable, para que tengas información práctica sobre estos temas a la mano.`,

      `Dentro de Universo Canino encontrarás guías de Alimentación Canina, Dieta BARF y Recetario Saludable 🐾. Todo forma parte de la Biblioteca Digital de $79 MXN.`,

      `La alimentación es uno de los temas principales de la Biblioteca 💙. Incluye Alimentación Canina, Dieta BARF y un Recetario Saludable, además del resto de las guías.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasAlimentacion));
  }

  if (
    textoNormalizado.includes("primeros auxilios") ||
    textoNormalizado.includes("emergencia") ||
    textoNormalizado.includes("accidente")
  ) {
    const respuestasAuxilios = [
      `Sí 🐶. La Biblioteca incluye una guía de Primeros Auxilios con información práctica para que conozcas mejor cómo actuar ante situaciones comunes mientras buscas atención profesional cuando sea necesaria.`,

      `Primeros Auxilios forma parte de Universo Canino 🐾. Es una de las guías incluidas dentro de la Biblioteca Digital de $79 MXN.`,

      `La Biblioteca sí incluye Primeros Auxilios 💙, junto con cuidados, alimentación, educación, geriatría y los demás contenidos de Universo Canino.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasAuxilios));
  }

  if (
    textoNormalizado.includes("raza") ||
    textoNormalizado.includes("razas") ||
    textoNormalizado.includes("cualquier perro") ||
    textoNormalizado.includes("cachorro") ||
    textoNormalizado.includes("geriatria") ||
    textoNormalizado.includes("viejo") ||
    textoNormalizado.includes("senior")
  ) {
    const respuestasRazas = [
      `Universo Canino contiene información general y práctica para dueños de perros 🐶, con temas de cuidados, alimentación, razas, educación y también geriatría para acompañar diferentes etapas de su vida.`,

      `La Biblioteca está pensada para quienes quieren conocer y cuidar mejor a su perro 🐾. Incluye Enciclopedia Canina, cuidados, alimentación, educación y Geriatría, entre otros contenidos.`,

      `Sí 💙. Encontrarás información útil para distintas etapas de la vida del perro, además de una Enciclopedia Canina y guías sobre cuidados, alimentación, comportamiento y geriatría.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasRazas));
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

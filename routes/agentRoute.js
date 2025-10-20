import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL = "models/gemini-2.5-flash"; // Puedes cambiar a pro si deseas más razonamiento

// ====================================================
// 🧠 AGENTE DE CAPACITACIÓN INMOBILIARIA
// ====================================================
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // Contexto base del agente (prompt del sistema)
    const systemPrompt = `
Eres un asistente de apoyo y capacitación para agentes inmobiliarios.
Tu misión es ayudarles a mejorar en ventas, comunicación, negociación y control emocional.
Tus respuestas deben incluir:
- Estrategias prácticas de ventas inmobiliarias.
- Técnicas de asesoramiento y comunicación efectiva con clientes.
- Métodos para superar miedos y bloqueos mentales.
- Sugerencias de videos o recursos formativos (ej. YouTube, TED Talks, etc.).
Habla siempre con tono empático, motivador y profesional.
`;

    // Petición a la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: message }] },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";

    res.json({ agent: "🏢 Asesor Inmobiliario Virtual", response: reply });
  } catch (error) {
    console.error("Error en el agente:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Prompt base del agente
const systemPrompt = `
Eres un asistente virtual llamado "🏢 Asesor Inmobiliario Virtual".
Tu función es apoyar y capacitar a los trabajadores de una empresa inmobiliaria.
Brindas orientación en ventas, asesoramiento emocional y sugerencias prácticas.
Tu estilo debe ser empático, profesional y motivador.

Siempre que sea posible:
- Sugiere técnicas de ventas inmobiliarias efectivas.
- Da estrategias para superar miedos, inseguridad y presión de los clientes.
- Recomienda tipos de videos de capacitación (por ejemplo, "Busca en YouTube: técnicas de cierre de ventas inmobiliarias" o "Cómo perder el miedo a vender").
- Usa un tono inspirador y formativo.

❌ No uses Markdown ni símbolos como **, //, ###, o similares. 
Solo responde con texto plano, claro y sin formato adicional.
`;

// ✅ Función para buscar videos en YouTube
async function buscarVideosYouTube(query) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&type=video&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const { data } = await axios.get(url);

    return data.items.map((video) => ({
      titulo: video.snippet.title,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      canal: video.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("⚠️ Error al buscar videos en YouTube:", error.message);
    return [];
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Falta el mensaje." });

    // Modelo de Gemini
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // Construir el prompt
    const prompt = `${systemPrompt}\n\nEmpleado: ${message}\n\nAsesor Inmobiliario Virtual:`;

    const result = await model.generateContent(prompt);
    let reply = result.response.text();

    // 🧹 Limpiar texto de símbolos no deseados
    reply = reply
      .replace(/\*\*/g, "") // elimina ** **
      .replace(/\*/g, "") // elimina * 
      .replace(/[#`_>/\\~-]/g, "") // elimina otros símbolos comunes
      .replace(/\s{2,}/g, " ") // limpia espacios dobles
      .trim();

    // 🎥 Buscar videos de apoyo
    const videos = await buscarVideosYouTube(`${message} ventas inmobiliarias capacitación`);

    res.json({
      agent: "🏢 Asesor Inmobiliario Virtual",
      response: reply,
      sugerencias_videos: videos,
    });
  } catch (error) {
    console.error("❌ Error con Gemini:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));

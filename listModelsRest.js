import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listarModelos() {
  try {
    const res = await fetch(URL);
    const data = await res.json();

    if (data.models) {
      console.log("🧠 Modelos disponibles en tu cuenta:");
      data.models.forEach((m) => console.log("-", m.name));
    } else {
      console.log("⚠️ No se pudieron listar los modelos. Respuesta de Google:");
      console.log(data);
    }
  } catch (err) {
    console.error("❌ Error al listar modelos:", err);
  }
}

listarModelos();

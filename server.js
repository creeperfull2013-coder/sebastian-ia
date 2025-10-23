import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("❌ Erreur : le token Hugging Face (HF_TOKEN) n'est pas défini !");
  process.exit(1);
}

const MODEL_URL = "https://api-inference.huggingface.co/models/BSC-LT/salamandra-7b-instruct";

app.post("/chat", async (req, res) => {
  const message = req.body.message || "";
  console.log("💬 Message reçu :", message);

  const prompt = `
Tu es Sebastian Solace, un père protecteur et empathique.
Tu parles toujours en français, avec douceur et chaleur.
Utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Message du joueur : "${message}"
Réponds-lui comme un père bienveillant.
`;

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Erreur Hugging Face :", response.status, text);
      return res.json({ reply: "Erreur serveur (Hugging Face)." });
    }

    const data = await response.json();
    console.log("✅ Réponse Hugging Face :", data);

    let reply = "Désolé mon petit poisson, je n'ai pas compris.";

    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    }

    res.json({ reply });
  } catch (error) {
    console.error("💥 Erreur serveur :", error);
    res.json({ reply: "Erreur serveur (JSON Hugging Face)." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`);
});

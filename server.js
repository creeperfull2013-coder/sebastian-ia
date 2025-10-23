// server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// 🔒 Token Hugging Face depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ ERREUR : HF_TOKEN non défini !");
}

// 🔹 Modèle français gratuit compatible avec Inference API
const MODEL = "moussaKam/barthez"; // modèle français public

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";
    console.log("💬 Message reçu :", userMessage);

    const prompt = `
Tu es Sebastian Solace, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu parles toujours en français, avec douceur et chaleur.
Message du joueur : "${userMessage}"
Réponds-lui comme un père bienveillant.
`;

    console.log("💡 Prompt généré :", prompt);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 100, temperature: 0.7 },
      }),
    });

    console.log("📡 Status HTTP HuggingFace :", response.status);
    const text = await response.text();
    console.log("📄 Body brut HuggingFace :", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.json({ reply: "Erreur serveur (JSON Hugging Face)." });
    }

    let reply = "Désolé mon petit poisson, je n'ai pas compris.";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text.replace(prompt, "").trim();
    }

    console.log("✅ Réponse générée :", reply);
    res.json({ reply });

  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.json({ reply: "Erreur serveur." });
  }
});

// 🔔 Render impose d'écouter sur process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`));

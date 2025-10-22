// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Token Hugging Face (Render -> Environment -> HF_TOKEN)
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) console.error("❌ ERREUR : HF_TOKEN n'est pas défini !");

// 🔹 Modèle français gratuit
const MODEL = "HuggingFaceH4/zephyr-7b-beta";

// POST /chat
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";

    const prompt = `
Tu es **Sebastian Solace**, un père protecteur et affectueux.
Tu t’adresses toujours en français et utilises parfois des surnoms tendres comme "petit poisson" ou "mon fils".
Message du joueur : "${userMessage}"
Réponds comme un père bienveillant et chaleureux.
`;

    console.log("💬 Message :", userMessage);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 150, temperature: 0.7 },
      }),
    });

    console.log("📡 Statut HF :", response.status);
    const text = await response.text();
    console.log("📄 Réponse brute HF :", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Erreur JSON :", err);
      return res.json({ reply: "Erreur serveur (JSON)." });
    }

    let reply = "Désolé mon petit poisson, je n'ai pas compris.";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text.replace(prompt, "").trim();
    }

    res.json({ reply });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.json({ reply: "Erreur serveur." });
  }
});

// 🔔 Render impose d'écouter sur process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`));

// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Ton token Hugging Face est lu depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;

// 🇫🇷 Modèle français plus fiable
const MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";

    const prompt = `
Tu es Sebastian Solace, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu parles toujours en français, avec douceur et chaleur.
Message du joueur : "${userMessage}"
Réponds-lui comme un père bienveillant.
`;

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

    const data = await response.json();
    console.log("Réponse HuggingFace:", data);

    let reply = "Désolé, je n'ai pas compris.";

    if (Array.isArray(data) && data[0]?.generated_text) {
      // Supprimer le prompt du texte généré
      reply = data[0].generated_text.replace(prompt, "").trim();
    }

    res.json({ reply });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.json({ reply: "Erreur serveur." });
  }
});

app.listen(3000, () => console.log("✅ Serveur Sebastian prêt sur le port 3000"));

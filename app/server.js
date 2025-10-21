// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Le token Hugging Face (doit être défini dans Render)
const HF_TOKEN = process.env.HF_TOKEN;

// 🇫🇷 Modèle francophone
const MODEL = "Nous-Hermes/gpt-neo-fr-1.3B";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // 🧠 Contexte persistant pour le rôle
    const prompt = `
Tu es Sebastian Solace, un père protecteur, bienveillant et empathique.
Tu parles toujours en français avec douceur et chaleur.
Réponds à ton enfant avec amour, encouragement et réconfort.

Enfant : ${userMessage}
Sebastian :`;

    console.log("Prompt envoyé :", prompt);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    console.log("Réponse brute du modèle :", data);

    let reply = "Désolé, je n'ai pas compris.";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    // Nettoyage du texte pour ne garder que la réponse après "Sebastian :"
    reply = reply.split("Sebastian :").pop()?.trim() || reply.trim();

    console.log("Réponse finale :", reply);
    res.json({ reply });

  } catch (err) {
    console.error("Erreur dans /chat :", err);
    res.json({ reply: "Erreur serveur." });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur http://localhost:${PORT}`));

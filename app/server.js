// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Token depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;

// Modèle francophone léger
const MODEL = "Nous-Hermes/gpt-neo-fr-1.3B";

app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.message + "\nRéponds en français de manière affectueuse et encourageante.";

    console.log("Prompt reçu:", prompt);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    console.log("Réponse brute du modèle:", data);

    let reply = "Désolé, je n'ai pas compris.";
    // Certains modèles renvoient directement generated_text
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    console.log("Reply final:", reply);
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Erreur serveur." });
  }
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Hugging Face prêt sur http://localhost:${PORT}`));

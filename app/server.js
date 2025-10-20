// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;             // Ton token Hugging Face
const HF_SPACE_URL = process.env.HF_SPACE_URL;     // URL du Space Hugging Face ou API Inference

app.post("/chat", async (req, res) => {
  try {
    const playerMessage = req.body.message;

    // Prompt en français, style "papa affectueux"
    const prompt = `Tu es Sebastian, un papa affectueux. Réponds en français de manière chaleureuse. Joueur dit : "${playerMessage}"`;

    const response = await fetch(HF_SPACE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    console.log("Réponse brute Hugging Face :", data);

    // Adapter selon le format du modèle
    const reply = data[0]?.generated_text 
                  || data?.data?.[0]?.generated_text
                  || "Désolé, je n'ai pas compris.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Erreur serveur." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Hugging Face prêt sur http://localhost:${PORT}`));

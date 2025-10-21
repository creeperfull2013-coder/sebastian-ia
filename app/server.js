// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔒 Token Hugging Face depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ HF_TOKEN non défini. Ajoutez-le dans Render > Environment.");
}

const MODEL = "gpt-neo-2.7B"; // tu peux changer pour un autre modèle si besoin

// Fonction pour générer la réponse IA
async function getAIResponse(prompt) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    // Vérifie si le modèle renvoie du texte
    if (data.error) {
      console.error("Hugging Face API Error:", data.error);
      return "Désolé, je n'ai pas compris.";
    }

    return data[0]?.generated_text || "Désolé, je n'ai pas compris.";
  } catch (err) {
    console.error("Erreur serveur:", err);
    return "Erreur serveur.";
  }
}

// Endpoint POST /chat
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Erreur : message vide." });

  const reply = await getAIResponse(message);
  res.json({ reply });
});

// Serveur prêt
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Hugging Face prêt sur http://localhost:${PORT}`));

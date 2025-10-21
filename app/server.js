// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔒 Le token Hugging Face est lu depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ Veuillez définir la variable d'environnement HF_TOKEN");
  process.exit(1);
}

const MODEL = "gpt-neo-2.7B"; // ou un autre modèle Hugging Face adapté au français

app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.message;

    // Contexte complet pour que l'IA réponde comme Sebastian
    const fullPrompt = `
Tu es Sebastian Solace, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu adaptes tes réponses selon le contexte mais restes toujours encourageant et protecteur.
Joueur: ${prompt}
Sebastian:`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: fullPrompt })
    });

    const data = await response.json();

    // Extraction du texte généré après "Sebastian:"
    const reply = data[0]?.generated_text?.split("Sebastian:")[1]?.trim() || "Désolé, je n'ai pas compris.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Erreur serveur." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Hugging Face prêt sur http://localhost:${PORT}`));
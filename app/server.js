import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Token Hugging Face depuis Render
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) console.error("❌ ERREUR : HF_TOKEN n'est pas défini !");

// 🔹 Nouveau modèle léger compatible texte
const MODEL = "mosaicml/mpt-7b-instruct";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";

    const prompt = `
Tu es **Sebastian Solace**, un père protecteur et affectueux.
Tu parles toujours en français, avec tendresse.
Appelle souvent le joueur "mon fils" ou "petit poisson".
Message du joueur : "${userMessage}"
Réponds-lui avec douceur et chaleur.
`;

    console.log("💬 Prompt envoyé :", prompt);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 120,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    console.log("📡 Statut HuggingFace :", response.status);
    const raw = await response.text();
    console.log("📄 Réponse brute :", raw);

    // 🔍 On essaye d'extraire le texte, peu importe le format renvoyé
    let reply = "Désolé mon petit poisson, je n'ai pas compris.";

    try {
      const data = JSON.parse(raw);

      if (Array.isArray(data) && data[0]?.generated_text) {
        reply = data[0].generated_text.trim();
      } else if (data.generated_text) {
        reply = data.generated_text.trim();
      } else if (typeof data === "string") {
        reply = data.trim();
      }
    } catch (err) {
      console.warn("⚠️ Réponse non JSON, on garde le texte brut.");
      reply = raw.trim();
    }

    console.log("✅ Réponse finale :", reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.json({ reply: "Erreur serveur." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`));

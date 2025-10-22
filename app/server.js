import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Token Hugging Face depuis Render
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) console.error("❌ ERREUR : HF_TOKEN n'est pas défini !");

// 🔹 Modèle compatible et plus léger
const MODEL = "mosaicml/mpt-7b-instruct";

// POST /chat
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";

    const prompt = `
Tu es **Sebastian Solace**, un père protecteur et affectueux.
Tu parles toujours en français, avec tendresse.
Appelle souvent le joueur "mon fils" ou "petit poisson".
Message du joueur : "${userMessage}"
Réponds-lui avec douceur et chaleur.`;

    console.log("💬 Message reçu :", userMessage);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 120, temperature: 0.7 },
      }),
    });

    console.log("📡 Statut HTTP HuggingFace :", response.status);
    const text = await response.text();
    console.log("📄 Réponse brute HF :", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Erreur parsing JSON :", err);
      return res.json({ reply: "Erreur serveur (JSON)." });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`));

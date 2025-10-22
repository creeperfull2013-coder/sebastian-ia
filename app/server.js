import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ ERREUR : HF_TOKEN n'est pas défini !");
}

// 🧠 Nouveau modèle francophone gratuit et stable
const MODEL = "HuggingFaceH4/zephyr-7b-beta";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";

    const prompt = `
Tu es **Sebastian Solace**, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu parles toujours en français, avec douceur et chaleur.
Message du joueur : "${userMessage}"
Réponds-lui comme un père bienveillant.
`;

    console.log("💬 Envoi du prompt :", prompt);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 150, temperature: 0.7 },
        }),
      }
    );

    console.log("📡 Statut HTTP Hugging Face :", response.status);
    const text = await response.text();
    console.log("📄 Réponse brute :", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.json({ reply: "Erreur côté Hugging Face (réponse non valide)." });
    }

    let reply = "Désolé mon petit poisson, je n'ai pas compris.";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text.replace(prompt, "").trim();
    }

    console.log("✅ Réponse envoyée :", reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.json({ reply: "Erreur serveur interne." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`));

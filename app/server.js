import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ ERREUR : HF_TOKEN n'est pas défini !");
}

const MODEL = "microsoft/DialoGPT-medium"; // modèle simple et stable

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";

    const prompt = `Tu es Sebastian Solace, un père protecteur et doux. Parle toujours en français.
Message du joueur : "${userMessage}"
Réponds-lui avec tendresse.`;

    console.log("💬 Prompt envoyé :", prompt);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 100, temperature: 0.7 },
      }),
    });

    console.log("📡 Status HTTP HuggingFace:", response.status);
    const text = await response.text();
    console.log("📄 Réponse brute :", text);

    let reply = "Désolé, je n'ai pas compris.";

    try {
      const data = JSON.parse(text);

      // différents formats possibles selon le modèle
      if (Array.isArray(data) && data[0]?.generated_text) {
        reply = data[0].generated_text.replace(prompt, "").trim();
      } else if (data?.generated_text) {
        reply = data.generated_text.trim();
      } else if (typeof data === "string") {
        reply = data.trim();
      }
    } catch (e) {
      console.error("⚠️ Erreur parsing JSON :", e);
    }

    console.log("✅ Réponse générée :", reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.json({ reply: "Erreur serveur (exception)." });
  }
});

app.listen(3000, () => console.log("✅ Serveur Sebastian prêt sur le port 3000"));

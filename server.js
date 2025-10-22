// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Token Hugging Face
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.warn("⚠️ HF_TOKEN non défini — configure-le dans Render > Environment");
}

const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Bonjour";
    console.log("💬 Message reçu :", userMessage);

    const prompt = `
Tu es Sebastian Solace, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu parles toujours en français, avec douceur et chaleur.
M
Réponds-lui cessage du joueur : "${userMessage}"omme un père bienveillant.
`;

    const headers = { "Content-Type": "application/json" };
    if (HF_TOKEN) headers["Authorization"] = `Bearer ${HF_TOKEN}`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 150, temperature: 0.7 },
      }),
    });

    console.log("📡 Status HTTP HuggingFace :", response.status);

    const text = await response.text();
    console.log("📄 Body brut HuggingFace :", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ Impossible de parser JSON HuggingFace :", e);
      return res.json({ reply: "Erreur serveur (JSON Hugging Face)." });
    }

    let reply = null;
    if (Array.isArray(data) && data[0] && typeof data[0].generated_text === "string") {
      reply = data[0].generated_text;
    } else if (data && typeof data.generated_text === "string") {
      reply = data.generated_text;
    } else if (data?.choices?.[0]?.text || data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].text || data.choices[0].message.content;
    }

    if (!reply) {
      console.warn("⚠️ Format inattendu reçu de Hugging Face :", Object.keys(data));
      return res.json({ reply: "Erreur serveur (Hugging Face)." });
    }

    reply = reply.replace(prompt, "").trim();
    if (!reply) reply = "Désolé mon petit poisson, je n'ai pas compris.";

    console.log("✅ Réponse générée :", reply);
    return res.json({ reply });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    return res.json({ reply: "Erreur serveur." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Sebastian prêt sur le port ${PORT}`));

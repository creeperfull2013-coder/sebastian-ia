// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔒 Le token est lu depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "gpt-neo-2.7B";

app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.message;
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });
    const data = await response.json();
    const reply = data[0]?.generated_text || "Désolé, je n'ai pas compris.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Erreur serveur." });
  }
});

app.listen(3000, () => console.log("✅ Serveur Hugging Face prêt sur http://localhost:3000"));

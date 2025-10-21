import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const HF_TOKEN = process.env.HF_TOKEN; // Ton token Hugging Face dans Render
const MODEL = "gpt-neo-2.7B";

app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.message + "\nRéponds en français de façon affectueuse.";

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    // Plusieurs modèles renvoient soit un tableau, soit un objet avec 'generated_text'
    let reply = "Désolé, je n'ai pas compris.";

    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Erreur serveur." });
  }
});

app.listen(3000, () => console.log("✅ Serveur Hugging Face prêt sur http://localhost:3000"));

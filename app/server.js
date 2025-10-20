// app/server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// Autoriser les requêtes depuis Roblox
app.use(cors());
app.use(bodyParser.json());

// 🔒 Le token Hugging Face lu depuis les variables d'environnement
const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "gpt-neo-2.7B";

// Route pour la conversation
app.post("/chat", async (req, res) => {
    try {
        const prompt = req.body.message;
        if (!prompt || prompt.trim() === "") {
            return res.json({ reply: "Désolé, je n'ai pas compris." });
        }

        const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();

        // Hugging Face peut renvoyer plusieurs formats selon le modèle
        const reply = data[0]?.generated_text || "Désolé, je n'ai pas compris.";
        res.json({ reply });

    } catch (err) {
        console.error("Erreur serveur :", err);
        res.json({ reply: "Erreur serveur. Essaie plus tard." });
    }
});

// Serveur écoute sur le port fourni par Render ou 3000 localement
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur Hugging Face prêt sur le port ${PORT}`));

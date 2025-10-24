from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import uvicorn
import os

# Création du serveur FastAPI
app = FastAPI(title="Sebastian IA")

# Modèle léger français pour CPU
MODEL_NAME = "ml6team/gelu-gpt2-small-french"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Pipeline de génération de texte
chat_pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Classe pour recevoir le message du joueur
class Message(BaseModel):
    message: str

# Route POST /chat
@app.post("/chat")
def chat(msg: Message):
    prompt = f"""
Tu es Sebastian Solace, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu adaptes tes réponses selon le contexte mais restes toujours encourageant et protecteur.
Message du joueur : "{msg.message}"
Réponds-lui avec chaleur.
"""
    output = chat_pipe(prompt, max_new_tokens=50, do_sample=True, temperature=0.7)
    reply = output[0]['generated_text'].replace(prompt, "").strip()
    return {"reply": reply}

# Lancer le serveur sur Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render fournit le port via variable d'environnement
    uvicorn.run(app, host="0.0.0.0", port=port)

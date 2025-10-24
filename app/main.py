from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import os
import torch

# Création du serveur FastAPI
app = FastAPI(title="Sebastian IA")

# Modèle français léger et compatible CPU
MODEL_NAME = "bigscience/bloom-560m"  # modèle public ~1 Go
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, device_map="cpu")

# Pipeline de génération de texte
chat_pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Classe pour recevoir le message du joueur
class Message(BaseModel):
    message: str

# Route POST /chat
@app.post("/chat")
def chat(msg: Message):
    prompt = f"""
Tu es **Sebastian Solace**, un père protecteur et empathique.
Quand tu t’adresses au joueur, utilise souvent des termes affectueux comme "petit poisson", "trésor" ou "mon fils".
Tu adaptes tes réponses selon le contexte mais restes toujours encourageant et protecteur.
Message du joueur : "{msg.message}"
Réponds-lui avec chaleur.
"""
    output = chat_pipe(prompt, max_new_tokens=150, do_sample=True, temperature=0.7)
    reply = output[0]['generated_text'].replace(prompt, "").strip()
    return {"reply": reply}

# Pour Render : utilise le port dynamique
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)

import os
from google import generativeai as genai
from dotenv import load_dotenv

load_dotenv('C:/Users/user/project/Talk_Ka_Noko/.env.local')
api_key = os.getenv('GOOGLE_GENERATIVE_AI_API_KEY')
genai.configure(api_key=api_key)

try:
    models = genai.list_models()
    print("Available Models:")
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")

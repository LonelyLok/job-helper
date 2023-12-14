import google.generativeai as genai
import os

from dotenv import load_dotenv
load_dotenv() 

google_api_key = os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=google_api_key)

model = genai.GenerativeModel('gemini-pro')

response = model.generate_content("can you tell me something about discord?")

print(response.text)




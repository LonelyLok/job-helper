import pprint
import google.generativeai as palm
import os

from dotenv import load_dotenv
load_dotenv() 

palm.configure(api_key=os.getenv('GOOGLE_PALM_API_KEY'))

text_model = 'models/text-bison-001'


def text_gen(fig):
    prompt = fig['prompt']
    temperature = fig['temperature'] if 'temperature' in fig else 0
    completion = palm.generate_text(
        model=text_model,
        prompt=prompt,
        temperature=temperature
    )
    return completion.result

def chat(fig):
    prompt = fig['prompt']
    temperature = fig['temperature'] if 'temperature' in fig else 0
    res = palm.chat(messages=prompt, temperature=temperature)
    return res.last
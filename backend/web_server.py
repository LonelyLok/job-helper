from flask import Flask, request
from flask_cors import CORS
import google.generativeai as genai
from pypdf import PdfReader

import html
from bs4 import BeautifulSoup
import requests

from dotenv import load_dotenv
import os
load_dotenv()

google_api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=google_api_key)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

main_discord_url = 'https://boards.greenhouse.io/v1/boards/discord/jobs'


@app.route('/all_discord_jobs', methods=['GET'])
def all_discord_jobs():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        # Add other headers if necessary
    }
    response = requests.get(f"{main_discord_url}", headers=headers)
    return response.json()


@app.route('/job', methods=['GET'])
def job():
    job_id = request.args.get('id')
    response = requests.get(f"{main_discord_url}/{job_id}")
    res = response.json()
    content = res['content']
    parse_content = html.unescape(content)
    soup = BeautifulSoup(parse_content, 'html.parser')
    content_list = []
    for tag in soup.find_all(lambda tag: True):
        if(tag.text not in content_list):
            content_list.append(tag.text)

    res['content_list'] = content_list
    return res


@app.route('/google_ai_read', methods=['POST'])
def google_ai_read():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data

    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(data["data"])
    return response.text

@app.route('/convert_pdf_to_text',methods=['POST'])
def convert_pdf_to_text():
    # Check if a file is part of the request
    if 'file' not in request.files:
        return "No file part in the request.", 400

    file = request.files['file']
    
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == '':
        return "No selected file.", 400

    try:
        # Create a PDF reader object
        reader = PdfReader(file.stream)
        texts = [page.extract_text().replace('\n', ' ') for page in reader.pages]
        return '\n'.join(texts)
    except Exception as e:
        # Handle exceptions that may occur during PDF processing
        return str(e), 500
    

if __name__ == '__main__':
    app.run(debug=True)

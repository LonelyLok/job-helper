from flask import Flask, request
from flask_cors import CORS

import html
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

main_discord_url = 'https://boards-api.greenhouse.io/v1/boards/discord/jobs'

@app.route('/all_discord_jobs', methods=['GET'])
def all_discord_jobs():
    response = requests.get(f"{main_discord_url}")
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
        content_list.append(tag.text)

    res['content_list'] = content_list
    return res
    

if __name__ == '__main__':
    app.run(debug=True)
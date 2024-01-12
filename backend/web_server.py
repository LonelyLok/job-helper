from flask import Flask, request, make_response
from flask_cors import CORS
import google.generativeai as genai
from pypdf import PdfReader
import openai_helper
from flask import jsonify
import datetime
from functools import wraps

from user.user_api import UserApi
from file.file_api import FileApi

import html
from bs4 import BeautifulSoup
import requests

from dotenv import load_dotenv
import os
load_dotenv()

google_api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=google_api_key)

app = Flask(__name__)
CORS(app, supports_credentials=True, origins='http://localhost:3000')

main_discord_url = 'https://boards.greenhouse.io/v1/boards/discord/jobs'

secret_key = os.getenv('TEST_SECRET_KEY')

if secret_key is None:
    raise ValueError("No SECRET_KEY set for Flask application")

user_api = UserApi()
file_api = FileApi()

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('token')
        user_id = request.cookies.get('user_id')

        if not token or not user_id:
            return jsonify({'message': 'Invalid token'}), 401
        
        try:
            user_api.is_token_valid(user_id=user_id, token=token)
        except Exception as e:
            print(e)
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/all_discord_jobs', methods=['GET'])
@token_required
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
@token_required
def job():
    job_id = request.args.get('id')
    response = requests.get(f"{main_discord_url}/{job_id}")
    res = response.json()
    content = res['content']
    parse_content = html.unescape(content)
    soup = BeautifulSoup(parse_content, 'html.parser')
    content_set = set()
    for tag in soup.find_all(lambda tag: True):
        text = tag.get_text(strip=True)
        if text:  # Check if text is not empty
            content_set.add(text)

    res['content_text'] = '\n'.join(content_set)
    res['content_html'] = str(soup)
    return res


@app.route('/google_ai_read', methods=['POST'])
@token_required
def google_ai_read():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data

    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(data["data"])
    return response.text

@app.route('/convert_pdf_to_text',methods=['POST'])
@token_required
def convert_pdf_to_text():
    if 'file' not in request.files:
        return "No file part in the request.", 400

    file = request.files['file']
    
    if file.filename == '':
        return "No selected file.", 400

    try:
        reader = PdfReader(file.stream)
        texts = [page.extract_text().replace('\n', ' ') for page in reader.pages]
        return '\n'.join(texts)
    except Exception as e:
        return str(e), 500
    
@app.route('/create_thread', methods=['POST'])
@token_required
def create_thread():
    res = openai_helper.create_thread()
    return jsonify({"thread_id": res.id})

@app.route('/add_message_to_thread', methods=['POST'])
@token_required
def add_message_to_thread():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data
    
    fig = data["data"]
    res = openai_helper.add_message_to_thread(fig)
    return jsonify({"message_id": res.id})

@app.route('/run_and_retrieve', methods=['POST'])
@token_required
def run_and_retrieve():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data
    
    fig = data["data"]
    messages_res = openai_helper.run_and_retrieve(fig)
    data = messages_res[0].content[0].text.value
    return jsonify({"data": data })

@app.route('/login', methods=['POST'])      
def login():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data
    username, password = data['data'].get('username'),  data['data'].get('password')

    try:
        user_data = user_api.login(username, password)
    except Exception as e:
        return jsonify({'message': 'Invalid credential'}), 401

    token = user_data.get('token')
    user_id = user_data.get('user_id')
    
    response = make_response(jsonify({'message': 'OK', 'user_id': user_id, 'name': user_data.get('name')  }))

    response.set_cookie('token', token, httponly=True, max_age=300)
    response.set_cookie('user_id', user_id, httponly=True, max_age=300)

    return response

@app.route('/logout', methods=['POST'])
@token_required
def logout():
    response = make_response(jsonify({"message": "Logged out successfully"}))
    response.delete_cookie('token')
    response.delete_cookie('user_id')
    return response

@app.route('/is_token_valid', methods=['GET'])
def is_token_valid():
    token = request.cookies.get('token')
    user_id = request.cookies.get('user_id')

    if(not token or not user_id):
        return jsonify({'message': 'Invalid token'}), 401
    
    try:
        user_api.is_token_valid(user_id=user_id, token=token)
        return jsonify({'message': 'OK'})
    except Exception as e:
        print(e)
        return jsonify({'message': 'Invalid token'}), 401

@app.route('/list_assistants', methods=["GET"])
@token_required
def list_assistants():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    data = user_api.list_assistants_for_user(user_id=user_id)
    return jsonify({'data': data})
    
@app.route('/create_assistant_for_user', methods=["POST"])
@token_required
def create_assistant_for_user():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data

    name, instructions = data.get('name'), data.get('instructions')

    user_api.create_assistant_for_user(user_id=user_id, assistant_name=name, assistant_instructions=instructions)

    return jsonify({'message': 'OK'})

@app.route('/delete_assistant_for_user', methods=["POST"])
@token_required
def delete_assistant_for_user():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data

    assistant_id, external_assistant_id = data.get('assistant_id'), data.get('external_assistant_id')

    try:
        res = user_api.delete_assistant_for_user(user_id=user_id, assistant_id=assistant_id, external_assistant_id=external_assistant_id)
    except Exception as e:
        return jsonify({'message': str(e) }), 404

    if(not res):
        return jsonify({'message': 'Failed request'}), 404
    
    return jsonify({'message': 'OK'})

@app.route('/upload_file_to_s3', methods=['POST'])
@token_required
def upload_file_to_s3():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']

    if not file:
        return jsonify({'message': 'No selected file'}), 400
    
    try:
        file_api.upload_file(user_id=user_id, file_bytes=file, file_name=file.filename)
        return jsonify({'message': 'File uploaded'})
    
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    
@app.route('/get_files_for_user', methods=['GET'])
@token_required
def get_files_for_user():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    
    return jsonify({'data': file_api.list_file_from_user_id(user_id=user_id)})


@app.route('/delete_file_for_user', methods=['POST'])
@token_required
def delete_file_for_user():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data

    file_id = data.get('file_id')

    if(not file_id):
        return jsonify({'message': 'Invalid request'}), 401
    
    try:
        file_api.delete_file(user_id=user_id, file_id=file_id)
        return jsonify({'message': 'file deleted'})

    except Exception as e:
        return jsonify({'message': str(e)}), 400
    

@app.route('/job_fit_init', methods=['POST'])
@token_required
def job_fit_init():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data
    
    file_id = data.get('file_id')
    assistant_id = data.get('assistant_id')
    job_text = data.get('job_text')

    if(not file_id or not assistant_id or not job_text):
        return jsonify({'message': 'Invalid request'}), 401
    
    try:
        file_stream = file_api.get_file_and_return_stream(user_id=user_id, file_id=file_id)
        file_text = file_api.extract_text_from_pdf(pdf_file_stream=file_stream)

        if(not file_text):
            return jsonify({'message': 'Invalid request'}), 401
        
        external_assistant_id = user_api.get_assistant_for_user(user_id=user_id, assistant_id=assistant_id)

        if(not external_assistant_id):
            return jsonify({'message': 'Invalid request'}), 401
        
        messages = [
            {
                "role": "user",
                "content": f"Here is the job description {job_text}"
            },
            {
                "role": "user",
                "content": f"Here is my resume {file_text}"
            },
            {
                "role": "user",
                "content": f"Rate how fit I am for this job on a scale of 1 to 10"
            }
        ]
        run = openai_helper.create_and_run({"assistant_id": external_assistant_id, "messages": messages})
        return jsonify({'message': 'OK', 'data': {'run_id': run.id, 'thread_id': run.thread_id}})
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/check_run_status', methods=['POST'])
@token_required
def check_run_status():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data
    
    thread_id = data.get('thread_id')
    run_id = data.get('run_id')
    if(not thread_id or not run_id):
        return jsonify({'message': 'Invalid request'}), 401
    checkRes = openai_helper.retrieve_run_thread(
        {"thread_id": thread_id, "run_id": run_id}
    )

    if(checkRes.status == "completed"):
        return jsonify({'status': 'completed'})
    return jsonify({'status': 'Not completed'})

@app.route('/get_thread_messages', methods=['GET'])
@token_required
def get_thread_messages():
    user_id = request.cookies.get('user_id')
    if(not user_id):
        return jsonify({'message': 'Invalid request'}), 401
    thread_id = request.args.get('thread_id')
    limit = request.args.get('limit', 20)
    order = request.args.get('order', 'desc')

    if(not thread_id):
        return jsonify({'message': 'Invalid request'}), 401
    
    try:
        message_data = openai_helper.list_thread_messages(
        {"thread_id": thread_id, "limit": limit, "order": order}
        )   
        messages_res = message_data.data
        print(messages_res[0].content[0])
        data = messages_res[0].content[0].text.value
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    return jsonify({'data': data })


    


    

if __name__ == '__main__':
    app.run(debug=True)

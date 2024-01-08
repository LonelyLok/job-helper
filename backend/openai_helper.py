from openai import OpenAI
from dotenv import load_dotenv
import os
import time

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def create_assistant(fig):
    assistant = client.beta.assistants.create(
        name=fig.get('name'),
        instructions=fig.get('instructions'),
        model="gpt-4-1106-preview",
        tools=[{"type": "retrieval"}]
    )
    return assistant

def delete_assistant(fig):
    response = client.beta.assistants.delete(fig.get('assistant_id'))
    return response


def list_assistant():
    my_assistants = client.beta.assistants.list(
        order="desc",
        limit="20",
    )
    return my_assistants


def create_assistant_file(fig):
    assistant_id, file_id = fig.get('assistant_id'), fig.get('file_id')
    res = client.beta.assistants.files.create(
        assistant_id=assistant_id,
        file_id=file_id
    )
    return res


def create_thread():
    thread = client.beta.threads.create()
    return thread


def upload_file_to_open_ai(file):
    res = client.files.create(file=open(file, 'rb'), purpose='assistants')
    return res


def add_message_to_thread(fig):
    res = client.beta.threads.messages.create(
        thread_id=fig.get('thread_id'),
        role=fig.get('role'),
        content=fig.get('content')
    )
    return res


def run_thread(fig):
    res = client.beta.threads.runs.create(
        thread_id=fig.get('thread_id'),
        assistant_id=fig.get('assistant_id'),
        instructions=fig.get('instructions')
    )
    return res


def retrieve_run_thread(fig):
    res = client.beta.threads.runs.retrieve(
        thread_id=fig.get('thread_id'),
        run_id=fig.get('run_id')
    )
    return res


def list_thread_messages(fig):
    res = client.beta.threads.messages.list(
        thread_id=fig.get('thread_id')
    )
    return res


def delete_thread(thread_id):
    response = client.beta.threads.delete(thread_id)
    return response


def run_and_retrieve(fig):
    run = run_thread(fig)
    run_id = run.id

    while (True):
        check = retrieve_run_thread(
            {"thread_id": fig.get('thread_id'), "run_id": run_id})
        if (check.status == "completed"):
            break
        time.sleep(5)

    list_messages_res = list_thread_messages({"thread_id": fig.get('thread_id')})

    list_messages = list_messages_res.data

    return list_messages

if __name__ == '__main__':
    pass

from helper import Helper
import google.generativeai as genai
import os
import json

from dotenv import load_dotenv
load_dotenv() 

google_api_key = os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=google_api_key)

model = genai.GenerativeModel('gemini-pro')

helper_instance = Helper()

jobs = helper_instance.get_discord_jobs()

job_titles = '\n'.join([j['title'] for j in jobs])



resume_text = helper_instance.convert_resume_pdf_to_text()

# resume_read_prompt = f'''Here is my resume in text form: {resume_text}.
#                         Base on my resume, which jobs I would have a good chance to be hire?
#                         Here are the job titles (title are seperated by line): 
#                         {job_titles}
#                         You need to provide the exact title from the provided titles.
#                         Provide your answer in a json array.
#                     '''
# first_resp = model.generate_content(resume_read_prompt).text
# print(first_resp)
# first_filter_job_titles = json.dumps(first_resp)
# print(first_filter_job_titles)

fake_jobs = [
  "Senior Software Engineer - Machine Learning Engineering",
  "Senior Software Engineer - Games",
  "Senior Software Engineer - Nitro Growth",
  "Senior Software Engineer - Payments",
  "Senior Software Engineer - Product",
  "Senior Software Engineer, Core Product"
]

titles_text = "\n".join(fake_jobs)
print(f'''Here are all the job titles from discord that related to the provided resume:
    {titles_text}
    ''')
first_filter_jobs = [job for job in jobs if job['title'] in fake_jobs]
for job in first_filter_jobs:
    print("-------------------------")
    content = helper_instance.get_job_content(job["url"])
    parsed_content = content.split("About Us")[0]
    job_match_prompt = f'''Here is a resume in text form: {resume_text}.
                          Here is the job title: {job["title"]}.
                          Here is the job description: {parsed_content}.
                          Rate this resume from 1 to 10, 1 mean not a good fit and 10 mean good fit.
                          Provide detail explanation on your analysis.
                        '''
    response_from_google_ai = model.generate_content(job_match_prompt)
    print(response_from_google_ai.text)
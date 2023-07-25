from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pypdf import PdfReader

discord_career_page_url = 'https://discord.com/careers'

class Helper:
    def __init__(self):
        self.file_name = 'fake_resume.pdf'
        pass

    def get_discord_jobs(self):
        driver = webdriver.Firefox()
        driver.get(discord_career_page_url)
        jobs = []
        try:
            element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "careers-items")))
            element.get_attribute('innerHTML')
            for job_elem in element.find_elements(By.CSS_SELECTOR, '.category.w-inline-block.card-job'):
                job = {}
                job['title'] = job_elem.find_element(By.CSS_SELECTOR, 'h3.paragraph-20px.none-top').text
                job['location'] = job_elem.find_element(By.CSS_SELECTOR, 'div.p-16px-black.none-bottom').text
                job['url'] = job_elem.get_attribute('href')
                job['img'] = job_elem.find_element(By.CSS_SELECTOR, 'img').get_attribute('src')
                jobs.append(job)
        finally:
            driver.quit()
        return jobs
    
    def get_job_content(self, job_url):
        driver = webdriver.Firefox()
        driver.get(job_url)
        meta_tag = driver.find_element(By.XPATH, '//meta[@property="og:description"]')
        description = meta_tag.get_attribute('content')
        driver.quit()
        return description
    

    def convert_resume_pdf_to_text(self):
        texts = []
        reader = PdfReader(self.file_name)
        for page_number in range(0,len(reader.pages)):
            page = reader.pages[page_number]
            text = page.extract_text()
            texts.append(text.replace('\n', ' '))
        return '\n'.join(texts)

            




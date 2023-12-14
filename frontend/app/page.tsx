"use client";
import JobCard from './component/job-card'
import React, { useState, useEffect } from 'react';

async function getData(){
  const res = await fetch('http://localhost:5000/all_discord_jobs')
  return res.json()
}


export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [fileText, setFileText] = useState('');
  useEffect(() => {
    const getData = async () => {
      const res = await fetch('http://localhost:5000/all_discord_jobs', {
        method: 'GET',
        cache: 'no-cache' // This ensures no caching for this request
      });
      const data = await res.json();
      setJobs(data.jobs);
    };
    getData();
  }, []);

  const handleFileSelect = async (event:any) => {
    const file = event.target.files[0]
    if(file){
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/convert_pdf_to_text', {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      setFileText(text)
    }
  };
  return (
    <main className="min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full justify-between font-mono text-sm flex flex-col mb-8">
        <p className="text-4xl">All Discord Jobs</p>
        <input type="file" accept="application/pdf" onChange={handleFileSelect} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {jobs.map((job:any, index:number) => (
        <JobCard key={index} job={job} />
      ))}
    </div>
    </main>
  )
}
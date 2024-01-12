"use client";
import JobCard from './components/job-card'
import React, { useState, useEffect } from 'react';
import { withAuth } from '../auth-hoc'
import NavLayout from '../components/NavLayout';

const localHostUrl = 'http://localhost:5000'


function JobCardPage() {
  const [jobs, setJobs] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileText, setFileText] = useState('');
  useEffect(() => {
    const getData = async () => {
      const res = await fetch(`${localHostUrl}/all_discord_jobs`, {
        method: 'GET',
        cache: 'no-cache', // This ensures no caching for this request
        credentials: 'include',
      });
      const data = await res.json();
      setJobs(data.jobs);
    };
    const getAssistantsData = async () => {
      const res = await fetch(`${localHostUrl}/list_assistants`, {
        method: 'GET',
        cache: 'no-cache', // This ensures no caching for this request
        credentials: 'include',
      });
      const data = await res.json();
      setAssistants(data.data);
    };
    const getFilesData = async () => {
      const res = await fetch(`${localHostUrl}/get_files_for_user`, {
        method: 'GET',
        cache: 'no-cache', // This ensures no caching for this request
        credentials: 'include',
      });
      const data = await res.json();
      setFiles(data.data);
    };
    getData();
    getAssistantsData();
    getFilesData();
  }, []);
  return (
    <NavLayout>
      <main className="min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full justify-between font-mono text-sm flex flex-col mb-8">
        <p className="text-4xl">All Discord Jobs</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {jobs.map((job:any, index:number) => (
        <JobCard key={index} job={{...job, job_url: `https://discord.com/jobs/${job.id}`}} fileText={fileText} assistants={assistants} files={files}/>
      ))}
    </div>
    </main>
    </NavLayout>
  )
}

export default withAuth(JobCardPage)
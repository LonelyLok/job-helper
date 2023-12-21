"use client";
import React, { useState } from 'react';
import { Button, CircularProgress, Card, CardContent, Typography, Modal } from '@mui/material';

const localCache = {}


async function getJob(jobId: number) {
    const res = await fetch(`http://localhost:5000/job?id=${jobId}`)
    return res.json()
}

async function askGoogle(jobText: string, fileText:string){
    const jobMatchPrompt = `Here is a resume in text form: ${fileText}.
                          Here is the job description: ${jobText}.
                          Rate this resume from 1 to 10, 1 mean not a good fit and 10 mean good fit.
                          Provide detail explanation on your analysis.
                        `
    const res = await fetch(`http://localhost:5000/google_ai_read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: jobMatchPrompt })
    });
      return res.text()
}

const contentHelper = (contentList: string[]) => {
    const contentElements = contentList.map((item, index) => (
        <p key={index}>{item}</p>
    ))
    return contentElements
}



function JobCard({ job, fileText }: { job: any; fileText: string }) {
    const [open, setOpen] = useState(false);
    const [jobContent, setJobContent] = useState<any>(null);
    const [loading, setLoading] = useState(false)

    const handleOpenJob = async (jobId: number) => {
        setLoading(true)
        setOpen(true);
        const jobData = await getJob(jobId)
        const { content_list }: { content_list: string[] } = jobData
        const googleResp:string = await askGoogle(content_list.join('\n'),fileText)
        setJobContent(googleResp)
        setLoading(false);
    };

    const handleCloseJob = () => {
        setOpen(false);
        setJobContent(null)
    };

    const modalStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        backgroundColor: 'black',
        padding: '16px 32px',
        borderRadius: '8px',
        maxWidth: '80%',
        maxHeight: '80%',
        overflowY: 'auto',
        border: '1px solid white'
    }

    return (
        <div>
            <Card style={{ backgroundColor: 'rgba(179, 176, 175, 1.0)', width: '300px', height: '200px' }} onClick={() => handleOpenJob(job.id)}>
                <CardContent>
                    <Typography variant="h6" component="h6">
                        {job.title}
                    </Typography>
                    <Typography color="textSecondary">
                        {job.location.name}
                    </Typography>
                </CardContent>
            </Card>
            <Modal
                open={open}
                onClose={handleCloseJob}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={modalStyle}>
                    {loading ? <CircularProgress /> : <div>
                        <p>{jobContent}</p>
                        <a href={job.job_url}>
                            <Button>
                                Link to job post
                            </Button>
                        </a>
                        </div>}
                </div>
            </Modal>
        </div>

    );
}

export default JobCard
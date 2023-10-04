"use client";
import React, { useState } from 'react';
import { Card, CardContent, Typography, Modal } from '@mui/material';

const localCache = {}


async function getJob(jobId: number) {
    const res = await fetch(`http://localhost:5000/job?id=${jobId}`)
    return res.json()
}

const contentHelper = (contentList: string[]) => {
    const contentElements = contentList.map((item, index) => (
        <p key={index}>{item}</p>
      ))
    return contentElements
}



function JobCard({ job }: { job: any }) {
    const [open, setOpen] = useState(false);
    const [jobContent, setJobContent] =  useState<React.ReactElement[] | null>(null);

    const handleOpenJob = async (jobId: number) => {
        const jobData = await getJob(jobId)
        const { content_list }:{content_list: string[]} = jobData
        setJobContent(contentHelper(content_list))
        setOpen(true);
    };

    const handleCloseJob = () => {
        setOpen(false);
    };

    const modalStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute', backgroundColor: 'black', padding: '16px 32px', borderRadius: '8px',maxWidth: '80%', 'maxHeight': '80%',overflowY: 'auto'  }
    const contentStyle = {
        fontSize: '0.8em',  // Increase font size for better readability
        lineHeight: '1.5',  // Increase line height for better readability
    };
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
                    {jobContent}
                </div>
            </Modal>
        </div>

    );
}

export default JobCard
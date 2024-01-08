'use client';
import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Modal,
  Drawer,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';

async function getJob(jobId: number) {
  const res = await fetch(`http://localhost:5000/job?id=${jobId}`, {credentials: 'include'});
  return res.json();
}

async function askGoogle(jobText: string, fileText: string) {
  const jobMatchPrompt = `Here is a resume in text form: ${fileText}.
                          Here is the job description: ${jobText}.
                          Rate this resume from 1 to 10, 1 mean not a good fit and 10 mean good fit.
                          Provide detail explanation on your analysis.
                        `;
  const res = await fetch(`http://localhost:5000/google_ai_read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: jobMatchPrompt }),
  });
  return res.text();
}

async function setUpThreadAndAsk(assistantId: string, jobData: string) {
  const createThreadRes = await fetch(`http://localhost:5000/create_thread`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await createThreadRes.json();
  const threadId = data.thread_id;

  const addMessageRes = await fetch(
    `http://localhost:5000/add_message_to_thread`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          thread_id: threadId,
          role: 'user',
          content: `How fit am I out of 10 for this job descrption: ${jobData}`,
        },
      }),
    }
  );

  const runRes = await fetch(`http://localhost:5000/run_and_retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        thread_id: threadId,
        assistant_id: assistantId,
        instructions:
          'Given the user resume and the job description, rate how fit the user would be for the job out of 10. Your response has to within 100 words',
      },
    }),
  });

  return await runRes.json();
}

const contentHelper = (contentList: string[]) => {
  const contentElements = contentList.map((item, index) => (
    <p key={index}>{item}</p>
  ));
  return contentElements;
};

function JobCard({ job, fileText }: { job: any; fileText: string }) {
  const [open, setOpen] = useState(false);
  const [jobContent, setJobContent] = useState<any>(null);
  const [aiContent, setAIContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sideContentOpen, setSideContentOpen] = useState(false);

  const handleOpenJob = async (jobId: number) => {
    setLoading(true);
    setOpen(true);
    const jobData = await getJob(jobId);
    const {
      content_text,
      content_html,
    }: { content_text: string; content_html: string } = jobData;
    // const googleResp:string = await askGoogle(content_list.join('\n'),fileText)
    // const firstMessageData = await setUpThreadAndAsk(testAssistantId, content_text)
    // setAIContent(firstMessageData.data)
    setJobContent(content_html);
    setLoading(false);
  };

  const handleCloseJob = () => {
    setOpen(false);
    setSideContentOpen(false);
    setJobContent(null);
  };

  const toggleDrawer = (open: any) => (event: any) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setSideContentOpen(open);
  };

  const modalStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '16px',
    position: 'absolute',
    backgroundColor: 'black',
    borderRadius: '2px',
    maxWidth: '100%',
    maxHeight: '100%',
    overflowY: 'auto',
    border: '1px solid white',
    display: 'flex', // Flex layout
    flexDirection: 'row',
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    overflowY: 'auto', // Add scroll to the main content
    maxHeight: '80vh',
  };

  const footerStyle: React.CSSProperties = {
    padding: '10px', // Add some padding around the button
  };

  return (
    <div>
      <Card
        style={{
          backgroundColor: 'rgba(179, 176, 175, 1.0)',
          width: '300px',
          height: '200px',
        }}
        onClick={() => handleOpenJob(job.id)}
      >
        <CardContent>
          <Typography variant='h6' component='h6'>
            {job.title}
          </Typography>
          <Typography color='textSecondary'>{job.location.name}</Typography>
        </CardContent>
      </Card>
      <Modal
        open={open}
        onClose={handleCloseJob}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <div style={modalStyle}>
          {loading ? (
            <CircularProgress />
          ) : (
            <div style={{ display: 'flex', height: '100%' }}>
              {/* Main content */}
              <div style={contentStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                  }}
                >
                  <p style={{ textAlign: 'center' }}>Job Description</p>
                  <Button onClick={toggleDrawer(true)}>Open AI Analysis</Button>
                </div>
                <div dangerouslySetInnerHTML={{ __html: jobContent }}></div>
                <div style={footerStyle}>
                  <a href={job.job_url}>
                    <Button>Link to job post</Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Drawer
        anchor='right'
        open={sideContentOpen}
        onClose={toggleDrawer(false)}
      >
        <div style={{ width: 400, padding: 10 }}>
          <ReactMarkdown>{'**hello**'}</ReactMarkdown>
        </div>
      </Drawer>
    </div>
  );
}

export default JobCard;

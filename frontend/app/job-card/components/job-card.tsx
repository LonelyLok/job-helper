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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';

async function getJob(jobId: number) {
  const res = await fetch(`http://localhost:5000/job?id=${jobId}`, {
    credentials: 'include',
  });
  return res.json();
}

async function jobFitInit(assistantId: number, fileId: number, jobText: string) {
  const res = await fetch(`http://localhost:5000/job_fit_init`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assistant_id: assistantId, file_id: fileId, job_text: jobText }),
  });
  return await res.json();
}

async function checkRunStatus(runId: string, threadId: string) {
  const res = await fetch(`http://localhost:5000/check_run_status`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ run_id: runId, thread_id: threadId }),
  });
  return await res.json();
}

async function getMessages(threadId: string) {
  try {
    const response = await fetch(`http://localhost:5000/get_thread_messages?thread_id=${threadId}&limit=${1}&order=${"desc"}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
  return null

}

function JobCard({ job, fileText, assistants, files }: { job: any; fileText: string, assistants: any[]; files: any[] }) {
  const [open, setOpen] = useState(false);
  const [jobContent, setJobContent] = useState<any>(null);
  const [jobText, setJobText] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sideContentOpen, setSideContentOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null)
  const [selectedOption2, setSelectedOption2] = useState<any>(null)

  const [loadingResult, setLoadingResult] = useState(false)

  const [resultText, setResultText] = useState<any>(null)

  const handleSelectChange = (event: any) => {
    if (event.target.value) {
      setSelectedOption(event.target.value)
    }
  }

  const handleSelectChange2 = (event: any) => {
    if (event.target.value) {
      setSelectedOption2(event.target.value)
    }
  }

  const handleSubmitJobInit = async () => {
    setLoadingResult(true);
    const assistant = selectedOption;
    const file = selectedOption2;
    if (!assistant || !file) {
      return
    }

    const response = (assistant?._id && file?._id)
      ? await jobFitInit(assistant._id, file._id, jobText)
      : null;

    if (!response) {
      return
    }
    const { run_id, thread_id } = response.data;
    let counter = 0;

    const checkStatus = () => {
      return new Promise(async (resolve, reject) => {
        if (counter < 12) { // 12 * 10 seconds = 120 seconds
          const response = await checkRunStatus(run_id, thread_id);
          if (response.status === 'completed') {
            resolve(true);
          } else {
            counter++;
            setTimeout(() => {
              checkStatus().then(resolve).catch(reject);
            }, 10000);
          }
        } else {
          console.log('Max check time exceeded');
          resolve(false);
        }
      });
    };

    const check = await checkStatus();

    if(!check) {
      return
    }

    const messageRes = await getMessages(thread_id);

    if(!messageRes){
      return;
    }
    const message = messageRes.data;
    setLoadingResult(false);
    setResultText(message);
  }

  const handleOpenJob = async (jobId: number) => {
    setLoading(true);
    setOpen(true);
    const jobData = await getJob(jobId);
    const {
      content_text,
      content_html,
    }: { content_text: string; content_html: string } = jobData;
    setJobContent(content_html);
    setJobText(content_text);
    setLoading(false);
  };

  const handleCloseJob = () => {
    if (!sideContentOpen) {
      setOpen(false);
      setJobContent(null);
    }
  };

  const handleDrawerOpen = () => {
    setSideContentOpen(!sideContentOpen);
  };

  const handleDrawerClose = (event: any) => {
    setSideContentOpen(false);
    setLoadingResult(false);
    setResultText(null);
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

  const lightBlueColor = 'rgb(78, 219, 255)';
  const lightBlueColorA = 'rgba(78, 219, 255, 0.5)';

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
                  <Button onClick={handleDrawerOpen}>Open AI Analysis</Button>
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
          <Drawer
            anchor='right'
            open={sideContentOpen}
            onClose={handleDrawerClose}
            style={{ zIndex: 1400 }}
          >
            <div
              style={{
                width: 400,
                padding: 10,
                backgroundColor: 'rgb(25, 24, 48)',
                height: '100%',
                color: lightBlueColor,
                zIndex: 1500,
              }}
            >
              <Typography sx={{ mb: 2 }}>
                <ReactMarkdown>{'**Hello**'}</ReactMarkdown>
              </Typography>
              <FormControl variant="outlined" sx={{ width: '100%', color: lightBlueColor, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: lightBlueColor }, '&:hover fieldset': { borderColor: lightBlueColor }, '&.Mui-focused fieldset': { borderColor: lightBlueColor } } }}>
                <InputLabel id="demo-simple-select-outlined-label" sx={{ color: lightBlueColorA, }}>Assistant</InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={selectedOption}
                  onChange={handleSelectChange}
                  label="Assistant"
                  MenuProps={{
                    style: { zIndex: 5000 }
                  }}
                  input={<OutlinedInput label="Assistant" sx={{ color: lightBlueColor }} />}
                  sx={{
                    '&& .MuiSelect-icon': { color: lightBlueColor },
                    '&& .MuiSelect-select': { color: lightBlueColor },
                    mb: 3,
                  }}
                >
                  {assistants.map((assistant: any) => {
                    return (
                      <MenuItem key={assistant._id} value={assistant}>{assistant.name}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ width: '100%', color: lightBlueColor, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: lightBlueColor }, '&:hover fieldset': { borderColor: lightBlueColor }, '&.Mui-focused fieldset': { borderColor: lightBlueColor } } }}>
                <InputLabel id="demo-simple-select-outlined-label" sx={{ color: lightBlueColorA }}>Resume</InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={selectedOption2}
                  onChange={handleSelectChange2}
                  label="Resume"
                  MenuProps={{
                    style: { zIndex: 5000 }
                  }}
                  input={<OutlinedInput label="Resume" sx={{ color: lightBlueColor }} />}
                  sx={{
                    '&& .MuiSelect-icon': { color: lightBlueColor },
                    '&& .MuiSelect-select': { color: lightBlueColor },
                    mb: 3,
                  }}
                >
                  {files.map((file: any) => {
                    return (
                      <MenuItem key={file._id} value={file}>{file.name}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => handleSubmitJobInit()} sx={{ color: lightBlueColor, mb: 3 }}>Submit</Button>
              <Typography sx={{ mb: 2 }}>
                {loadingResult && <CircularProgress />}
                {resultText}
              </Typography>
            </div>
          </Drawer>
        </div>
      </Modal>
    </div>
  );
}

export default JobCard;

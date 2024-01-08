'use client';
import React, { useState, useEffect, useRef } from 'react';
import { withAuth } from '../auth-hoc';
import NavLayout from '../components/NavLayout';
import AssistantsTable from './components/assistants-table';
import FilesTable from './components/files-table';
import {
    Typography, Grid
} from '@mui/material';

const localHostUrl = 'http://localhost:5000';

const titleStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const Settings = () => {
    const [assistants, setAssistants] = useState([]);
    const [files, setFiles] = useState([]);

    const [createAssistantOpen, setCreateAssistantOpen] = useState(false);
    const [createAssistantName, setCreateAssistantName] = useState('');
    const [createAssistantInstructions, setCreateAssistantInstructions] = useState('')

    const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
    const [deleteAssistant, setDeleteAssistant] = useState<any>(null)


    const [deleteFileWarningOpen, setDeleteFileWarningOpen] = useState(false);
    const [deleteFile, setDeleteFile] = useState<any>(null)

    const handleDeleteAssistantRequest = async () => {
        if (!deleteAssistant?._id || !deleteAssistant?.external_id) {
            return
        }
        try {
            const response = await fetch(`${localHostUrl}/delete_assistant_for_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    assistant_id: deleteAssistant._id,
                    external_assistant_id: deleteAssistant?.external_id
                })
            });

            if (response.ok) {
                await getAssistantData()
                handleDeleteAssistantModalClose()
            }

        } catch (err) {
            console.log(err)
        }
    }

    const handleFileDelete = async () => {
        if (!deleteFile?._id) {
            return
        }
        try {
            const response = await fetch(`${localHostUrl}/delete_file_for_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    file_id: deleteFile._id,
                })
            });

            if (response.ok) {
                await getFileData()
                handleDeleteFileModalClose()
            }

        } catch (err) {
            console.log(err)
        }
    }

    const handleCloseAssistantModal = () => {
        setCreateAssistantOpen(false);
    };

    const handleCreateAssistantNameChange = (event: any) => {
        setCreateAssistantName(event.target.value)
    }

    const handleCreateAssistantInstructionsChange = (event: any) => {
        setCreateAssistantInstructions(event.target.value)
    }

    const handleDeleteAssistantModalOpen = (assistant: any) => {
        setDeleteWarningOpen(true)
        setDeleteAssistant(assistant)
    }

    const handleDeleteAssistantModalClose = () => {
        setDeleteWarningOpen(false)
        setDeleteAssistant(null)
    }

    const handleDeleteFileModalOpen = (file: any) => {
        setDeleteFileWarningOpen(true)
        setDeleteFile(file)
    }

    const handleDeleteFileModalClose = () => {
        setDeleteFileWarningOpen(false)
        setDeleteFile(null)
    }

    const getAssistantData = async () => {
        const res = await fetch(`${localHostUrl}/list_assistants`, {
            method: 'GET',
            credentials: 'include',
        });
        const resData = await res.json();
        if (resData?.data?.length) {
            setAssistants(resData?.data);
        } else {
            setAssistants([])
        }
    };

    const getFileData = async () => {
        const res = await fetch(`${localHostUrl}/get_files_for_user`, {
            method: 'GET',
            credentials: 'include',
        });
        const resData = await res.json();
        if (resData?.data?.length) {
            setFiles(resData?.data);
        } else {
            setFiles([])
        }
    };

    const handleFileSelect = async (file: any) => {
        if (!file) {
            return
        }
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`${localHostUrl}/upload_file_to_s3`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                console.log('ok')
                await getFileData()
            }

        } catch (err) {
            console.log(err)
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        // Handle form submission
        if (!createAssistantName || !createAssistantInstructions) {
            return;
        }
        const response = await fetch(`${localHostUrl}/create_assistant_for_user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: createAssistantName,
                instructions: createAssistantInstructions
            })
        });
        if (response.ok) {
            setCreateAssistantName('')
            setCreateAssistantInstructions('')
            setCreateAssistantOpen(false)
            await getAssistantData()
        }
    };

    useEffect(() => {
        getAssistantData();
        getFileData();
    }, []);

    return (
        <NavLayout>
            <div>
                <Typography variant='h2' style={titleStyle}>
                    Settings
                </Typography>
                <Grid container spacing={0}>
                    <Grid item xs={9} justifyContent="center">
                        <AssistantsTable props={{
                            handleCreateAssistantInstructionsChangeFunc: handleCreateAssistantInstructionsChange,
                            createAssistantInstructions,
                            handleCreateAssistantNameChangeFunc: handleCreateAssistantNameChange,
                            createAssistantName,
                            handleSubmitFunc: handleSubmit,
                            createAssistantOpen,
                            deleteAssistant,
                            deleteWarningOpen,
                            handleDeleteAssistantModalCloseFunc: handleDeleteAssistantModalClose,
                            handleCloseAssistantModalFunc: handleCloseAssistantModal,
                            setCreateAssistantOpenFunc: setCreateAssistantOpen,
                            handleDeleteAssistantModalOpenFunc: handleDeleteAssistantModalOpen,
                            handleDeleteAssistantRequestFunc: handleDeleteAssistantRequest,
                            assistants,
                        }}/>
                    </Grid>
                    <Grid item xs={3}>
                        <FilesTable props={{
                            handleFileSelectFunc: handleFileSelect,
                            handleFileDeleteFunc: handleFileDelete,
                            handleDeleteFileModalOpenFunc: handleDeleteFileModalOpen,
                            deleteFile,
                            deleteFileWarningOpen,
                            handleDeleteFileModalCloseFunc: handleDeleteFileModalClose,
                            files
                        }}/>
                    </Grid>

                </Grid>
            </div>
        </NavLayout>
    );
};

export default withAuth(Settings);

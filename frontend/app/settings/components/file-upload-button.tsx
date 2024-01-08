import React, { useRef } from 'react';
import { Button } from '@mui/material';

const FileUploadButton = ({ onFileSelect }: any) => {
  const fileInputRef: any = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event:any) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
    event.target.value = '';
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf" // Accept only .txt files
        style={{ display: 'none' }}
      />
      <Button variant="contained" color="primary" onClick={handleButtonClick}>
        Upload File
      </Button>
    </div>
  );
};

export default FileUploadButton;
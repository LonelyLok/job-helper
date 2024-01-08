import {
    Typography,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Modal,
    Button,
    SxProps
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import FileUploadButton from './file-upload-button';

const deleteFileModalStyle: SxProps = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300, // Adjust the width as needed
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4, // Padding around the content
    borderRadius: 2, // Optional, for rounded corners
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center align the items
    gap: 2, // Space between elements
  };

const FilesTable = ({ props }: any) => {
    const { handleDeleteFileModalOpenFunc, handleFileSelectFunc, handleFileDeleteFunc, deleteFile, files, deleteFileWarningOpen, handleDeleteFileModalCloseFunc } = props
    return (
        <Container>
            <Typography>
                Files
            </Typography>
            <FileUploadButton onFileSelect={handleFileSelectFunc} />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 100 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((row: any) => {
                            return (
                                <TableRow
                                    key={row._id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            {row.name}
                                            <IconButton onClick={() => handleDeleteFileModalOpenFunc(row)}>
                                                <DeleteOutline />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal
        open={deleteFileWarningOpen}
        onClose={handleDeleteFileModalCloseFunc}
      >
        <Box sx={deleteFileModalStyle}>
          <Typography sx={{ color: 'red' }}>
            Please comfirm delete assistant {deleteFile?.name}
          </Typography>
          <Button
            onClick={() => handleFileDeleteFunc()}
            variant='outlined'
          >
            Yes
          </Button>
          <Button
            onClick={handleDeleteFileModalCloseFunc}
            variant='outlined'
          >
            No
          </Button>
        </Box>
      </Modal>
        </Container>
    )
}

export default FilesTable
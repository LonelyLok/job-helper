import {
  Typography,
  Container,
  Button,
  Modal,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  SxProps,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';

const deleteAssistantModalStyle: SxProps = {
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

const modalStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: 400,
  padding: 4,
  outline: '2px solid #000',
  backgroundColor: 'rgb(48, 52, 67)',
};

const outlineStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white', // Change this to your desired border color (normal state)
    },
    '&:hover fieldset': {
      borderColor: 'white', // Change this for the hover state
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white', // Change this for the focused state
    },
  },
};

const maskExternalId = (externalId: string) => {
  // Replace this logic with your desired masking logic
  const maskedPart = '*'.repeat(externalId.length - 8);
  const visiblePart = externalId.slice(-8);
  return `${maskedPart}${visiblePart}`;
}

const AssistantsTable = ({ props }: any) => {
  const {
    handleCreateAssistantInstructionsChangeFunc,
    createAssistantInstructions,
    handleCreateAssistantNameChangeFunc,
    createAssistantName,
    handleSubmitFunc,
    createAssistantOpen,
    deleteAssistant,
    deleteWarningOpen,
    handleDeleteAssistantModalCloseFunc,
    handleCloseAssistantModalFunc,
    setCreateAssistantOpenFunc,
    handleDeleteAssistantModalOpenFunc,
    handleDeleteAssistantRequestFunc,
    assistants,
  } = props;
  return (
    <Container>
      <Typography>Assistants</Typography>
      <Button variant="contained" onClick={() => setCreateAssistantOpenFunc(true)}>
        Create Assistant
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Instructions</TableCell>
              <TableCell>ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assistants.map((row: any) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {row.name}
                </TableCell>
                <TableCell>{row.instructions}</TableCell>
                <TableCell>{maskExternalId(row.external_id)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeleteAssistantModalOpenFunc(row)}
                  >
                    <DeleteOutline />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={deleteWarningOpen}
        onClose={handleDeleteAssistantModalCloseFunc}
      >
        <Box sx={deleteAssistantModalStyle}>
          <Typography sx={{ color: 'red' }}>
            Please comfirm delete assistant {deleteAssistant?.name}
          </Typography>
          <Button
            onClick={() => handleDeleteAssistantRequestFunc()}
            variant='outlined'
          >
            Yes
          </Button>
          <Button
            onClick={handleDeleteAssistantModalCloseFunc}
            variant='outlined'
          >
            No
          </Button>
        </Box>
      </Modal>
      <Modal open={createAssistantOpen} onClose={handleCloseAssistantModalFunc}>
        <Box
          sx={modalStyle}
          component='form'
          onSubmit={handleSubmitFunc}
          autoComplete='off'
        >
          <p>Create assistant on open ai</p>
          <TextField
            id='name'
            name='name'
            label='name'
            fullWidth
            required
            margin='normal'
            value={createAssistantName}
            onChange={(e) => handleCreateAssistantNameChangeFunc(e)}
            InputLabelProps={{
              style: { color: 'white' }, // Sets the color of the label to white
            }}
            InputProps={{
              style: { color: 'white' }, // Sets the color of the input text to white
            }}
            sx={outlineStyle}
          />
          <TextField
            id='instructions'
            name='instructions'
            label='instructions'
            fullWidth
            multiline
            required
            rows={4}
            margin='normal'
            value={createAssistantInstructions}
            onChange={(e) => handleCreateAssistantInstructionsChangeFunc(e)}
            InputLabelProps={{
              style: { color: 'white' }, // Sets the color of the label to white
            }}
            InputProps={{
              style: { color: 'white' }, // Sets the color of the input text to white
            }}
            sx={outlineStyle}
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            sx={{ mt: 4 }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default AssistantsTable;

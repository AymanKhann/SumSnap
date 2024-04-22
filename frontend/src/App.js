import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, TextField, Button, Box } from '@mui/material';
import ChatArea from './ChatArea';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [summary1, setSummary1] = useState('');
  const [summary2, setSummary2] = useState('');

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
    
  };

  return (
    <div>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SumSnap</Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container>
        {/* PDF Upload */}
        <Box mt={4}>
          <Typography variant="h6">Upload PDF</Typography>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
          />
        </Box>

        {/* Display Areas */}
        <Box mt={4} display="flex" justifyContent="space-between">
          <ChatArea title="Summary from Ollama" content={summary1} />
          <ChatArea title="Summary from ChatGPT" content={summary2} />
        </Box>
      </Container>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import ChatArea from './ChatArea';

// Set the worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
    const [summary1, setSummary1] = useState('');
    const [summary2, setSummary2] = useState('');

    // Create a WebSocket connection to the backend server
    useEffect(() => {
        // Replace 'ws://localhost:4000' with the URL of your WebSocket server
        const ws = new WebSocket('ws://localhost:4000');

        // Handle WebSocket connection open event
        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        // Handle incoming messages from the WebSocket server
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Update the state variables with the summaries from the backend
            setSummary1(data.summary1);
            setSummary2(data.summary2);
        };

        // Handle WebSocket connection error event
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Handle WebSocket connection close event
        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Clean up the WebSocket connection when the component unmounts
        return () => {
            ws.close();
        };
    }, []);

    // Handle PDF upload and extraction
    const handlePdfUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create a FileReader to read the PDF file
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;

                // Create a PDF document
                const loadingTask = pdfjs.getDocument(arrayBuffer);
                loadingTask.promise.then((pdf) => {
                    // Process each page of the PDF
                    const numPages = pdf.numPages;
                    const textPromises = [];
                    for (let i = 1; i <= numPages; i++) {
                        textPromises.push(pdf.getPage(i).then((page) => {
                            return page.getTextContent().then((textContent) => {
                                // Extract text content from the page
                                const text = textContent.items.map((item) => item.str).join('');
                                return text;
                            });
                        }));
                    }

                    // Resolve all promises and process the extracted text
                    Promise.all(textPromises).then((texts) => {
                        // Combine the text from all pages
                        const fullText = texts.join('\n');

                        // Process the full text as needed
                        // Send the full text to the backend through WebSocket for summarization
                        const ws = new WebSocket('ws://localhost:4000');
                        ws.onopen = () => {
                            // Send the PDF text to the backend server
                            const message = {
                                type: 'pdfText',
                                text: fullText,
                            };
                            ws.send(JSON.stringify(message));
                        };
                    });
                });
            };
            // Read the PDF file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
        }
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

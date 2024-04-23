import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import ChatArea from './ChatArea';
const retryRequest = require('./utils');

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
    const [summary1, setSummary1] = useState('');
    const [summary2, setSummary2] = useState('');
    const [webSocket, setWebSocket] = useState(null);

    useEffect(() => {

        const ws = new WebSocket('ws://localhost:4000');

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setSummary1(data.summary1);
            setSummary2(data.summary2);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        setWebSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    const handlePdfUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;

            try {
                const pdf = await pdfjs.getDocument(arrayBuffer).promise;
                const numPages = pdf.numPages;

                const textPromises = [];
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const text = textContent.items.map((item) => item.str).join('');
                    textPromises.push(text);
                }

                const texts = await Promise.all(textPromises);
                const fullText = texts.join('\n');

                // Send the extracted text through WebSocket
                if (webSocket) {
                    const message = {
                        type: 'pdfText',
                        text: fullText,
                    };
                    webSocket.send(JSON.stringify(message));
                }
            } catch (error) {
                console.error('Error during PDF processing:', error);
            }
        };

        reader.readAsArrayBuffer(file);
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
                    <ChatArea title="Summary from GPT-3.5" content={summary1} />
                    <ChatArea title="Summary from OLlama" content={summary2} />
                </Box>
            </Container>
        </div>
    );
}

export default App;

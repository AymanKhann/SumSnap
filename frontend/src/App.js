import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import ChatArea from './ChatArea';

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
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;

                const loadingTask = pdfjs.getDocument(arrayBuffer);
                loadingTask.promise.then((pdf) => {
                    const numPages = pdf.numPages;
                    const textPromises = [];
                    for (let i = 1; i <= numPages; i++) {
                        textPromises.push(pdf.getPage(i).then((page) => {
                            return page.getTextContent().then((textContent) => {
                                const text = textContent.items.map((item) => item.str).join('');
                                return text;
                            });
                        }));
                    }

                    Promise.all(textPromises).then((texts) => {
                        const fullText = texts.join('\n');

                        if (webSocket) {
                            const message = {
                                type: 'pdfText',
                                text: fullText,
                            };
                            webSocket.send(JSON.stringify(message));
                        }
                    });
                });
            };
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

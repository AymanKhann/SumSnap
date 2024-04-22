const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.post('/upload', (req, res) => {
    res.json({ summary1: 'Summary from Ollama', summary2: 'Summary from ChatGPT' });
});

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'pdfText') {
            ws.send(JSON.stringify({ summary1: 'Summary from Ollama', summary2: 'Summary from ChatGPT' }));
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});


const PORT = 4000; 
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

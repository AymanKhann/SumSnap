const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const multer = require('multer');
const OpenAIApi = require('openai');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeWithOLLaMA(text) {
    try {
        const response = await axios.post('http://localhost:11434/generate', {
            model: 'openllama',
            prompt: text,
            max_tokens: 300,
        });
        return response.data;
    } catch (error) {
        console.error('OLLaMA summarization error:', error);
        throw error;
    }
}

// Endpoint to handle file uploads and summarization
app.post('/upload', upload.single('pdf'), async (req, res) => {
    const file = req.file;
    if (file) {
        try {          
            const pdfBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(pdfBuffer);
            const pdfText = pdfData.text;
           
            const gptSummaryResponse = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: `Summarize the following text: ${pdfText}`,
                max_tokens: 300,
            });
            const summary1 = gptSummaryResponse.data.choices[0].text.trim();
            
            const summary2 = await summarizeWithOLLaMA(pdfText);
            
            res.json({
                summary1,
                summary2,
            });
        } catch (error) {
            console.error('Summarization error:', error);
            res.status(500).json({ error: 'Summarization failed' });
        }
    } else {
        res.status(400).json({ error: 'File upload failed' });
    }
});

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.type === 'pdfText') {
            const pdfText = data.text;
            
            try {                
                const gptSummaryResponse = await openai.createCompletion({
                    model: 'text-davinci-003',
                    prompt: `Summarize the following text: ${pdfText}`,
                    max_tokens: 300,
                });
                const summary1 = gptSummaryResponse.data.choices[0].text.trim();
                               
                const summary2 = await summarizeWithOLLaMA(pdfText);
                               
                ws.send(JSON.stringify({
                    summary1,
                    summary2,
                }));
            } catch (error) {
                console.error('Summarization error:', error);
                ws.send(JSON.stringify({ error: 'Summarization failed' }));
            }
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

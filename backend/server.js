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

const openai = new OpenAIApi({ apiKey: 'your-api-key' });

async function summarizeWithOLLaMA(text) {
    try {
        const response = await axios.post('http://localhost:11434/generate', {
            model: 'llama2:latest',
            prompt: `Summarize the following text: ${text}`,
            max_tokens: 300,
        });
        return response.data;
    } catch (error) {
        console.error('OLLaMA summarization error:', error);
        throw error;
    }
}

// Endpoint to handle file uploads and summarization
// app.post('/upload', upload.single('pdf'), async (req, res) => {
//     const file = req.file;
//     if (!file) {
//         console.error('File upload failed');
//         return res.status(400).json({ error: 'File upload failed' });
//     }

//     try {
//         // Read and parse the PDF file
//         const pdfBuffer = fs.readFileSync(file.path);
//         const pdfData = await pdfParse(pdfBuffer);
//         const pdfText = pdfData.text;

//         // Initialize the response object
//         let response = {
//             summary1: null,
//             summary2: null,
//         };

//         // Attempt summarization with GPT-3.5
//         try {
//             const gptSummaryResponse = await openai.createCompletion({
//                 model: 'gpt-3.5-turbo',
//                 prompt: `Summarize the following text: ${pdfText}`,
//                 max_tokens: 300,
//             });
//             response.summary1 = gptSummaryResponse.data.choices[0].text.trim();
//         } catch (gptError) {
//             console.error('GPT-3.5 summarization error:', gptError);
//         }

//         // Attempt summarization with OLLaMA
//         try {
//             response.summary2 = await summarizeWithOLLaMA(pdfText);
//         } catch (ollamaError) {
//             console.error('OLLaMA summarization error:', ollamaError);
//         }

//         // Send the response object
//         res.json(response);
//     } catch (error) {
//         console.error('An unexpected error occurred:', error);
//         res.status(500).json({ error: 'An unexpected error occurred' });
//     }
// });

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.type === 'pdfText') {
            const pdfText = data.text;
            
            // Initialize the response object with null values
            let response = {
                summary1: null,
                summary2: null,
            };
            
            // Handle summarization with GPT-3.5
            try {
                const gptSummaryResponse = await openai.completions.create({
                    model: 'gpt-3.5-turbo',
                    prompt: `Summarize the following text: ${pdfText}`,
                    max_tokens: 300,
                });
                response.summary1 = gptSummaryResponse.data.choices[0].text.trim();
            } catch (gptError) {
                console.error('GPT-3.5 summarization error:', gptError);
            }
            
            // Handle summarization with OLLaMA
            try {
                response.summary2 = await summarizeWithOLLaMA(pdfText);
            } catch (ollamaError) {
                console.error('OLLaMA summarization error:', ollamaError);
            }
            
            // Send the response object
            ws.send(JSON.stringify(response));
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

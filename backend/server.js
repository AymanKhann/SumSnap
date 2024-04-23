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
const { RetrievalQA, OpenAIEmbeddings, LLMChain, PromptTemplate } = require('langchain');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI with your API key
const openAI = new OpenAIApi({ apiKey: 'your-api-key' });

// Define a PromptTemplate
const promptTemplate = new PromptTemplate(`
    Use the following context to answer the question:
    Context: {context}
    Question: {question}
`);

// Initialize the LLMChain with OpenAI and the prompt template
const llmChain = new LLMChain({
    llm: openAI,
    promptTemplate: promptTemplate,
});

// Define embeddings for document retrieval
const embeddings = new OpenAIEmbeddings({ apiKey: 'your-api-key' });

// Define the retriever
const retriever = new RetrievalQA({
    retriever: embeddings,
    documentStore: 'path-to-your-document-store',
});

async function summarizeWithOLLaMA(text) {
    try {
        // Make the POST request to the API
        const axiosResponse = await axios.post('http://127.0.0.1:11434/api/generate', {
            model: 'llama2:latest',
            prompt: `Summarize the following text: ${text}`,
            max_tokens: 300,
        });

  
        const rawData = axiosResponse.data;
        const responseLines = rawData.split('\n');

        let completeSummary = '';

        responseLines.forEach((line) => {
            try {
                
                const lineData = JSON.parse(line);
                completeSummary += lineData.response;
            } catch (parseError) {
                console.error('JSON parsing error for line:', line, parseError);
            }
        });

        return completeSummary;
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
            
            let response = {
                summary1: null,
                summary2: null,
            };
            
            // Use LangChain's RetrievalQA for GPT-3.5 summarization
            try {
                const context = await retriever.getRelevantDocuments(pdfText);
                const gptResponse = await llmChain.generate({
                    context: context.map(doc => doc.text).join('\n'),  // Join context texts
                    question: pdfText,
                });
                response.summary1 = gptResponse.text.trim();
            } catch (gptError) {
                console.error('GPT-3.5 summarization error:', gptError);
            }
            
            // Use OLLaMA summarization with existing function
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

# SumSnap

This repository contains a PDF Summarization Web Application that allows users to upload PDF files and receive real-time summaries of the content using two different language models: Ollama (https://github.com/ollama/ollama.git) and GPT-3.5. The application features a chatbot-style user interface and is built using React for the frontend and Node.js with Express for the backend.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Backend API Endpoints](#backend-api-endpoints)
- [Contributing](#contributing)

## Features

- **PDF File Upload**: Users can upload PDF files to the application.
- **Real-Time Summarization**: The application provides real-time summaries of the PDF content using Ollama and GPT-3.5 models.
- **Chatbot-Style User Interface**: The user interface is designed in a chatbot style, with display areas for summaries from both models.

## Technologies

- **Frontend**: React
- **Backend**: Node.js with Express
- **Language Models**: Ollama, GPT-3.5
- **WebSockets**: For real-time interactions
- **File Handling**: Multer (for file uploads)
- **PDF Text Extraction**: pdf-parse (for extracting text from PDF files)

## Setup and Installation

1. Clone this repository:

    ```shell
    git clone https://github.com/AymanKhann/SumSnap.git
    cd SumSnap
    ```

2. Set up the backend:

    - Navigate to the backend directory and install dependencies:
    
        ```shell
        cd backend
        npm install
        ```

    - Create a `.env` file with your OpenAI API key:

        ```shell
        echo "OPENAI_API_KEY=your-api-key" > .env
        ```

3. Set up the frontend:

    - Navigate to the frontend directory and install dependencies:
    
        ```shell
        cd frontend
        npm install
        ```

4. Start the backend server:

    - Navigate to the backend directory and start the server:
    
        ```shell
        cd backend
        node server.js
        ```

5. Start the frontend application:

    - Navigate to the frontend directory and start the React application:
    
        ```shell
        cd frontend
        npm start
        ```

## Usage

1. Once both the backend and frontend servers are running, open your browser and navigate to `http://localhost:3000`.

2. Upload a PDF file using the provided file upload feature.

3. The application will extract the text from the PDF file and summarize it using Ollama and GPT-3.5 models.

4. View the summaries in the respective display areas.

## Backend API Endpoints

- **POST `/upload`**: Endpoint to upload PDF files and receive the extracted text.

    - Request: Upload a PDF file using the `file` field.

    - Response: JSON object containing the extracted text:

        ```json
        {
            "text": "Extracted text from the PDF file."
        }
        ```

## Contributing

Contributions are welcome! Please fork the repository and open a pull request.


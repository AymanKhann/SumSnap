jest.setTimeout(15000);

const WebSocket = require('ws');

describe('WebSocket interaction', () => {
    let ws;

    beforeAll((done) => {
        // Create a WebSocket connection to the server
        ws = new WebSocket('ws://localhost:4000');

        ws.on('open', () => {
            done();
        });

        ws.on('error', (error) => {
            console.error('WebSocket connection error:', error);
            done.fail(error); // Notify Jest of the failure
        });
    });


    afterAll(() => {
        // Close the WebSocket connection
        ws.close();
    });

    it('should receive summaries when sending text', (done) => {
        // Handle the response
        ws.on('message', (data) => {
            const response = JSON.parse(data);
            expect(response).toHaveProperty('summary1');
            expect(response).toHaveProperty('summary2');
            done();
        });

        // Send a message containing PDF text
        ws.send(JSON.stringify({
            type: 'pdfText',
            text: 'Sample text to summarize',
        }));
    });

    it('should handle summarization errors', (done) => {
        ws.on('message', (data) => {
            const response = JSON.parse(data);
            expect(response).toHaveProperty('error');
            done();
        });

        // Send an invalid message to trigger error
        ws.send(JSON.stringify({
            type: 'invalidType',
            text: 'Sample text to summarize',
        }));
    });
});

// In utils.js or apiUtils.js
async function retryRequest(apiFunction, args, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await apiFunction(...args);
        } catch (error) {
            if (error.code === 'insufficient_quota' && i < retries - 1) {
                console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error;
            }
        }
    }
}

module.exports = { retryRequest };

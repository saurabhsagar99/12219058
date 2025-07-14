const fetch = require('node-fetch');
const path = require('path');

// Credentials for evaluation service
const EVAL_AUTH_URL = 'http://20.244.56.144/evaluation-service/auth';
const EVAL_LOG_URL = 'http://20.244.56.144/evaluation-service/logs';
const EVAL_CREDENTIALS = {
    email: 'saurabhsagar099@gmail.com',
    name: 'saurabh sagar',
    rollNo: '12219058',
    accessCode: 'CZypQK',
    clientID: '876b88b6-50aa-416a-be5b-8b3a4afcfe63',
    clientSecret: 'SfJFmchAhXbzUpfY'
};

let cachedToken = null;
let tokenExpiry = 0;

async function getAuthToken() {
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && tokenExpiry > now + 60) {
        return cachedToken;
    }
    const res = await fetch(EVAL_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(EVAL_CREDENTIALS)
    });
    if (!res.ok) {
        throw new Error('Failed to get auth token from evaluation service');
    }
    const data = await res.json();
    cachedToken = data['access_token'] || data['access token'];
    tokenExpiry = data['expires_in'] || (now + 3600);
    return cachedToken;
}

async function sendLog({ stack, level, pkg, message }) {
    try {
        const token = await getAuthToken();
        const res = await fetch(EVAL_LOG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                stack,
                level,
                package: pkg,
                message
            })
        });
        if (!res.ok) {
            // Optionally, log to file or fallback
            // console.error('Failed to send log to evaluation service');
        }
    } catch (err) {
        // Optionally, log to file or fallback
        // console.error('Logging middleware error:', err.message);
    }
}

// Reusable log function
function Log(stack, level, pkg, message) {
    sendLog({ stack, level, pkg, message });
}

// Express middleware
const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    Log('backend', 'info', 'middleware', `Incoming request: ${req.method} ${req.url}`);

    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        Log('backend', 'info', 'middleware', `Response sent: ${req.method} ${req.url} status=${res.statusCode} duration=${duration}ms`);
        originalEnd.call(this, chunk, encoding);
    };
    next();
};

module.exports = { loggingMiddleware, Log }; 
const fs = require('fs');
const path = require('path');

class CustomLogger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    writeLog(level, message, data = {}) {
        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        const logString = JSON.stringify(logEntry) + '\n';
        const logFile = path.join(this.logDir, `${level}.log`);

        fs.appendFileSync(logFile, logString);
    }

    info(message, data = {}) {
        this.writeLog('INFO', message, data);
    }

    error(message, data = {}) {
        this.writeLog('ERROR', message, data);
    }

    warn(message, data = {}) {
        this.writeLog('WARN', message, data);
    }

    debug(message, data = {}) {
        this.writeLog('DEBUG', message, data);
    }
}

const logger = new CustomLogger();

const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    
    // Log request details
    logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Override res.end to log response details
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        logger.info('Response sent', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length') || 0,
            timestamp: new Date().toISOString()
        });

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = { loggingMiddleware, logger }; 
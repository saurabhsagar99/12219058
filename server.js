const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { loggingMiddleware, logger } = require('./middleware/loggingMiddleware');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom logging middleware (MANDATORY as per requirements)
app.use(loggingMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
    logger.info('Health check requested');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'URL Shortener Microservice'
    });
});

// API routes
app.use('/', urlRoutes);

// 404 handler
app.use('*', (req, res) => {
    logger.warn('Route not found', { url: req.originalUrl });
    res.status(404).json({
        error: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error', { 
        error: error.message, 
        stack: error.stack,
        url: req.url,
        method: req.method
    });
    
    res.status(500).json({
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info('Server started successfully', { 
        port: PORT, 
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
    
    console.log(`🚀 URL Shortener Microservice running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base: http://localhost:${PORT}/shorturls`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app; 
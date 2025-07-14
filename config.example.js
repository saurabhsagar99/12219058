// Example configuration file
// Copy this to config.js and modify as needed

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    
    // Base URL for generated short links
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    
    // Rate Limiting
    rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX_REQUESTS || 100 // limit each IP to 100 requests per windowMs
    },
    
    // Default URL validity (in minutes)
    defaultValidity: 30,
    
    // Shortcode generation
    shortcode: {
        minLength: 3,
        maxLength: 10,
        autoGenerateLength: 6
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: './logs'
    }
}; 
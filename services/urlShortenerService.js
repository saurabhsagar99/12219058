const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const geoip = require('geoip-lite');
const UserAgent = require('user-agents');
const { logger } = require('../middleware/loggingMiddleware');

class UrlShortenerService {
    constructor() {
        this.urlDatabase = new Map();
        this.shortcodeDatabase = new Map();
        this.clickStats = new Map();
    }

    // Generate a unique shortcode
    generateShortcode() {
        let shortcode;
        do {
            // Generate 6-character alphanumeric shortcode
            shortcode = Math.random().toString(36).substring(2, 8);
        } while (this.shortcodeDatabase.has(shortcode));
        
        return shortcode;
    }

    // Validate custom shortcode
    validateShortcode(shortcode) {
        if (!shortcode) return { valid: false, error: 'Shortcode is required' };
        
        // Check if shortcode is alphanumeric and reasonable length
        if (!/^[a-zA-Z0-9]+$/.test(shortcode)) {
            return { valid: false, error: 'Shortcode must be alphanumeric' };
        }
        
        if (shortcode.length < 3 || shortcode.length > 10) {
            return { valid: false, error: 'Shortcode must be between 3 and 10 characters' };
        }
        
        // Check if shortcode already exists
        if (this.shortcodeDatabase.has(shortcode)) {
            return { valid: false, error: 'Shortcode already exists' };
        }
        
        return { valid: true };
    }

    // Validate URL format
    validateUrl(url) {
        try {
            new URL(url);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Invalid URL format' };
        }
    }

    // Create short URL
    createShortUrl(originalUrl, validity = 30, customShortcode = null) {
        logger.info('Creating short URL', { originalUrl, validity, customShortcode });

        // Validate URL
        const urlValidation = this.validateUrl(originalUrl);
        if (!urlValidation.valid) {
            logger.error('Invalid URL provided', { originalUrl, error: urlValidation.error });
            throw new Error(urlValidation.error);
        }

        // Handle custom shortcode
        let shortcode;
        if (customShortcode) {
            const shortcodeValidation = this.validateShortcode(customShortcode);
            if (!shortcodeValidation.valid) {
                logger.error('Invalid custom shortcode', { customShortcode, error: shortcodeValidation.error });
                throw new Error(shortcodeValidation.error);
            }
            shortcode = customShortcode;
        } else {
            shortcode = this.generateShortcode();
        }

        // Calculate expiry time
        const createdAt = moment();
        const expiryTime = createdAt.clone().add(validity, 'minutes');

        // Create URL entry
        const urlEntry = {
            id: uuidv4(),
            originalUrl,
            shortcode,
            createdAt: createdAt.toISOString(),
            expiryTime: expiryTime.toISOString(),
            validity,
            isActive: true
        };

        // Store in databases
        this.urlDatabase.set(shortcode, urlEntry);
        this.shortcodeDatabase.set(shortcode, true);
        this.clickStats.set(shortcode, {
            totalClicks: 0,
            clicks: []
        });

        logger.info('Short URL created successfully', { shortcode, originalUrl, expiryTime: expiryTime.toISOString() });

        return {
            shortLink: `${process.env.BASE_URL || 'http://localhost:3000'}/${shortcode}`,
            expiry: expiryTime.toISOString()
        };
    }

    // Get original URL by shortcode
    getOriginalUrl(shortcode) {
        logger.info('Retrieving original URL', { shortcode });

        const urlEntry = this.urlDatabase.get(shortcode);
        if (!urlEntry) {
            logger.error('Shortcode not found', { shortcode });
            throw new Error('Shortcode not found');
        }

        // Check if URL has expired
        if (moment().isAfter(urlEntry.expiryTime)) {
            logger.warn('URL has expired', { shortcode, expiryTime: urlEntry.expiryTime });
            throw new Error('URL has expired');
        }

        // Update click statistics
        this.updateClickStats(shortcode);

        logger.info('Original URL retrieved', { shortcode, originalUrl: urlEntry.originalUrl });
        return urlEntry.originalUrl;
    }

    // Update click statistics
    updateClickStats(shortcode) {
        const stats = this.clickStats.get(shortcode);
        if (stats) {
            const clickData = {
                timestamp: moment().toISOString(),
                referrer: 'direct', // In a real app, this would come from request headers
                location: this.getLocationFromIP('127.0.0.1') // In a real app, this would be the actual IP
            };
            
            stats.totalClicks++;
            stats.clicks.push(clickData);
            
            logger.info('Click statistics updated', { shortcode, totalClicks: stats.totalClicks });
        }
    }

    // Get location from IP (simplified)
    getLocationFromIP(ip) {
        try {
            const geo = geoip.lookup(ip);
            return geo ? `${geo.city}, ${geo.country}` : 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }

    // Get URL statistics
    getUrlStatistics(shortcode) {
        logger.info('Retrieving URL statistics', { shortcode });

        const urlEntry = this.urlDatabase.get(shortcode);
        if (!urlEntry) {
            logger.error('Shortcode not found for statistics', { shortcode });
            throw new Error('Shortcode not found');
        }

        const stats = this.clickStats.get(shortcode) || { totalClicks: 0, clicks: [] };

        const statistics = {
            shortcode,
            originalUrl: urlEntry.originalUrl,
            createdAt: urlEntry.createdAt,
            expiryTime: urlEntry.expiryTime,
            totalClicks: stats.totalClicks,
            clicks: stats.clicks.map(click => ({
                timestamp: click.timestamp,
                referrer: click.referrer,
                location: click.location
            }))
        };

        logger.info('URL statistics retrieved', { shortcode, totalClicks: stats.totalClicks });
        return statistics;
    }

    // Clean up expired URLs (utility method)
    cleanupExpiredUrls() {
        const now = moment();
        let cleanedCount = 0;

        for (const [shortcode, urlEntry] of this.urlDatabase.entries()) {
            if (now.isAfter(urlEntry.expiryTime)) {
                this.urlDatabase.delete(shortcode);
                this.shortcodeDatabase.delete(shortcode);
                this.clickStats.delete(shortcode);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.info('Cleaned up expired URLs', { cleanedCount });
        }
    }
}

module.exports = UrlShortenerService; 
const express = require('express');
const UrlShortenerService = require('../services/urlShortenerService');
const { logger } = require('../middleware/loggingMiddleware');

const router = express.Router();
const urlService = new UrlShortenerService();

// POST /shorturls - Create short URL
router.post('/shorturls', (req, res) => {
    try {
        const { url, validity = 30, shortcode } = req.body;

        logger.info('Received create short URL request', { url, validity, shortcode });

        // Validate required fields
        if (!url) {
            logger.error('Missing required field: url');
            return res.status(400).json({
                error: 'Missing required field: url'
            });
        }

        // Validate validity is a positive integer
        if (validity && (!Number.isInteger(validity) || validity <= 0)) {
            logger.error('Invalid validity period', { validity });
            return res.status(400).json({
                error: 'Validity must be a positive integer'
            });
        }

        // Create short URL
        const result = urlService.createShortUrl(url, validity, shortcode);

        logger.info('Short URL created successfully', { shortLink: result.shortLink });

        res.status(201).json(result);

    } catch (error) {
        logger.error('Error creating short URL', { error: error.message });
        res.status(400).json({
            error: error.message
        });
    }
});

// GET /shorturls/:shortcode - Get URL statistics
router.get('/shorturls/:shortcode', (req, res) => {
    try {
        const { shortcode } = req.params;

        logger.info('Received statistics request', { shortcode });

        if (!shortcode) {
            logger.error('Missing shortcode parameter');
            return res.status(400).json({
                error: 'Missing shortcode parameter'
            });
        }

        const statistics = urlService.getUrlStatistics(shortcode);

        logger.info('Statistics retrieved successfully', { shortcode });

        res.status(200).json(statistics);

    } catch (error) {
        logger.error('Error retrieving statistics', { error: error.message });
        res.status(404).json({
            error: error.message
        });
    }
});

// GET /:shortcode - Redirect to original URL
router.get('/:shortcode', (req, res) => {
    try {
        const { shortcode } = req.params;

        logger.info('Received redirect request', { shortcode });

        if (!shortcode) {
            logger.error('Missing shortcode parameter');
            return res.status(400).json({
                error: 'Missing shortcode parameter'
            });
        }

        const originalUrl = urlService.getOriginalUrl(shortcode);

        logger.info('Redirecting to original URL', { shortcode, originalUrl });

        res.redirect(originalUrl);

    } catch (error) {
        logger.error('Error during redirect', { error: error.message });
        res.status(404).json({
            error: error.message
        });
    }
});

module.exports = router; 
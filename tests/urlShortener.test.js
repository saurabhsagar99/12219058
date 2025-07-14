const request = require('supertest');
const app = require('../server');

describe('URL Shortener API', () => {
    describe('POST /shorturls', () => {
        it('should create a short URL with auto-generated shortcode', async () => {
            const response = await request(app)
                .post('/shorturls')
                .send({
                    url: 'https://www.google.com',
                    validity: 30
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('shortLink');
            expect(response.body).toHaveProperty('expiry');
            expect(response.body.shortLink).toMatch(/^http:\/\/localhost:3000\/[a-zA-Z0-9]+$/);
        });

        it('should create a short URL with custom shortcode', async () => {
            const response = await request(app)
                .post('/shorturls')
                .send({
                    url: 'https://www.example.com',
                    validity: 60,
                    shortcode: 'test123'
                });

            expect(response.status).toBe(201);
            expect(response.body.shortLink).toBe('http://localhost:3000/test123');
        });

        it('should return 400 for invalid URL', async () => {
            const response = await request(app)
                .post('/shorturls')
                .send({
                    url: 'invalid-url',
                    validity: 30
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for missing URL', async () => {
            const response = await request(app)
                .post('/shorturls')
                .send({
                    validity: 30
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Missing required field: url');
        });
    });

    describe('GET /shorturls/:shortcode', () => {
        it('should return statistics for existing shortcode', async () => {
            // First create a short URL
            const createResponse = await request(app)
                .post('/shorturls')
                .send({
                    url: 'https://www.test.com',
                    shortcode: 'stats123'
                });

            // Then get statistics
            const statsResponse = await request(app)
                .get('/shorturls/stats123');

            expect(statsResponse.status).toBe(200);
            expect(statsResponse.body).toHaveProperty('shortcode', 'stats123');
            expect(statsResponse.body).toHaveProperty('originalUrl', 'https://www.test.com');
            expect(statsResponse.body).toHaveProperty('totalClicks');
            expect(statsResponse.body).toHaveProperty('clicks');
        });

        it('should return 404 for non-existent shortcode', async () => {
            const response = await request(app)
                .get('/shorturls/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /:shortcode', () => {
        it('should redirect to original URL', async () => {
            // First create a short URL
            await request(app)
                .post('/shorturls')
                .send({
                    url: 'https://www.redirect-test.com',
                    shortcode: 'redirect123'
                });

            // Then test redirect
            const response = await request(app)
                .get('/redirect123')
                .expect(302);

            expect(response.headers.location).toBe('https://www.redirect-test.com');
        });

        it('should return 404 for non-existent shortcode', async () => {
            const response = await request(app)
                .get('/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('service', 'URL Shortener Microservice');
        });
    });
}); 
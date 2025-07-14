# URL Shortener Microservice

A robust HTTP URL Shortener Microservice built with Express.js that provides core URL shortening functionality along with basic analytical capabilities for shortened links.

## Features

- ✅ **Custom Logging Middleware**: Extensive logging using custom middleware (no built-in loggers)
- ✅ **URL Shortening**: Create short URLs with custom or auto-generated shortcodes
- ✅ **Analytics**: Track click statistics with geographical and referrer data
- ✅ **Expiration**: Automatic URL expiration with configurable validity periods
- ✅ **Unique Shortcodes**: Globally unique shortcodes with collision detection
- ✅ **Error Handling**: Robust error handling with appropriate HTTP status codes
- ✅ **Security**: Rate limiting, CORS, and security headers
- ✅ **Health Monitoring**: Built-in health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medico-assignment
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Create Short URL
**POST** `/shorturls`

Creates a new shortened URL.

**Request Body:**
```json
{
  "url": "https://very-very-very-long-and-descriptive-subdomain-that-goes-on-and-on.somedomain.com/additional/directory/levels/for/more/length/really-long-sub-domain/a-really-long-page",
  "validity": 30,
  "shortcode": "abcd1"
}
```

**Parameters:**
- `url` (string, required): The original long URL to be shortened
- `validity` (integer, optional): Duration in minutes (defaults to 30)
- `shortcode` (string, optional): Custom shortcode (auto-generated if not provided)

**Response (201 Created):**
```json
{
  "shortLink": "http://localhost:3000/abcd1",
  "expiry": "2024-01-01T12:30:00.000Z"
}
```

### 2. Get URL Statistics
**GET** `/shorturls/:shortcode`

Retrieves usage statistics for a specific shortened URL.

**Response (200 OK):**
```json
{
  "shortcode": "abcd1",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "expiryTime": "2024-01-01T12:30:00.000Z",
  "totalClicks": 5,
  "clicks": [
    {
      "timestamp": "2024-01-01T12:05:00.000Z",
      "referrer": "direct",
      "location": "New York, US"
    }
  ]
}
```

### 3. Redirect to Original URL
**GET** `/:shortcode`

Redirects to the original URL when a shortcode is accessed.

**Response:** HTTP 302 redirect to the original URL

### 4. Health Check
**GET** `/health`

Returns service health status.

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "URL Shortener Microservice"
}
```

## Usage Examples

### Using cURL

1. **Create a short URL:**
```bash
curl -X POST http://localhost:3000/shorturls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com",
    "validity": 60,
    "shortcode": "google"
  }'
```

2. **Get statistics:**
```bash
curl http://localhost:3000/shorturls/google
```

3. **Access short URL (redirects to original):**
```bash
curl -L http://localhost:3000/google
```

### Using JavaScript/Fetch

```javascript
// Create short URL
const response = await fetch('http://localhost:3000/shorturls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://www.example.com',
    validity: 30,
    shortcode: 'example'
  })
});

const result = await response.json();
console.log(result.shortLink);

// Get statistics
const stats = await fetch('http://localhost:3000/shorturls/example');
const statistics = await stats.json();
console.log(statistics.totalClicks);
```

## Error Handling

The API returns appropriate HTTP status codes and descriptive error messages:

- **400 Bad Request**: Invalid input (malformed URL, invalid shortcode, etc.)
- **404 Not Found**: Shortcode doesn't exist or URL has expired
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors

## Logging

The service uses a custom logging middleware that logs all requests and responses to separate log files in the `logs/` directory:

- `INFO.log`: General information and successful operations
- `ERROR.log`: Error messages and exceptions
- `WARN.log`: Warning messages
- `DEBUG.log`: Debug information

## Project Structure

```
medico-assignment/
├── middleware/
│   └── loggingMiddleware.js    # Custom logging middleware
├── routes/
│   └── urlRoutes.js           # API route handlers
├── services/
│   └── urlShortenerService.js # Core business logic
├── logs/                      # Log files (created automatically)
├── server.js                  # Main application file
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Configuration

The service can be configured using environment variables:

- `PORT`: Server port (default: 3000)
- `BASE_URL`: Base URL for generated short links (default: http://localhost:3000)
- `NODE_ENV`: Environment (development/production)

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-origin resource sharing enabled
- **Helmet**: Security headers for protection against common vulnerabilities
- **Input Validation**: Comprehensive validation of all inputs
- **Error Sanitization**: Errors are logged but not exposed to clients

## Testing

Run tests with:
```bash
npm test
```

## License

MIT License 
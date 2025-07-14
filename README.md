# URL Shortener Microservice

A robust HTTP URL Shortener Microservice built with Express.js that provides core URL shortening functionality, analytics, and remote logging integration with the evaluation service.

---

## Features
- **Custom Logging Middleware**: All logs are sent to the evaluation service's `/logs` endpoint using your credentials and token.
- **URL Shortening**: Create short URLs with custom or auto-generated shortcodes.
- **Analytics**: Track click statistics with geographical and referrer data.
- **Expiration**: Automatic URL expiration with configurable validity periods.
- **Unique Shortcodes**: Globally unique shortcodes with collision detection.
- **Error Handling**: Robust error handling with appropriate HTTP status codes.
- **Security**: Rate limiting, CORS, and security headers.
- **Health Monitoring**: Built-in health check endpoint.

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd medico-assignment
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
   Or use the setup script:
   ```bash
   npm run setup
   ```

---

## API Endpoints

### 1. Health Check
- **GET** `/health`
- **Response:**
  ```json
  { "status": "OK", "timestamp": "...", "service": "URL Shortener Microservice" }
  ```
- **Screenshot:**
  ![Health Check](./screenshots/health-check.png)

### 2. Create Short URL
- **POST** `/shorturls`
- **Body Example:**
  ```json
  {
    "url": "https://www.google.com",
    "validity": 30,
    "shortcode": "goog"
  }
  ```
- **Response:**
  ```json
  { "shortLink": "http://localhost:3000/goog", "expiry": "..." }
  ```
- **Screenshot:**
  ![Create Short URL](./screenshots/create-shorturl.png)

### 3. Redirect to Original URL
- **GET** `/:shortcode` (e.g., `/goog`)
- **Behavior:** Redirects to the original URL.
- **Screenshot:**
  ![Redirect Output](./screenshots/redirect.png)

### 4. Get URL Statistics
- **GET** `/shorturls/:shortcode`
- **Response:**
  ```json
  {
    "shortcode": "goog",
    "originalUrl": "https://www.google.com",
    "createdAt": "...",
    "expiryTime": "...",
    "totalClicks": 3,
    "clicks": [
      { "timestamp": "...", "referrer": "direct", "location": "Unknown" }
    ]
  }
  ```
- **Screenshot:**
  ![Stats Output](./screenshots/stats.png)

---

## Logging Middleware Integration

### How Logging Works
- Every significant event (request, response, error, etc.) is logged using a custom middleware.
- Logs are sent to the evaluation service's `/logs` endpoint using your credentials and a Bearer token.
- The middleware automatically fetches and refreshes the token as needed.
- Log format matches the required structure:
  ```json
  {
    "stack": "backend",
    "level": "info",
    "package": "middleware",
    "message": "Incoming request: POST /shorturls"
  }
  ```

### Example Log Event
- When a request is received:
  ```json
  {
    "stack": "backend",
    "level": "info",
    "package": "middleware",
    "message": "Incoming request: POST /shorturls"
  }
  ```
- When a response is sent:
  ```json
  {
    "stack": "backend",
    "level": "info",
    "package": "middleware",
    "message": "Response sent: POST /shorturls status=201 duration=12ms"
  }
  ```

### Custom Logging
You can log custom events in your code:
```js
const { Log } = require('./middleware/loggingMiddleware');
Log('backend', 'info', 'service', 'Short URL created successfully');
```

---

## Testing
To run the automated tests:
```bash
npm test
```

---

## Project Structure
```
medico-assignment/
├── middleware/loggingMiddleware.js    # Custom logging (sends to evaluation service)
├── routes/urlRoutes.js               # API endpoints
├── services/urlShortenerService.js   # Core business logic
├── tests/urlShortener.test.js        # Test suite
├── examples/api-example.js           # Usage examples
├── server.js                         # Main application
├── package.json                      # Dependencies
├── README.md                         # Documentation
└── screenshots/                      # Place your screenshots here
```

---

## Screenshots
> **Note:** Replace the placeholder images in the `./screenshots/` folder with your own screenshots:
> - `health-check.png`: Health check endpoint output
> - `create-shorturl.png`: Short URL creation response
> - `redirect.png`: Browser redirect (can be a browser screenshot showing the redirect)
> - `stats.png`: Statistics endpoint output

---

## License
MIT License 
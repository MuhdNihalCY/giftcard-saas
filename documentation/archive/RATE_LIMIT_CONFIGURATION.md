# Rate Limit Configuration

## Overview

The application uses rate limiting to prevent abuse and protect the API from excessive requests. Rate limits have been increased to accommodate normal usage patterns.

## Current Rate Limits

### General API Rate Limiter
- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 5,000 requests per window
- **Per Minute**: ~333 requests/minute
- **Applies to**: All API routes under `/api/v1/*`

### Authentication Rate Limiter
- **Window**: 15 minutes
- **Max Requests**: 200 authentication attempts per 15 minutes
- **Applies to**: All routes under `/api/v1/auth/*`

### Payment Rate Limiter
- **Window**: 1 minute
- **Max Requests**: 100 payment requests per minute
- **Applies to**: Payment processing routes

## Configuration

### Environment Variables

You can configure rate limits via environment variables in `backend/.env`:

```env
# Rate Limiting (in milliseconds)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Maximum requests per window
RATE_LIMIT_MAX_REQUESTS=5000  # 5000 requests per 15 minutes
```

### Default Values

If not set in `.env`, defaults are:
- `RATE_LIMIT_WINDOW_MS`: 900000 (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: 1000 (but middleware enforces minimum of 5000)

## How to Increase Limits

### Option 1: Environment Variables (Recommended)

Add to `backend/.env`:

```env
# Increase to 10,000 requests per 15 minutes
RATE_LIMIT_MAX_REQUESTS=10000

# Or increase window to 30 minutes
RATE_LIMIT_WINDOW_MS=1800000
```

### Option 2: Modify Code

Edit `backend/src/middleware/rateLimit.middleware.ts`:

```typescript
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(env.RATE_LIMIT_MAX_REQUESTS, 10000), // Increase minimum
  // ...
});
```

### Option 3: Disable for Development

For development, you can temporarily disable rate limiting:

```typescript
export const apiRateLimiter = rateLimit({
  // ...
  skip: () => env.NODE_ENV === 'development', // Skip in development
});
```

## Rate Limit Headers

The API returns rate limit information in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Error Response

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests from this IP, please try again later."
  }
}
```

HTTP Status: `429 Too Many Requests`

## Best Practices

1. **Development**: Use higher limits or disable rate limiting
2. **Production**: Keep reasonable limits to prevent abuse
3. **Monitoring**: Monitor rate limit hits to adjust limits
4. **User Experience**: Provide clear error messages with retry information

## Troubleshooting

### Getting Rate Limited Frequently

1. **Check Current Limits**: Look at response headers `X-RateLimit-Limit`
2. **Increase Limits**: Update `RATE_LIMIT_MAX_REQUESTS` in `.env`
3. **Check for Loops**: Ensure frontend isn't making excessive requests
4. **Clear Rate Limit Store**: If using Redis, clear rate limit keys

### For Development

Add to `backend/.env`:

```env
# Very high limits for development
RATE_LIMIT_MAX_REQUESTS=50000
RATE_LIMIT_WINDOW_MS=900000
```

### For Production

Recommended production limits:

```env
# Production limits
RATE_LIMIT_MAX_REQUESTS=10000  # 10,000 requests per 15 minutes
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
```

This allows:
- ~667 requests per minute
- ~11 requests per second
- Reasonable for most applications

## Summary

✅ **Increased**: Default API rate limit from 100 to 5000 requests per 15 minutes
✅ **Increased**: Auth rate limit from 100 to 200 attempts per 15 minutes  
✅ **Increased**: Payment rate limit from 50 to 100 requests per minute
✅ **Configurable**: All limits can be adjusted via environment variables



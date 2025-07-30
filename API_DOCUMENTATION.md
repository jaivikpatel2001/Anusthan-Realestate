# Real Estate API Documentation

## Overview

The Real Estate API is a comprehensive RESTful API built with Node.js, Express, and MongoDB. It provides endpoints for managing real estate projects, apartments, leads, user authentication, and site settings.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication via Bearer token.

### Authentication Flow

1. **Login**: POST `/auth/login` with email and password
2. **Receive Tokens**: Get access token (expires in 7 days) and refresh token (expires in 30 days)
3. **Use Access Token**: Include in Authorization header: `Bearer <access_token>`
4. **Refresh Token**: Use refresh token to get new access token when expired

### Headers

```http
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP
- **Headers**: Rate limit info included in response headers

## Response Format

All API responses follow this structure:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "error": "Error message (if success is false)"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@realstate.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@realstate.com",
      "role": "admin"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

#### GET /auth/me
Get current user profile (requires authentication).

#### PUT /auth/profile
Update user profile (requires authentication).

#### PUT /auth/change-password
Change user password (requires authentication).

#### POST /auth/logout
Logout and invalidate refresh token (requires authentication).

### Projects

#### GET /projects
Get all projects with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (upcoming, ongoing, completed)
- `category` (string): Filter by category (residential, commercial, mixed)
- `location` (string): Filter by location (partial match)
- `minPrice` (number): Minimum starting price
- `maxPrice` (number): Maximum starting price
- `search` (string): Text search in title, description, location
- `sort` (string): Sort field (prefix with - for descending)
- `featured` (boolean): Filter featured projects

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProjects": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET /projects/:identifier
Get single project by ID or slug.

#### POST /projects (Admin Only)
Create new project.

**Request Body:**
```json
{
  "title": "Luxury Apartments Downtown",
  "description": "Premium residential project...",
  "location": "Downtown, Mumbai",
  "status": "ongoing",
  "category": "residential",
  "startingPrice": 50000000,
  "totalUnits": 200,
  "amenities": [
    {
      "name": "Swimming Pool",
      "icon": "pool",
      "description": "Olympic size swimming pool"
    }
  ],
  "isFeatured": true
}
```

#### PUT /projects/:id (Admin Only)
Update existing project.

#### DELETE /projects/:id (Admin Only)
Soft delete project.

#### PATCH /projects/:id/featured (Admin Only)
Toggle project featured status.

#### GET /projects/admin/stats/overview (Admin Only)
Get project statistics and analytics.

### Apartments

#### GET /apartments
Get all apartments with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `projectId`: Filter by project
- `type`: Filter by apartment type
- `bedrooms`, `bathrooms`: Filter by room count
- `minPrice`, `maxPrice`: Price range filter
- `available`: Filter by availability

#### GET /apartments/project/:projectId
Get apartments for specific project.

#### POST /apartments (Admin Only)
Create new apartment configuration.

**Request Body:**
```json
{
  "projectId": "project_id",
  "type": "2BHK",
  "name": "Premium 2BHK",
  "bedrooms": 2,
  "bathrooms": 2,
  "area": {
    "builtUp": 1200,
    "carpet": 900,
    "unit": "sqft"
  },
  "price": {
    "base": 8500000,
    "maintenance": 2500
  },
  "availability": {
    "totalUnits": 20,
    "availableUnits": 18
  }
}
```

#### PATCH /apartments/:id/book (Admin Only)
Book apartment units.

#### PATCH /apartments/:id/release (Admin Only)
Release apartment units.

### Leads

#### POST /leads (Public)
Create new lead from public forms.

**Request Body:**
```json
{
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "projectId": "project_id",
  "leadType": "contact_inquiry",
  "source": "website"
}
```

#### POST /leads/brochure-download (Public)
Download brochure and create lead.

#### GET /leads (Admin Only)
Get all leads with filtering and pagination.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by lead status
- `priority`: Filter by priority
- `source`: Filter by lead source
- `assignedTo`: Filter by assigned user
- `dateFrom`, `dateTo`: Date range filter
- `search`: Search in name, mobile, email

#### PATCH /leads/:id/status (Admin Only)
Update lead status.

#### POST /leads/:id/contact (Admin Only)
Add contact history to lead.

#### POST /leads/:id/notes (Admin Only)
Add note to lead.

#### PATCH /leads/:id/follow-up (Admin Only)
Schedule follow-up for lead.

#### GET /leads/stats (Admin Only)
Get lead statistics and analytics.

#### GET /leads/export (Admin Only)
Export leads to CSV.

### Settings

#### GET /settings (Public)
Get public site settings (company info, contact details).

#### GET /settings/admin (Admin Only)
Get all site settings including sensitive data.

#### PUT /settings/company (Admin Only)
Update company information.

#### PUT /settings/contact (Admin Only)
Update contact information.

#### PUT /settings/social-media (Admin Only)
Update social media links.

#### PUT /settings/seo (Admin Only)
Update SEO settings.

### File Upload

#### POST /upload/site-images (Admin Only)
Upload site images (logo, favicon).

**Request:** Multipart form data with `image` field.

#### POST /upload/project-images (Admin Only)
Upload project images.

**Request:** Multipart form data with `images` field (multiple files).

#### POST /upload/floor-plans (Admin Only)
Upload floor plan images.

#### POST /upload/brochures (Admin Only)
Upload project brochures (PDF).

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Detailed validation error message"
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided"
}
```

### Rate Limit Errors
```json
{
  "success": false,
  "message": "Too many requests",
  "error": "Rate limit exceeded. Try again later."
}
```

## Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realstate
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ADMIN_EMAIL=admin@realstate.com
ADMIN_PASSWORD=admin123
```

Optional (for enhanced features):
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Postman Collection

Import the provided `Real_Estate_API.postman_collection.json` file into Postman for easy API testing.

### Environment Setup in Postman

1. Create new environment
2. Add variables:
   - `BASE_URL`: `http://localhost:5000/api`
   - `ACCESS_TOKEN`: (will be set after login)
   - `REFRESH_TOKEN`: (will be set after login)

### Auto-token Management

Add this script to the login request's "Tests" tab:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("ACCESS_TOKEN", response.data.token);
    pm.environment.set("REFRESH_TOKEN", response.data.refreshToken);
}
```

## Testing

### Manual Testing
1. Import Postman collection
2. Set up environment variables
3. Login to get tokens
4. Test various endpoints

### Automated Testing
Run the test suite:
```bash
npm test
```

## Support

For API support or questions, contact the development team or refer to the project documentation.

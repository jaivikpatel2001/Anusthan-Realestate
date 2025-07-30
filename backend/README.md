# Real Estate Backend API

A comprehensive Node.js backend API for real estate management system with authentication, project management, lead tracking, and file upload capabilities.

## 🚀 Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (Admin/User)
- **Project Management** with CRUD operations
- **Apartment Configuration** management
- **Lead Management System** with contact history
- **File Upload** with Cloudinary integration
- **Site Settings** management
- **Rate Limiting** and security middleware
- **MongoDB** with Mongoose ODM
- **Comprehensive API Documentation**

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Custom middleware
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realstate/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/realstate

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-in-production
   JWT_REFRESH_EXPIRE=30d

   # Admin Configuration
   ADMIN_EMAIL=admin@realstate.com
   ADMIN_PASSWORD=admin123

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/webp
   ALLOWED_DOCUMENT_TYPES=application/pdf

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Cloudinary Configuration (Optional)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── models/              # Mongoose models
│   ├── User.js         # User model with authentication
│   ├── Project.js      # Project model
│   ├── Apartment.js    # Apartment configuration model
│   ├── Lead.js         # Lead management model
│   └── SiteSettings.js # Site settings model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── projects.js     # Project management routes
│   ├── apartments.js   # Apartment routes
│   ├── leads.js        # Lead management routes
│   ├── settings.js     # Site settings routes
│   └── upload.js       # File upload routes
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── validation.js   # Request validation middleware
│   └── upload.js       # File upload middleware
├── utils/              # Utility functions
│   ├── initializeDirectories.js  # Directory setup
│   └── initializeAdmin.js        # Admin user setup
├── uploads/            # Local file storage (auto-created)
│   ├── siteImages/
│   ├── projectImages/
│   ├── floorPlans/
│   └── brochures/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
└── .env               # Environment variables
```

## 🔐 Authentication

The API uses JWT-based authentication with the following flow:

1. **Login**: POST `/api/auth/login`
2. **Get Tokens**: Receive access token (7 days) and refresh token (30 days)
3. **Protected Routes**: Include `Authorization: Bearer <token>` header
4. **Token Refresh**: Use refresh token to get new access token
5. **Logout**: POST `/api/auth/logout` to invalidate refresh token

### Default Admin Account

On first startup, a default admin account is created:
- **Email**: `admin@realstate.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## 📊 Database Models

### User Model
- Authentication and authorization
- Role-based access (admin/user)
- Profile management

### Project Model
- Complete project information
- Images and media management
- SEO optimization
- Status tracking (upcoming/ongoing/completed)

### Apartment Model
- Apartment configurations
- Pricing and availability
- Floor plans and specifications

### Lead Model
- Customer inquiry management
- Contact history tracking
- Follow-up scheduling
- Status management

### SiteSettings Model
- Company information
- Contact details
- Social media links
- SEO settings
- Theme configuration

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Request validation middleware
- **File Upload Security**: Type and size validation

## 📤 File Upload

Supports dual upload strategy:
- **Primary**: Cloudinary (cloud storage)
- **Fallback**: Local storage

### Supported File Types
- **Images**: JPEG, JPG, PNG, WebP
- **Documents**: PDF
- **Max Size**: 10MB per file

### Upload Endpoints
- `POST /api/upload/site-images` - Logo, favicon
- `POST /api/upload/project-images` - Project galleries
- `POST /api/upload/floor-plans` - Floor plan images
- `POST /api/upload/brochures` - PDF brochures

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register user (Admin only)
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - Get all projects (with filtering)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)
- `PATCH /api/projects/:id/featured` - Toggle featured (Admin)

### Apartments
- `GET /api/apartments` - Get apartments (with filtering)
- `GET /api/apartments/project/:projectId` - Get project apartments
- `POST /api/apartments` - Create apartment (Admin)
- `PUT /api/apartments/:id` - Update apartment (Admin)
- `PATCH /api/apartments/:id/book` - Book units (Admin)

### Leads
- `POST /api/leads` - Create lead (Public)
- `POST /api/leads/brochure-download` - Download brochure (Public)
- `GET /api/leads` - Get leads (Admin)
- `PATCH /api/leads/:id/status` - Update status (Admin)
- `POST /api/leads/:id/contact` - Add contact history (Admin)

### Settings
- `GET /api/settings` - Get public settings
- `GET /api/settings/admin` - Get all settings (Admin)
- `PUT /api/settings/company` - Update company info (Admin)
- `PUT /api/settings/contact` - Update contact info (Admin)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Monitoring

### Health Check
```bash
GET /api/health
```

### Logs
Application logs are written to console in development mode.

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB Atlas or production database
4. Set up Cloudinary for file storage
5. Configure proper CORS origins

### PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "realstate-api"
pm2 startup
pm2 save
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify MONGODB_URI in .env
   - Check network connectivity

2. **File Upload Issues**
   - Verify upload directories exist
   - Check file size limits
   - Validate Cloudinary credentials

3. **Authentication Issues**
   - Verify JWT secrets are set
   - Check token expiration
   - Validate user permissions

### Debug Mode
```bash
DEBUG=* npm run dev
```

## 📝 API Documentation

- **Postman Collection**: Import `Real_Estate_API.postman_collection.json`
- **API Docs**: See `API_DOCUMENTATION.md`
- **Interactive Testing**: Use Postman or similar tools

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

# Real Estate Website - Complete MERN Stack Application

A comprehensive real estate management system with modern React frontend and robust Node.js backend API. Features dynamic content management, project showcasing, lead generation, and admin panel.

## 🌟 Project Overview

This is a full-stack real estate website that provides:
- **Public Website**: Project listings, brochure downloads, contact forms
- **Admin Panel**: Project management, lead tracking, content management
- **API Backend**: RESTful API with authentication and file upload
- **Dynamic Content**: All content managed through backend settings

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realstate
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   # In a new terminal, from project root
   npm install
   cp .env.example .env
   # Update .env with API URL
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Admin Login: admin@realstate.com / admin123

## 🏗️ Architecture

### Frontend (React + Redux)
- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: CSS3 with custom properties
- **Animations**: Framer Motion
- **Dynamic Content**: All content fetched from API

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, Rate limiting

## 📁 Project Structure

```
realstate/
├── backend/                 # Node.js API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── uploads/            # File storage
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── store/              # Redux store & API
│   ├── hooks/              # Custom hooks
│   └── styles/             # CSS stylesheets
├── public/                 # Static assets
└── docs/                   # Documentation
```

## ✨ Key Features

### 🏠 Project Management
- Complete CRUD operations for projects
- Image galleries and floor plans
- Apartment configurations
- Status tracking (upcoming/ongoing/completed)
- Featured project highlighting

### 👥 Lead Management
- Contact form submissions
- Brochure download tracking
- Lead status management
- Contact history and notes
- Follow-up scheduling
- CSV export functionality

### ⚙️ Dynamic Settings
- Company information management
- Contact details and social media
- SEO metadata configuration
- Theme customization
- Business hours management

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control
- Rate limiting and security headers
- File upload validation
- CORS protection

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Progressive enhancement
- Cross-browser compatibility

## 🛠️ Tech Stack

### Frontend
- React 18, Redux Toolkit, RTK Query
- Framer Motion, React Router DOM
- React Icons, React Toastify
- CSS3 with custom properties

### Backend
- Node.js, Express.js, MongoDB
- Mongoose ODM, JWT authentication
- Multer, Cloudinary, bcrypt
- Helmet, CORS, Rate limiting

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/profile` - Update profile

### Project Endpoints
- `GET /api/projects` - Get projects (with filtering)
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Lead Endpoints
- `POST /api/leads` - Create lead (Public)
- `POST /api/leads/brochure-download` - Download brochure
- `GET /api/leads` - Get leads (Admin)
- `PATCH /api/leads/:id/status` - Update status (Admin)

### Settings Endpoints
- `GET /api/settings` - Get public settings
- `PUT /api/settings/company` - Update company info (Admin)
- `PUT /api/settings/contact` - Update contact info (Admin)

**Complete API Documentation**: See `API_DOCUMENTATION.md`
**Postman Collection**: Import `Real_Estate_API.postman_collection.json`

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use MongoDB Atlas for database
3. Configure Cloudinary for file storage
4. Deploy to Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Netlify, Vercel, or any static hosting
3. Configure environment variables
4. Set up custom domain (optional)

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Your Company Name
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm run test
```

### API Testing
- Import Postman collection
- Use provided environment variables
- Test all endpoints with sample data

## 📈 Performance Features

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Lazy loading and compression
- **Caching**: API response caching with RTK Query
- **SEO**: Dynamic meta tags and structured data
- **PWA Ready**: Service worker support

## 🔧 Development Tools

- **Vite**: Fast development server
- **Redux DevTools**: State debugging
- **ESLint & Prettier**: Code formatting
- **Hot Module Replacement**: Instant updates

## 📚 Documentation

- **Backend README**: `backend/README.md`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Postman Collection**: `Real_Estate_API.postman_collection.json`
- **Frontend Components**: Documented in code

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code style guidelines

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ using React, Node.js, and MongoDB**

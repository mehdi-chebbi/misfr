# Authentication Setup Instructions

## 🚀 Quick Start

### 1. Start PostgreSQL Database
```bash
docker run --name misbar-postgres \
  -e POSTGRES_DB=misbar_africa \
  -e POSTGRES_USER=misbar_user \
  -e POSTGRES_PASSWORD=misbar_password \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Start Authentication Backend
```bash
cd backend
npm install
npm start
```
The auth server will run on `http://localhost:5001`

### 3. Start Frontend
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`

## 🔐 Default Admin Account

**Email:** admin@misbar.africa  
**Password:** admin123

## 📋 Features Implemented

### Authentication System
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ Session management with HTTP-only cookies

### User Management
- ✅ Users table with fields: name, last_name, email, password, institution, phone_number
- ✅ Admin CRUD operations on users
- ✅ User profile management
- ✅ Login logs tracking

### Frontend Pages
- ✅ `/auth` - Login/Register page
- ✅ `/profile` - User profile management
- ✅ `/admin` - Admin dashboard with user management and login logs
- ✅ Updated navbar with authentication UI

### Admin Features
- ✅ View all users
- ✅ Edit user information
- ✅ Delete users (except self)
- ✅ View login logs (last 100 entries)
- ✅ Change user roles

### User Features
- ✅ Update personal information
- ✅ View profile with role display
- ✅ Access all platform features (no additional advantages yet)

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  phone_number VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Login Logs Table
```sql
CREATE TABLE login_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### User Management
- `PUT /api/user/profile` - Update own profile
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id` - Update user (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)
- `GET /api/admin/login-logs` - Get login logs (Admin only)

## 🎨 UI Features

### Navigation
- Login/Register button for unauthenticated users
- User dropdown with profile and logout options
- Admin dashboard link for admin users
- Mobile responsive design

### Pages
- Beautiful glassmorphism design
- Smooth animations and transitions
- Form validation and error handling
- Loading states and success messages

## 📝 Notes

- Authentication gives no additional platform advantages (as requested)
- Admin users have full CRUD capabilities over other users
- Login logs track user sign-ins with timestamps
- All credentials are hardcoded (no environment variables)
- Database connection details are hardcoded as specified
- JWT tokens expire after 7 days
- Passwords are hashed with bcryptjs

## 🔒 Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens are stored in HTTP-only cookies
- Role-based access control on all protected routes
- SQL injection prevention with parameterized queries
- XSS protection with proper input validation

## 🚀 Running in Production

For production deployment:
1. Set `secure: true` for cookies in production (HTTPS required)
2. Use environment variables for sensitive data
3. Implement rate limiting on auth endpoints
4. Add email verification for registration
5. Implement password reset functionality
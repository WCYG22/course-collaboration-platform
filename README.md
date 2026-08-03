# CAML Learning Management System

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

A comprehensive, production-ready Learning Management System designed to facilitate seamless collaboration between students and instructors in higher education institutions. Built with modern web technologies, CAML LMS integrates course management, real-time communication, and intelligent collaboration features within a secure, scalable platform.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
- [Testing](#testing)
- [Project Status](#project-status)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

CAML (Course Collaboration Management & Learning) LMS addresses critical challenges in modern education by providing an integrated solution that combines course management, assignment submission, real-time collaboration, and peer-to-peer coordination within a unified platform. The system eliminates the fragmentation caused by using multiple disconnected tools and creates a cohesive digital learning ecosystem.

### Project Objectives

- **Unified Platform**: Integrate all course-related activities (materials, assignments, discussions, grading) in a single application
- **Enhanced Collaboration**: Enable intelligent peer matching based on skills, availability, and collaboration preferences
- **Real-Time Communication**: Provide instant updates and live discussions via WebSocket technology
- **Scalability**: Support growth from pilot courses to university-wide deployment
- **Security**: Implement industry-standard security practices with JWT authentication, bcrypt password hashing, and role-based access control

### Target Users

- **Students**: Access course materials, submit assignments, collaborate with peers, track progress
- **Instructors**: Manage courses, create assignments, grade submissions, monitor student engagement
- **Administrators**: Oversee platform operations, manage user accounts, generate reports

---

## Key Features

### Authentication & Security
- JWT-based stateless authentication with 7-day token expiration
- Bcrypt password hashing with 10 salt rounds
- Role-based access control (Student, Instructor)
- Session management with database tracking
- Rate limiting (100 requests per 15 minutes per IP)
- Login attempt tracking (5 attempts maximum with 15-minute lockout)
- Helmet.js security headers
- CORS protection
- XSS and SQL injection prevention

### Course Management
- Complete CRUD operations for courses (Instructors)
- Weekly course structure with organized materials
- Student enrollment and unenrollment functionality
- Course announcements and notifications
- Instructor analytics dashboard
- Enrollment management and tracking

### File Management
- Secure file upload with Multer middleware
- Multi-format support: PDF, DOCX, PPTX, XLSX, JPG, PNG, ZIP
- 50MB file size limit (configurable)
- File type validation (MIME type and extension checking)
- Organized storage structure (materials, submissions, avatars)
- Download tracking and analytics

### Real-Time Communication
- WebSocket server powered by Socket.IO
- Live discussion forum updates without page refresh
- Real-time notification delivery
- Typing indicators in discussions
- Course-specific room management
- Instant post and reply broadcasting

### Enhanced Student Profiles
- Skills and expertise tagging system
- Collaboration mode preferences (Online, Offline, Hybrid)
- Availability scheduling with weekly time slots
- Profile editing with real-time validation
- Peer discovery and matching for group projects

### Assignment System
- Assignment creation with customizable deadlines and marking schemes
- File submission with validation
- Version control for resubmissions
- Submission status tracking (Submitted, Graded)
- Grading interface for instructors (in progress)
- Feedback delivery system

### Responsive Design
- Mobile-first responsive design (320px to 2560px)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Touch-friendly UI elements (44x44px minimum touch targets)
- Progressive web app capabilities
- Optimized performance with lazy loading and code splitting

---

## System Architecture

CAML LMS employs a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│        React 19 + TypeScript + Tailwind CSS             │
│         (Student & Instructor Dashboards)               │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS / WebSocket
┌──────────────────┴──────────────────────────────────────┐
│                  Application Layer                       │
│         Express.js + TypeScript + Socket.IO             │
│    (REST API + Real-Time Server + Business Logic)       │
└──────────────────┬──────────────────────────────────────┘
                   │ SQL Queries
┌──────────────────┴──────────────────────────────────────┐
│                    Data Layer                            │
│         PostgreSQL (Production) / SQLite (Dev)          │
│          (20+ Tables, Normalized Schema)                │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns

- **MVC Architecture**: Clear separation of concerns between routes, controllers, and models
- **Repository Pattern**: Database abstraction layer supporting both PostgreSQL and SQLite
- **Middleware Pipeline**: Modular request processing (authentication, validation, error handling)
- **WebSocket Rooms**: Course-specific channels for targeted real-time updates

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime environment |
| Express.js | 4.x | Web application framework |
| TypeScript | 5.x | Type-safe JavaScript superset |
| PostgreSQL | 15+ | Production relational database |
| SQLite | 3.x | Development database |
| Socket.IO | 4.x | Real-time bidirectional communication |
| JWT | 9.x | Stateless authentication tokens |
| bcrypt | 5.x | Password hashing (10 rounds) |
| Multer | 1.4.x | File upload middleware |
| Helmet | 7.x | Security headers |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI component library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Vite | 5.x | Build tool and dev server |
| Framer Motion | 11.x | Animation library |
| Lucide React | - | Icon library |

### DevOps & Deployment
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (planned)
- **Hosting**: Render.com
- **Database Hosting**: Render PostgreSQL
- **Monitoring**: Render Dashboard + Application Logs

---

## Getting Started

### Prerequisites

Ensure the following are installed on your system:

- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.0.0 or higher (included with Node.js)
- **PostgreSQL**: Optional for production setup ([Download](https://www.postgresql.org/download/))
- **Git**: For version control ([Download](https://git-scm.com/downloads))

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/WCYG22/course-collaboration-platform.git
cd course-collaboration-platform
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#configuration) section).

4. **Database Setup**

For SQLite (Development):
```bash
# Database file will be auto-created on first run
# Location: server/database/caml_lms.db
```

For PostgreSQL (Production):
```bash
# Create database
createdb caml_lms

# Run schema
psql caml_lms < server/database/schema.sql
```

5. **Start Development Server**

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:client   # Frontend: http://localhost:3000
npm run dev:server   # Backend: http://localhost:5000
```

6. **Verify Installation**

```bash
# Health check
curl http://localhost:5000/api/health

# Expected response: {"status":"ok","timestamp":"..."}
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DB_TYPE=sqlite                    # Options: sqlite | postgres
DATABASE_URL=                     # PostgreSQL connection string (if DB_TYPE=postgres)

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server Configuration
PORT=5000
NODE_ENV=development              # Options: development | production

# Client Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration (Optional)
MAX_FILE_SIZE=52428800           # 50MB in bytes
UPLOAD_DIR=./uploads
```

### Database Configuration

**SQLite (Default for Development)**
```env
DB_TYPE=sqlite
# No DATABASE_URL needed - uses local file at server/database/caml_lms.db
```

**PostgreSQL (Recommended for Production)**
```env
DB_TYPE=postgres
DATABASE_URL=postgresql://username:password@localhost:5432/caml_lms
```

### Security Best Practices

1. **JWT Secret**: Generate a secure random string (minimum 32 characters)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Environment Files**: Never commit `.env` files to version control
3. **Production Secrets**: Use environment variable management services (e.g., Render, AWS Secrets Manager)

---

## API Documentation

### Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Authentication Endpoints

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "student"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": "https://..."
  }
}
```

#### POST `/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### POST `/auth/logout`
Invalidate current session.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:** `200 OK`
```json
{
  "message": "Logout successful"
}
```

#### GET `/auth/me`
Retrieve current authenticated user profile.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "student",
  "avatar": "https://...",
  "skills": ["React", "Node.js"],
  "preferred_mode": "Online",
  "availability": "Mon-Fri 9AM-5PM"
}
```

### Course Endpoints

#### GET `/courses`
Retrieve all available courses.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Fundamentals of programming",
    "instructor_id": "uuid",
    "instructor_name": "Prof. Smith",
    "created_at": "2026-01-15T10:00:00Z"
  }
]
```

#### POST `/courses` (Instructor Only)
Create a new course.

**Headers:** `Authorization: Bearer <INSTRUCTOR_TOKEN>`

**Request Body:**
```json
{
  "code": "CS101",
  "name": "Introduction to Computer Science",
  "description": "Fundamentals of programming and algorithms"
}
```

**Response:** `201 Created`

#### POST `/courses/:id/enroll` (Student Only)
Enroll in a course.

**Headers:** `Authorization: Bearer <STUDENT_TOKEN>`

**Response:** `200 OK`
```json
{
  "message": "Enrolled successfully"
}
```

### Error Responses

All errors follow a consistent format:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE" 
}
```

**Common Status Codes:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions for requested resource
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Resource already exists (e.g., duplicate email)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

## Database Schema

The CAML LMS database consists of 20+ normalized tables designed for scalability and data integrity.

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'instructor')),
    avatar TEXT,
    skills TEXT[],
    preferred_mode VARCHAR(20),
    availability TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Courses
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Enrollments
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, student_id)
);
```

### Complete Schema

For the complete database schema with all 20+ tables, foreign key relationships, indexes, and triggers, see:
- **File**: `server/database/schema.sql`
- **Documentation**: `ASSIGNMENT_REPORT.md` - Section 4.4 Database

### Entity Relationships

```
users (1) ──── (*) courses (instructor)
users (*) ──── (*) courses (enrollments)
courses (1) ──── (*) course_weeks
course_weeks (1) ──── (*) materials
courses (1) ──── (*) assignments
assignments (1) ──── (*) submissions
users (1) ──── (*) submissions (student)
courses (1) ──── (*) discussion_posts
discussion_posts (1) ──── (*) discussion_replies
```

---

## Security

CAML LMS implements industry-standard security practices to protect user data and prevent common vulnerabilities.

### Authentication Security

- **JWT Tokens**: Stateless authentication with 7-day expiration
- **Password Hashing**: bcrypt with 10 salt rounds (2^10 iterations)
- **Session Tracking**: Database-backed session validation
- **Brute Force Protection**: 5 failed login attempts trigger 15-minute lockout
- **Token Revocation**: Logout immediately invalidates session

### Authorization

- **Role-Based Access Control (RBAC)**: Student and Instructor roles with distinct permissions
- **Endpoint Protection**: All sensitive routes require authentication and appropriate role
- **Resource Ownership**: Users can only access/modify their own resources

### Input Validation & Sanitization

- **Parameterized Queries**: All SQL queries use parameterization to prevent SQL injection
- **File Upload Validation**: MIME type checking, file extension whitelisting, size limits
- **XSS Prevention**: React auto-escaping, Content Security Policy headers
- **Input Length Limits**: Maximum lengths enforced on all user inputs

### Network Security

- **HTTPS Only**: Production deployment enforces HTTPS
- **CORS Configuration**: Restricted to specific origins
- **Security Headers**: Helmet.js adds X-Content-Type-Options, X-Frame-Options, etc.
- **Rate Limiting**: 100 requests per 15 minutes per IP address

### Security Testing

All security measures are validated through comprehensive testing:
- SQL injection attempts (parameterized queries prevent)
- XSS attack vectors (React and headers prevent)
- CSRF attacks (CORS and same-origin policy)
- Authentication bypass attempts (session validation)
- File upload exploits (MIME validation, extension checks)

**Test Documentation**: See `DETAILED_TEST_CASES.md` for complete security test cases.

---

## Deployment

### Render.com Deployment (Recommended)

#### Prerequisites
- GitHub account with repository access
- Render account ([Sign up](https://render.com))

#### Deployment Steps

1. **Push to GitHub**
```bash
git remote add origin https://github.com/WCYG22/course-collaboration-platform.git
git branch -M main
git push -u origin main
```

2. **Create Web Service on Render**
   - Navigate to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Web Service**
   - Connect GitHub repository
   - Configure service:
     - **Name**: `caml-lms`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or paid for production)

3. **Configure Environment Variables**
   - In Render service settings, add:
     ```
     DB_TYPE=postgres
     JWT_SECRET=[Click "Generate" for secure random key]
     NODE_ENV=production
     CLIENT_URL=https://caml-lms.onrender.com
     ```

4. **Create PostgreSQL Database**
   - Click **New +** → **PostgreSQL**
   - Name: `caml-lms-db`
   - Plan: Free or Starter
   - Connect to web service (Render auto-injects `DATABASE_URL`)

5. **Initialize Database Schema**
   - Connect to PostgreSQL via provided connection string
   - Run: `psql <DATABASE_URL> < server/database/schema.sql`

6. **Deploy**
   - Render automatically builds and deploys on GitHub pushes
   - Monitor logs in Render dashboard
   - Access application at provided URL

### Manual Deployment (VPS)

For deployment on a Virtual Private Server (AWS EC2, DigitalOcean, etc.):

1. Install Node.js 18+ and PostgreSQL 15+
2. Clone repository and install dependencies
3. Configure production `.env` file
4. Build application: `npm run build`
5. Use PM2 or systemd for process management
6. Configure Nginx as reverse proxy
7. Set up SSL certificates with Let's Encrypt

**Detailed VPS deployment guide**: See `DEPLOYMENT_GUIDE.md` (to be created)

---

## Testing

### Running Tests

```bash
# Run all tests (when implemented)
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Manual Testing

#### API Health Check
```bash
curl http://localhost:5000/api/health
```

#### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student"
  }'
```

#### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Coverage

**Detailed Test Cases**: See `DETAILED_TEST_CASES.md` for 37 comprehensive test scenarios covering:
- User authentication (registration, login, logout)
- Course management (enrollment, creation, updates)
- File uploads (validation, size limits, type restrictions)
- Security (SQL injection, XSS, RBAC)
- Real-time communication (WebSocket connections, live updates)

**Test Results**: 37/37 tests passed (100% pass rate)

---

## Project Status

### Completed Features (90%)

| Module | Status | Completion |
|--------|--------|------------|
| Backend Infrastructure | ✅ Complete | 100% |
| Authentication & Security | ✅ Complete | 100% |
| Course Management API | ✅ Complete | 100% |
| File Upload System | ✅ Complete | 100% |
| Real-Time Communication | ✅ Complete | 100% |
| Enhanced Profile System | ✅ Complete | 100% |
| Frontend UI Components | ✅ Complete | 90% |
| Student Dashboard | ✅ Complete | 95% |
| Instructor Dashboard | ✅ Complete | 90% |
| Assignment Submission | ✅ Complete | 85% |

### In Progress (10%)

| Module | Status | Priority | Target |
|--------|--------|----------|--------|
| Assignment Grading Interface | 🚧 In Progress | High | Week 15 |
| Email Notifications | 📋 Planned | Medium | Week 16 |
| Quiz System | 📋 Planned | Low | Week 17 |
| Advanced Analytics | 📋 Planned | Medium | Week 18 |

### Future Enhancements

- Mobile native applications (iOS, Android)
- AI-powered study group recommendations
- Plagiarism detection integration
- Video conferencing integration (Zoom, Microsoft Teams)
- Calendar integration with iCal/Google Calendar export
- Multi-language support (i18n)
- Advanced reporting and data export (CSV, PDF)
- Accessibility improvements (WCAG 2.1 AAA compliance)

---

## Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or test coverage, your help is appreciated.

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/WCYG22/course-collaboration-platform.git
   cd course-collaboration-platform
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow existing code style and conventions
   - Add tests for new features
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run dev          # Test locally
   npm run build        # Ensure build succeeds
   npm test             # Run test suite
   ```

4. **Submit a Pull Request**
   - Push your branch to GitHub
   - Open a pull request with detailed description
   - Reference any related issues

### Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Commit Messages**: Use conventional commits format (`feat:`, `fix:`, `docs:`, etc.)
- **Testing**: Maintain or improve test coverage
- **Documentation**: Update README and inline comments for significant changes

### Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project, you agree to abide by its terms.

---

## License

This project is licensed under the **Apache License 2.0**. You are free to use, modify, and distribute this software in compliance with the license terms.

See the [LICENSE](./LICENSE) file for full details.

---

## Contact

### Project Team

- **Wong Cheng Yong** - Product Owner
- **Nicholas Teoh Jenn Zhen** - Scrum Master
- **Low Chun Tai** - Technical Lead
- **Adam Siam Anak Usan** - System Architect

### Links

- **GitHub Repository**: [https://github.com/WCYG22/course-collaboration-platform](https://github.com/WCYG22/course-collaboration-platform)
- **Live Demo**: [https://caml-lms.onrender.com](https://caml-lms.onrender.com) (when deployed)
- **Issue Tracker**: [GitHub Issues](https://github.com/WCYG22/course-collaboration-platform/issues)
- **Documentation**: [ASSIGNMENT_REPORT.md](./ASSIGNMENT_REPORT.md)

### Support

For questions, bug reports, or feature requests:
1. Check existing [GitHub Issues](https://github.com/WCYG22/course-collaboration-platform/issues)
2. Create a new issue with detailed information
3. Contact the development team via GitHub

---

## Acknowledgments

This project was developed as part of the XBAU2114N Software Development Methods course, demonstrating the practical application of Agile Scrum methodology and modern full-stack development practices.

### Technologies & Resources

- [React](https://react.dev/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database system
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Build tool
- [Render](https://render.com/) - Deployment platform

### Special Thanks

- Course instructors and teaching assistants for guidance and feedback
- Open-source community for excellent libraries and tools
- Educational institutions for inspiring this project's vision

---

<div align="center">

**Built with modern web technologies for the future of education**

[⬆ Back to Top](#caml-learning-management-system)

</div>

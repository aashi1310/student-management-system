# 🎓 Student Management System — Backend API

> A production-ready RESTful API built with **Node.js**, **Express.js**, and **MongoDB Atlas (Mongoose)**.
> Designed to seamlessly integrate with the existing HTML/CSS/JS frontend.

---

## 📋 Project Overview

This backend provides a complete set of CRUD endpoints for managing student academic records.
All data is persisted in **MongoDB Atlas** and served via a clean, consistent JSON API.

---

## ✨ Features

| Feature | Details |
|---|---|
| Full CRUD | Create, Read, Update, Delete student records |
| Search API | Case-insensitive regex across 5 fields |
| Dashboard Stats | Total students, courses, highest semester, latest student |
| Validation | Server-side field validation with descriptive error messages |
| Duplicate Prevention | Checks for duplicate `studentId` and `email` before insert |
| Centralised Error Handling | Consistent `{ success, message }` JSON responses |
| Health Check Endpoint | `/api/health` for uptime monitoring |
| Graceful Shutdown | Handles `SIGTERM` / `SIGINT` cleanly |
| Security Headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |

---

## 🔧 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | JavaScript runtime |
| Express.js | ^4.19 | HTTP server & routing |
| Mongoose | ^8.4 | MongoDB ODM & validation |
| MongoDB Atlas | Cloud | Database |
| dotenv | ^16.4 | Environment variable management |
| cors | ^2.8 | Cross-Origin Resource Sharing |
| nodemon | ^3.1 | Auto-restart in development |

---

## 📁 Folder Structure

```
backend/
│
├── config/
│   └── db.js                   ← MongoDB Atlas connection
│
├── controllers/
│   └── studentController.js    ← All 7 request handler functions
│
├── middleware/
│   ├── errorMiddleware.js      ← Global error handler (4-arg)
│   └── notFoundMiddleware.js   ← 404 catch-all
│
├── models/
│   └── Student.js              ← Mongoose schema + validation
│
├── routes/
│   └── studentRoutes.js        ← Express router (ordered correctly)
│
├── .env                        ← Environment variables (not committed)
├── .gitignore
├── package.json
├── server.js                   ← App entry point
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js ≥ 18 installed
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account & cluster

### Steps

```bash
# 1. Navigate to the backend folder
cd student-management-system/backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Edit .env and paste your MongoDB Atlas connection string
```

---

## 🔑 Environment Variables

Edit `backend/.env`:

```env
# Server port
PORT=5000

# MongoDB Atlas URI (replace with your real credentials)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/student_management?retryWrites=true&w=majority

# Node environment
NODE_ENV=development
```

> **How to get your `MONGO_URI`:**
> 1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
> 2. Click your cluster → **Connect** → **Drivers**
> 3. Select **Node.js** and copy the connection string
> 4. Replace `<username>` and `<password>` with your database user credentials

---

## 🚀 Running Locally

```bash
# Development mode (auto-restarts with nodemon)
npm run dev

# Production mode
npm start
```

**Expected console output:**
```
✅  MongoDB Connected Successfully — Host: cluster0.xxxxx.mongodb.net
═══════════════════════════════════════════════
  🎓  Student Management System — Backend
═══════════════════════════════════════════════
  🚀  Server running on port 5000
  🌍  Environment : development
  📡  API Base URL: http://localhost:5000/api
═══════════════════════════════════════════════
```

---

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health status |

### Student Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/students` | Create a new student |
| `GET` | `/api/students` | Get all students (newest first) |
| `GET` | `/api/students/:id` | Get a student by MongoDB `_id` |
| `PUT` | `/api/students/:id` | Update a student record |
| `DELETE` | `/api/students/:id` | Delete a student |
| `GET` | `/api/students/search?q=` | Search students (5 fields) |
| `GET` | `/api/students/stats` | Dashboard statistics |

---

### Request & Response Examples

#### ➕ Create Student — `POST /api/students`

**Request Body:**
```json
{
  "studentId": "STU006",
  "name": "Aashika Jain",
  "email": "aashika@gmail.com",
  "course": "B.Tech CSE",
  "semester": 5,
  "phone": "9876543210"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "_id": "6659abc123...",
    "studentId": "STU006",
    "name": "Aashika Jain",
    "email": "aashika@gmail.com",
    "course": "B.Tech CSE",
    "semester": 5,
    "phone": "9876543210",
    "createdAt": "2026-06-01T08:00:00.000Z",
    "updatedAt": "2026-06-01T08:00:00.000Z"
  }
}
```

**Error (409 — Duplicate ID):**
```json
{
  "success": false,
  "message": "Student ID \"STU006\" already exists"
}
```

---

#### 📋 Get All Students — `GET /api/students`

```json
{
  "success": true,
  "count": 5,
  "data": [ { ... }, { ... } ]
}
```

---

#### 🔍 Search — `GET /api/students/search?q=aashika`

```json
{
  "success": true,
  "count": 1,
  "query": "aashika",
  "data": [ { ... } ]
}
```

---

#### 📊 Dashboard Stats — `GET /api/students/stats`

```json
{
  "success": true,
  "data": {
    "totalStudents": 5,
    "totalCourses": 4,
    "highestSemester": 6,
    "latestStudent": "Kavya Reddy",
    "latestStudentId": "STU005"
  }
}
```

---

#### ✏️ Update — `PUT /api/students/:id`

**Request Body (only include fields to change):**
```json
{
  "semester": 6,
  "course": "M.Tech CSE"
}
```

---

#### 🗑️ Delete — `DELETE /api/students/:id`

**Success (200):**
```json
{
  "success": true,
  "message": "Student \"Aashika Jain\" (STU006) has been deleted successfully",
  "data": {
    "id": "6659abc123...",
    "studentId": "STU006"
  }
}
```

---

## 🛡️ Validation Rules

| Field | Rules |
|---|---|
| `studentId` | Required · Unique · 3–15 alphanumeric chars |
| `name` | Required · 3–50 chars · No digits |
| `email` | Required · Unique · Valid email format |
| `course` | Required · Min 2 chars |
| `semester` | Required · Integer 1–8 |
| `phone` | Required · Exactly 10 digits |

**Validation error response (400):**
```json
{
  "success": false,
  "message": "Phone number must be exactly 10 digits. Semester cannot exceed 8"
}
```

---

## 🔗 Connecting to the Frontend

To connect the existing HTML frontend to this backend, update `script.js` in the frontend to send `fetch()` / `XMLHttpRequest` calls to:

```
http://localhost:5000/api/students
```

instead of reading from `localStorage` directly.

---

## 🛣️ Future Improvements

- [ ] JWT-based authentication & role management (Admin / Teacher)
- [ ] Pagination (`?page=1&limit=10`)
- [ ] Rate limiting (`express-rate-limit`)
- [ ] Request logging (`morgan`)
- [ ] Input sanitisation (`express-mongo-sanitize`, `helmet`)
- [ ] Unit & integration tests (`Jest` + `Supertest`)
- [ ] Docker & docker-compose setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Swagger / OpenAPI documentation

---

## 👩‍💻 Author

**Aashika Jain**
- GitHub: [aashi1310](https://github.com/aashi1310)

---

## 📄 License

MIT License — feel free to use and modify.

---

*Student Management System Backend — 2026*

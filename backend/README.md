# Student Management System Backend

## Overview

The Student Management System Backend is a RESTful API built using Node.js, Express.js, and MongoDB. It provides complete CRUD functionality for managing student records and serves as the backend service for the Student Management System web application.

The API allows users to create, retrieve, update, delete, search, and analyze student data while ensuring proper validation, error handling, and database persistence.

---

## Features

* Create new student records
* Retrieve all student records
* Retrieve a single student by ID
* Update existing student information
* Delete student records
* Search students by multiple fields
* Dashboard statistics endpoint
* MongoDB Atlas integration
* Mongoose schema validation
* Centralized error handling
* RESTful API architecture
* Environment variable configuration
* CORS support
* Scalable project structure

---

## Technology Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Utilities

* dotenv
* cors
* nodemon

---

## Project Structure

```text
backend/
│
├── config/
│   └── db.js
│
├── models/
│   └── Student.js
│
├── controllers/
│   └── studentController.js
│
├── routes/
│   └── studentRoutes.js
│
├── middleware/
│   ├── errorMiddleware.js
│   └── notFoundMiddleware.js
│
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/student-management-system-backend.git
```

### Navigate to the Project Directory

```bash
cd student-management-system-backend
```

### Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string
```

Replace `your_mongodb_atlas_connection_string` with your MongoDB Atlas connection string.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will run on:

```text
http://localhost:5000
```

---

## API Base URL

```text
http://localhost:5000/api/students
```

---

## API Endpoints

### Create Student

**POST**

```http
/api/students
```

#### Request Body

```json
{
  "studentId": "STU001",
  "name": "Aashika Jain",
  "email": "aashika@gmail.com",
  "course": "B.Tech CSE",
  "semester": 5,
  "phone": "9876543210"
}
```

---

### Get All Students

**GET**

```http
/api/students
```

Returns all student records.

---

### Get Student By ID

**GET**

```http
/api/students/:id
```

Returns a single student based on MongoDB ID.

---

### Update Student

**PUT**

```http
/api/students/:id
```

Updates student information.

---

### Delete Student

**DELETE**

```http
/api/students/:id
```

Deletes a student record.

---

### Search Students

**GET**

```http
/api/students/search?q=value
```

Searches students by:

* Student ID
* Name
* Email
* Course
* Phone Number

---

### Dashboard Statistics

**GET**

```http
/api/students/stats
```

Returns:

```json
{
  "totalStudents": 120,
  "totalCourses": 6,
  "highestSemester": 8,
  "latestStudent": "Aashika Jain"
}
```

---

## Student Schema

```javascript
{
  studentId: String,
  name: String,
  email: String,
  course: String,
  semester: Number,
  phone: String
}
```

---

## Validation Rules

### Student ID

* Required
* Unique

### Name

* Required
* Minimum 3 characters

### Email

* Required
* Valid email format
* Unique

### Course

* Required

### Semester

* Required
* Value between 1 and 8

### Phone Number

* Required
* Exactly 10 digits

---

## Success Response Example

```json
{
  "success": true,
  "data": {}
}
```

---

## Error Response Example

```json
{
  "success": false,
  "message": "Student not found"
}
```

---

## Future Improvements

* User Authentication
* Role-Based Access Control
* JWT Authorization
* Pagination
* File Upload Support
* Student Attendance Module
* Student Marks Module
* Fee Management System
* Email Notifications
* API Documentation using Swagger

---

## Author

Developed as a Full Stack Student Management System Backend Project using Node.js, Express.js, and MongoDB.

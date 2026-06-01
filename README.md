# 📚 Student Management System

> A professional, fully-functional Student Management System built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript** — no frameworks, no dependencies, no installation required.

---

## 🌟 Project Overview

The **Student Management System** is a complete CRUD (Create, Read, Update, Delete) web application designed to manage student academic records. It features a modern glassmorphism dashboard UI, dark mode, real-time search, sorting, filtering, CSV export/import, and fully persistent data via the browser's Local Storage.

This project is suitable as an **internship submission** or **portfolio piece** that demonstrates professional frontend development skills.

---

## ✨ Features

### Core CRUD
| Feature | Description |
|---|---|
| ➕ Add Student | Register new students with full validation |
| 👁️ View Students | See all records in a professional sortable table |
| ✏️ Edit Student | Load record into the form, update any field |
| 🗑️ Delete Student | Custom confirmation modal (no browser confirm()) |

### Search, Sort & Filter
- **Real-time Search** — searches across ID, Name, Email, Course, Phone
- **Sort** — by Name, Semester, or Student ID (ascending ↑ / descending ↓)
- **Filter** — by Semester (1–8) or view All

### Dashboard Statistics
- Total Students
- Total Unique Courses
- Highest Semester
- Latest Student Added

### Import / Export
- **Export CSV** — download all records as a UTF-8 encoded CSV file
- **Import CSV** — upload and parse a CSV file; validates data, skips duplicates

### UI & UX
- 🌙 **Dark Mode** with one-click toggle (preference saved to LocalStorage)
- 🎨 **Glassmorphism** cards with gradient accents
- 🍞 **Toast Notifications** — animated, auto-dismissing, stackable (Success / Error / Warning / Info)
- 📭 **Empty State** — animated illustration shown when no records exist
- ✅ **Form Validation** — inline error messages, real-time feedback on blur/input
- 📱 **Fully Responsive** — works on desktop, tablet, and mobile
- ♿ **Accessible** — semantic HTML, ARIA labels, focus management, keyboard navigation

---

## 🔧 Technology Stack

| Technology | Usage |
|---|---|
| HTML5 | Semantic structure, accessibility attributes |
| CSS3 | Variables, Grid, Flexbox, Animations, Glassmorphism |
| Vanilla JavaScript (ES6+) | CRUD logic, validation, DOM manipulation |
| Browser Local Storage | Persistent data storage (no backend needed) |
| Google Fonts (Inter) | Modern typography |

**No frameworks. No libraries. No npm. No build tools.**

---

## 📁 Folder Structure

```
student-management-system/
│
├── index.html      ← App entry point & HTML structure
├── style.css       ← All styling (variables, layout, animations)
├── script.js       ← All application logic (CRUD, validation, etc.)
└── README.md       ← This file
```

---

## 🚀 How to Run

1. **Download or clone** this repository
2. Open the `student-management-system/` folder
3. Double-click `index.html` — the app opens directly in your browser
4. **No server, no npm, no installation needed.**

> Works offline after the first load (Google Fonts requires internet on first visit).

---

## 📊 Data Model

```js
{
  id:        "STU001",          // Unique alphanumeric ID (3–15 chars)
  name:      "Aashika Jain",   // Full name (3–50 chars, no digits)
  email:     "aashika@gmail.com",
  course:    "B.Tech CSE",
  semester:  5,                 // Integer 1–8
  phone:     "9876543210",      // Exactly 10 digits
  createdAt: "2026-06-01"       // ISO date YYYY-MM-DD (auto-generated)
}
```

### LocalStorage Keys
| Key | Value |
|---|---|
| `students` | JSON array of all student objects |
| `theme` | `"light"` or `"dark"` |

---

## 🔍 Form Validation Rules

| Field | Rules |
|---|---|
| Student ID | Required · 3–15 chars · Letters & numbers only · Must be unique |
| Full Name | Required · 3–50 chars · No numbers allowed |
| Email | Required · Valid email format |
| Course | Required · Minimum 2 characters |
| Semester | Required · Integer value 1–8 |
| Phone | Required · Exactly 10 digits |

---

## 📸 Screenshots

> *(Open `index.html` in your browser to see the live application)*

| Light Mode | Dark Mode |
|---|---|
| Dashboard with stats | Same dashboard in dark theme |
| Student table with actions | Edit/Delete buttons |
| Add form with validation | Toast notifications |

---

## 🛣️ Future Enhancements

- [ ] Pagination for large datasets
- [ ] Print / PDF export
- [ ] Student profile photo upload (base64 LocalStorage)
- [ ] Advanced multi-field search with filter chips
- [ ] Bulk delete selected rows
- [ ] Chart / analytics view (Chart.js integration)
- [ ] IndexedDB backend for larger storage limits
- [ ] Offline PWA with Service Worker

---

## 🧑‍💻 JavaScript Functions Reference

| Function | Purpose |
|---|---|
| `loadStudents()` | Load data from LocalStorage; seed sample data if empty |
| `saveStudents()` | Persist students array to LocalStorage |
| `renderStudents()` | Re-build and inject table rows |
| `buildFilteredList()` | Apply search + filter + sort to produce displayed list |
| `addStudent()` | Create and store a new student record |
| `updateStudent()` | Save edits to an existing student |
| `editStudent(id)` | Populate form with student data for editing |
| `deleteStudent(id)` | Trigger the delete confirmation modal |
| `confirmDelete()` | Execute deletion after user confirms |
| `validateForm()` | Run all field validators; returns `true` if valid |
| `searchStudents()` | Update search query and re-render |
| `filterStudents()` | Update semester filter and re-render |
| `sortStudents(field)` | Toggle ascending/descending sort on a field |
| `exportCSV()` | Generate and download a CSV file |
| `importCSV(event)` | Parse an uploaded CSV and add valid records |
| `showToast(type, title, msg)` | Show an animated toast notification |
| `removeToast(el)` | Dismiss a toast with exit animation |
| `showModal()` | Display the delete confirmation modal |
| `closeModal()` | Hide the modal |
| `toggleDarkMode()` | Switch theme and save preference |
| `applyStoredTheme()` | Apply saved or OS-preferred theme on load |
| `updateDashboard()` | Recalculate and update all stat cards |
| `resetForm()` | Clear the form and return to "Add" mode |
| `generateStudentID()` | Auto-generate next sequential Student ID |
| `formatDate(dateStr)` | Convert YYYY-MM-DD to readable display format |
| `escapeHTML(str)` | Sanitise strings to prevent XSS |
| `csvEscape(val)` | Safely quote CSV field values |
| `parseCSVLine(line)` | Parse a CSV line including quoted fields |

---

## 👩‍💻 Author

**Aashika Jain**

- GitHub: [aashi1310](https://github.com/aashi1310)
- Project: Student Management System — Internship-level Frontend Portfolio

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ using HTML5, CSS3 & Vanilla JavaScript — 2026*

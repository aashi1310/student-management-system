# 📚 Student Management System

A **production-ready, fully offline Student Management System** built with pure HTML5, CSS3, and Vanilla JavaScript. No frameworks, no libraries, no installation required — simply open `index.html` in any modern browser.

---

## 🖼️ Screenshots

> _Open `index.html` in your browser to see the live UI._

| Light Mode | Dark Mode |
|:---:|:---:|
| *(Open in browser)* | *(Toggle with 🌙 button)* |

---

## 🚀 Features

### ✅ CRUD Operations
- **Create** — Add new student records with full validation
- **Read** — Display all records in a sortable, searchable table
- **Update** — Edit any student's details inline (ID protected)
- **Delete** — Remove records with a custom confirmation modal

### 🔍 Search & Filter
- **Real-time search** across Student ID, Name, Email, Course, and Phone
- **Semester filter** dropdown (All / Semester 1–8)
- No page refresh required

### ↕️ Sorting
- Sort by **Name**, **Semester**, or **Student ID**
- Toggle **ascending / descending** on each click

### 📊 Dashboard Statistics
- **Total Students** count
- **Total Courses** (unique)
- **Highest Semester** enrolled
- **Latest Student Added** name

### 🌙 Dark Mode
- One-click toggle between light and dark themes
- Preference saved to **Local Storage**
- Smooth CSS transitions throughout

### 📤 Export CSV
- Export all student records to a `.csv` file
- Downloads automatically with a dated filename

### 📥 Import CSV (Bonus)
- Import records from a `.csv` file
- Validates all fields and skips duplicate IDs
- Reports added vs. skipped counts

### 🔔 Toast Notifications
- Custom animated **Success / Error / Warning / Info** toasts
- Auto-dismiss after 3.5 seconds with a progress bar
- Stack multiple notifications

### 🛡️ Form Validation
| Field | Rules |
|---|---|
| Student ID | Required, 3–15 chars, alphanumeric, unique |
| Full Name | Required, 3–50 chars, no digits |
| Email | Required, valid email format |
| Course | Required, ≥ 2 chars |
| Semester | Required, 1–8 only |
| Phone | Required, exactly 10 digits |

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure, accessibility |
| CSS3 | Styling, animations, dark mode, glassmorphism |
| Vanilla JavaScript (ES6+) | Logic, DOM manipulation, LocalStorage |
| Browser Local Storage | Data persistence |
| Google Fonts (Inter) | Modern typography |

> ⚠️ **No external JS frameworks, no jQuery, no Bootstrap, no Tailwind, no Node.js.**

---

## 📁 Folder Structure

```
student-management-system/
│
├── index.html      ← Main HTML (structure, modals, form, table)
├── style.css       ← Complete stylesheet (dark mode, responsive, animations)
├── script.js       ← All application logic (CRUD, validation, CSV, toasts)
└── README.md       ← This file
```

---

## ▶️ How to Run

1. **Download / clone** the project folder
2. **Open** `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. That's it! No server, no build step, no npm install

```
student-management-system/
└── index.html  ← Double-click this file
```

> The app automatically seeds 5 demo students on first launch so you can explore all features immediately.

---

## 📦 Local Storage Keys

| Key | Value |
|---|---|
| `students` | JSON array of all student objects |
| `theme` | `"light"` or `"dark"` |

---

## 🗂️ Student Data Model

```js
{
  id:        "STU001",           // Unique alphanumeric identifier
  name:      "Aashika Jain",     // Full name
  email:     "aashika@gmail.com",// Email address
  course:    "B.Tech CSE",       // Course name
  semester:  5,                  // Integer 1–8
  phone:     "9876543210",       // 10-digit phone
  createdAt: "2026-01-15"        // ISO date string YYYY-MM-DD
}
```

---

## 🧩 JavaScript Functions Reference

| Function | Purpose |
|---|---|
| `loadStudents()` | Load data from Local Storage (seed if empty) |
| `saveStudents()` | Persist students array to Local Storage |
| `addStudent()` | Add a new student and refresh UI |
| `updateStudent()` | Save edits to existing student |
| `deleteStudent(id)` | Open confirmation modal for deletion |
| `confirmDelete()` | Execute confirmed delete |
| `editStudent(id)` | Populate form for editing |
| `renderStudents()` | Re-render table from filteredList |
| `buildFilteredList()` | Apply search + filter + sort to students |
| `searchStudents()` | Handle search input change |
| `filterStudents()` | Handle semester filter change |
| `sortStudents(field)` | Toggle sort on a field |
| `exportCSV()` | Download students as .csv |
| `importCSV(event)` | Parse and import from .csv file |
| `showToast(type, title, msg)` | Show animated toast notification |
| `removeToast(el)` | Animate and remove a toast |
| `showModal()` | Show delete confirmation modal |
| `closeModal()` | Hide delete confirmation modal |
| `toggleDarkMode()` | Switch and persist theme |
| `applyStoredTheme()` | Apply theme on page load |
| `updateDashboard()` | Recalculate and display all stat cards |
| `resetForm()` | Clear form and return to Add mode |
| `validateForm()` | Validate all fields; return boolean |
| `generateStudentID()` | Auto-generate next sequential STU ID |
| `formatDate(str)` | Convert YYYY-MM-DD to readable format |
| `escapeHTML(str)` | Prevent XSS in dynamic HTML |

---

## ♿ Accessibility

- Semantic HTML5 elements (`header`, `main`, `footer`, `section`, `nav`)
- All inputs have associated `<label>` elements
- ARIA roles and attributes (`role="dialog"`, `aria-modal`, `aria-label`, `aria-live`)
- Keyboard navigation: **Escape** closes modals
- Focus states on all interactive elements
- Screen reader–friendly empty state and toast notifications

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| > 1200px | 2-column (form + table side by side) |
| 1024–1200px | 2-column (narrower form) |
| 640–1024px | Single column stack |
| < 640px | Compact mobile layout |

---

## 🔮 Future Enhancements

- [ ] Print / PDF export of student reports
- [ ] Student photo upload and display
- [ ] Attendance tracking module
- [ ] Marks / GPA entry per subject
- [ ] Course-wise analytics charts
- [ ] Pagination for large datasets
- [ ] Advanced multi-field filter
- [ ] Email notifications via mailto links
- [ ] IndexedDB support for larger datasets
- [ ] PWA support (offline service worker)

---

## 👩‍💻 Author

**Aashika Jain**  
Frontend Developer | UI/UX Enthusiast  
📅 Built: June 2026  

---

## 📄 License

This project is open source and free to use for educational and portfolio purposes.

---

> _Built with ❤️ using pure HTML, CSS & Vanilla JavaScript — no frameworks needed._

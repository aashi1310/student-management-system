/**
 * =========================================================
 * Student Management System — script.js
 * Author  : Senior Frontend Developer
 * Version : 2.0.0
 * Date    : 2026-06-01
 * Description:
 *   Full CRUD with LocalStorage, real-time Search,
 *   Sort, Filter, Dark Mode, CSV Export/Import,
 *   Custom Toasts, Form Validation, Dashboard Stats
 * =========================================================
 */

'use strict';

/* ─── LOCAL STORAGE KEYS ─── */
const LS_STUDENTS = 'students';
const LS_THEME    = 'theme';

/* ─── APPLICATION STATE ─── */
let students     = [];     // Master data array (always full dataset)
let filteredList = [];     // Currently displayed / filtered + sorted list
let editingId    = null;   // Student ID currently being edited (null = add mode)
let deleteTarget = null;   // Student ID pending deletion confirmation
let sortField    = null;   // Active sort field key
let sortDir      = 'asc';  // 'asc' | 'desc'
let searchQuery  = '';     // Current search string
let filterSem    = 'all';  // Active semester filter

/* ─── SAMPLE / SEED DATA ─── */
const SAMPLE_STUDENTS = [
  { id: 'STU001', name: 'Aashika Jain',   email: 'aashika@gmail.com',    course: 'B.Tech CSE',  semester: 5, phone: '9876543210', createdAt: '2026-01-15' },
  { id: 'STU002', name: 'Rohan Sharma',   email: 'rohan.s@gmail.com',    course: 'BCA',          semester: 3, phone: '9988776655', createdAt: '2026-02-20' },
  { id: 'STU003', name: 'Priya Mehta',    email: 'priya.m@yahoo.com',    course: 'B.Sc IT',      semester: 6, phone: '8765432109', createdAt: '2026-03-05' },
  { id: 'STU004', name: 'Arjun Patel',    email: 'arjun.p@outlook.com',  course: 'B.Tech ECE',   semester: 2, phone: '7654321098', createdAt: '2026-04-10' },
  { id: 'STU005', name: 'Kavya Reddy',    email: 'kavya.r@gmail.com',    course: 'MBA',           semester: 1, phone: '9123456780', createdAt: '2026-05-22' },
];

/* =========================================================
   INITIALISE — run after DOM is ready
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();         // Must be first to prevent flash
  setCurrentDate();
  loadStudents();
  renderStudents();
  updateDashboard();

  // Attach form submit handler
  document.getElementById('student-form').addEventListener('submit', handleFormSubmit);

  // Attach real-time field validation
  attachFieldValidators();
});

/* =========================================================
   LOCAL STORAGE — LOAD & SAVE
========================================================= */

/**
 * Load the students array from LocalStorage.
 * Seeds sample data if the store is empty or corrupted.
 */
function loadStudents() {
  const raw = localStorage.getItem(LS_STUDENTS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // Ensure it's a non-empty array
      students = Array.isArray(parsed) && parsed.length ? parsed : [];
    } catch {
      students = [];
    }
  }
  // Seed demo data when nothing is stored
  if (!students.length) {
    students = SAMPLE_STUDENTS.map(s => ({ ...s }));
    saveStudents();
  }
}

/**
 * Persist the current students array to LocalStorage.
 */
function saveStudents() {
  localStorage.setItem(LS_STUDENTS, JSON.stringify(students));
}

/* =========================================================
   RENDER — build the table from filteredList
========================================================= */

/**
 * Re-build filteredList then inject rows into the table.
 * Shows / hides empty state as needed.
 */
function renderStudents() {
  buildFilteredList();

  const tbody       = document.getElementById('students-tbody');
  const emptyState  = document.getElementById('empty-state');
  const table       = document.getElementById('students-table');
  const recordCount = document.getElementById('record-count');

  tbody.innerHTML = '';

  if (!filteredList.length) {
    table.style.display     = 'none';
    emptyState.hidden       = false;
    recordCount.textContent = '';
    return;
  }

  table.style.display     = '';
  emptyState.hidden       = true;
  const total             = filteredList.length;
  recordCount.textContent = `${total} record${total !== 1 ? 's' : ''}`;

  // Build each table row
  filteredList.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.className          = 'table-row-enter';
    tr.style.animationDelay = `${i * 28}ms`;
    tr.dataset.id         = s.id;

    tr.innerHTML = `
      <td class="td-num">${i + 1}</td>
      <td><span class="student-id-badge">${escapeHTML(s.id)}</span></td>
      <td><strong>${escapeHTML(s.name)}</strong></td>
      <td class="td-email">${escapeHTML(s.email)}</td>
      <td>${escapeHTML(s.course)}</td>
      <td><span class="semester-badge" title="Semester ${escapeHTML(String(s.semester))}">${escapeHTML(String(s.semester))}</span></td>
      <td>${escapeHTML(s.phone)}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td class="td-actions">
        <button class="btn btn-edit"
          onclick="editStudent('${escapeHTML(s.id)}')"
          title="Edit ${escapeHTML(s.name)}"
          aria-label="Edit ${escapeHTML(s.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn btn-delete"
          onclick="deleteStudent('${escapeHTML(s.id)}')"
          title="Delete ${escapeHTML(s.name)}"
          aria-label="Delete ${escapeHTML(s.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          Delete
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* =========================================================
   FILTER + SEARCH + SORT — build filteredList
========================================================= */

/**
 * Applies search, semester filter, and sort to produce filteredList.
 */
function buildFilteredList() {
  const q = searchQuery.toLowerCase().trim();

  // 1. Filter by semester + search term
  filteredList = students.filter(s => {
    if (filterSem !== 'all' && String(s.semester) !== filterSem) return false;
    if (q) {
      return (
        s.id.toLowerCase().includes(q)     ||
        s.name.toLowerCase().includes(q)   ||
        s.email.toLowerCase().includes(q)  ||
        s.course.toLowerCase().includes(q) ||
        String(s.semester).includes(q)     ||
        s.phone.includes(q)
      );
    }
    return true;
  });

  // 2. Sort
  if (sortField) {
    filteredList.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (sortField === 'semester') {
        av = Number(av);
        bv = Number(bv);
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }
}

/** Called by the search input's oninput event */
function searchStudents() {
  searchQuery = document.getElementById('search-input').value;
  renderStudents();
}

/** Called by the semester filter dropdown's onchange event */
function filterStudents() {
  filterSem = document.getElementById('semester-filter').value;
  renderStudents();
}

/**
 * Toggle sort direction for a given field (name | semester | id).
 * Clicking the active sort button cycles asc → desc → asc.
 * @param {string} field  - 'name' | 'semester' | 'id'
 */
function sortStudents(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir   = 'asc';
  }

  // Reset all sort buttons to inactive state
  ['name', 'semester', 'id'].forEach(f => {
    const btn  = document.getElementById(`sort-${f}`);
    const icon = document.getElementById(`sort-${f}-icon`);
    if (btn) { btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); }
    if (icon) icon.textContent = '↕';
  });

  // Mark active sort button
  const activeBtn  = document.getElementById(`sort-${field}`);
  const activeIcon = document.getElementById(`sort-${field}-icon`);
  if (activeBtn) { activeBtn.classList.add('active'); activeBtn.setAttribute('aria-pressed', 'true'); }
  if (activeIcon) activeIcon.textContent = sortDir === 'asc' ? '↑' : '↓';

  renderStudents();
}

/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

/**
 * Recalculate and update all four stat cards.
 */
function updateDashboard() {
  // Total students
  document.getElementById('total-students').textContent = students.length;

  // Unique courses (case-insensitive, trimmed)
  const courses = new Set(students.map(s => s.course.trim().toLowerCase()));
  document.getElementById('total-courses').textContent = courses.size || '—';

  // Highest semester
  const maxSem = students.length
    ? Math.max(...students.map(s => Number(s.semester)))
    : 0;
  document.getElementById('highest-semester').textContent = maxSem || '—';

  // Latest student by date
  if (students.length) {
    const latest = students.reduce((a, b) =>
      new Date(a.createdAt) >= new Date(b.createdAt) ? a : b
    );
    document.getElementById('latest-student').textContent = latest.name;
  } else {
    document.getElementById('latest-student').textContent = '—';
  }
}

/* =========================================================
   CRUD — ADD
========================================================= */

/** Main form submit handler — delegates to addStudent or updateStudent */
function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;
  editingId ? updateStudent() : addStudent();
}

/** Collect and return form field values as a student object */
function collectFormData() {
  return {
    id:        document.getElementById('student-id').value.trim(),
    name:      document.getElementById('student-name').value.trim(),
    email:     document.getElementById('student-email').value.trim().toLowerCase(),
    course:    document.getElementById('student-course').value.trim(),
    semester:  Number(document.getElementById('student-semester').value),
    phone:     document.getElementById('student-phone').value.trim(),
    createdAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Add a new student record to the store.
 * Generates today's date automatically.
 */
function addStudent() {
  const student = collectFormData();
  students.push(student);
  saveStudents();
  renderStudents();
  updateDashboard();
  resetForm();
  showToast('success', 'Student Added', `${student.name} has been registered successfully.`);
}

/* =========================================================
   CRUD — UPDATE
========================================================= */

/**
 * Save edits to the currently-being-edited student.
 * Preserves original id and createdAt.
 */
function updateStudent() {
  const formData  = collectFormData();
  const idx       = students.findIndex(s => s.id === editingId);
  if (idx === -1) {
    showToast('error', 'Error', 'Student record not found.');
    return;
  }

  const original  = students[idx];
  students[idx]   = {
    ...original,
    name:     formData.name,
    email:    formData.email,
    course:   formData.course,
    semester: formData.semester,
    phone:    formData.phone,
  };

  saveStudents();
  renderStudents();
  updateDashboard();
  resetForm();
  showToast('success', 'Record Updated', `${formData.name}'s record has been updated.`);
}

/**
 * Populate the form with a student's data for editing.
 * Locks the Student ID field.
 * @param {string} id - Student ID to edit
 */
function editStudent(id) {
  const s = students.find(s => s.id === id);
  if (!s) return;

  editingId = id;

  // Fill form fields
  document.getElementById('student-id').value       = s.id;
  document.getElementById('student-id').disabled    = true;
  document.getElementById('student-name').value     = s.name;
  document.getElementById('student-email').value    = s.email;
  document.getElementById('student-course').value   = s.course;
  document.getElementById('student-semester').value = String(s.semester);
  document.getElementById('student-phone').value    = s.phone;

  // Update form UI to "edit" mode
  document.getElementById('form-title').textContent      = 'Edit Student Record';
  document.getElementById('form-subtitle').textContent   = `Updating record for ${s.name}`;
  document.getElementById('submit-btn-text').textContent = 'Update Student';
  document.getElementById('edit-badge').hidden           = false;

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.classList.add('update-mode');

  // Highlight the form card
  document.getElementById('form-section').classList.add('editing-mode');

  // Scroll to form & focus first editable field
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => document.getElementById('student-name').focus(), 400);

  showToast('info', 'Edit Mode', `Editing record for ${s.name}. Update the fields and click "Update Student".`, 3000);
}

/* =========================================================
   CRUD — DELETE
========================================================= */

/**
 * Trigger deletion flow: sets deleteTarget and shows the confirm modal.
 * @param {string} id - Student ID to delete
 */
function deleteStudent(id) {
  const s = students.find(s => s.id === id);
  if (!s) return;
  deleteTarget = id;
  document.getElementById('modal-message').textContent =
    `You are about to permanently delete the record for "${s.name}" (${s.id}). This action cannot be undone.`;
  showModal();
}

/**
 * Execute the confirmed deletion.
 * Called when user clicks "Delete" inside the modal.
 */
function confirmDelete() {
  if (!deleteTarget) return;
  const s    = students.find(s => s.id === deleteTarget);
  const name = s ? s.name : 'Student';
  students   = students.filter(s => s.id !== deleteTarget);
  saveStudents();
  renderStudents();
  updateDashboard();
  closeModal();
  deleteTarget = null;
  showToast('success', 'Record Deleted', `${name}'s record has been permanently removed.`);
}

/* =========================================================
   FORM VALIDATION
========================================================= */

/**
 * Validation rules for each form field.
 * Each key maps to the input element's id.
 */
const VALIDATORS = {
  'student-id': {
    validate(v) {
      if (!v)          return 'Student ID is required.';
      if (v.length < 3) return 'Minimum 3 characters required.';
      if (v.length > 15) return 'Maximum 15 characters allowed.';
      if (!/^[a-zA-Z0-9]+$/.test(v)) return 'Only letters and numbers are allowed.';
      if (!editingId && students.some(s => s.id.toLowerCase() === v.toLowerCase()))
        return 'This Student ID already exists.';
      return '';
    }
  },
  'student-name': {
    validate(v) {
      if (!v)           return 'Full Name is required.';
      if (v.length < 3)  return 'Name must be at least 3 characters.';
      if (v.length > 50) return 'Name must be 50 characters or less.';
      if (/\d/.test(v))  return 'Numbers are not allowed in the name.';
      return '';
    }
  },
  'student-email': {
    validate(v) {
      if (!v) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
      return '';
    }
  },
  'student-course': {
    validate(v) {
      if (!v)           return 'Course is required.';
      if (v.length < 2)  return 'Course must be at least 2 characters.';
      return '';
    }
  },
  'student-semester': {
    validate(v) {
      if (!v) return 'Please select a semester.';
      const n = Number(v);
      if (n < 1 || n > 8) return 'Semester must be between 1 and 8.';
      return '';
    }
  },
  'student-phone': {
    validate(v) {
      if (!v) return 'Phone number is required.';
      if (!/^\d{10}$/.test(v)) return 'Phone must be exactly 10 digits.';
      return '';
    }
  }
};

/**
 * Run all field validators. Returns true if the form is valid.
 */
function validateForm() {
  let valid = true;
  Object.entries(VALIDATORS).forEach(([id, validator]) => {
    const input = document.getElementById(id);
    if (!input) return;
    // Skip ID field when editing (it's disabled and locked)
    if (id === 'student-id' && editingId) { clearFieldError(id); return; }
    const msg = validator.validate(input.value.trim());
    if (msg) { showFieldError(id, msg); valid = false; }
    else       { clearFieldError(id); }
  });
  return valid;
}

/**
 * Show a validation error beneath the specified field.
 * @param {string} id  - Element ID
 * @param {string} msg - Error message text
 */
function showFieldError(id, msg) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}-error`);
  if (input) input.classList.add('is-error');
  if (err)   err.textContent = msg;
}

/**
 * Clear the validation error for the specified field.
 * @param {string} id - Element ID
 */
function clearFieldError(id) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}-error`);
  if (input) input.classList.remove('is-error');
  if (err)   err.textContent = '';
}

/**
 * Wire real-time validation (blur + input clearing) to all fields.
 */
function attachFieldValidators() {
  Object.keys(VALIDATORS).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    // Validate on blur
    input.addEventListener('blur', () => {
      if (id === 'student-id' && editingId) return;
      const msg = VALIDATORS[id].validate(input.value.trim());
      msg ? showFieldError(id, msg) : clearFieldError(id);
    });

    // Clear error as soon as user starts correcting
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) clearFieldError(id);
    });
  });
}

/* =========================================================
   RESET FORM
========================================================= */

/**
 * Reset the form to "Add New Student" mode.
 * Clears all fields, errors, and editing state.
 */
function resetForm() {
  editingId = null;
  document.getElementById('student-form').reset();
  document.getElementById('student-id').disabled = false;

  document.getElementById('form-title').textContent      = 'Add New Student';
  document.getElementById('form-subtitle').textContent   = 'Fill in the details to register a new student';
  document.getElementById('submit-btn-text').textContent = 'Add Student';
  document.getElementById('edit-badge').hidden           = true;

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.classList.remove('update-mode');

  document.getElementById('form-section').classList.remove('editing-mode');

  // Clear all field errors
  Object.keys(VALIDATORS).forEach(id => clearFieldError(id));
}

/* =========================================================
   MODAL
========================================================= */

/** Show the delete confirmation modal */
function showModal() {
  document.getElementById('delete-modal').classList.add('active');
  // Focus cancel button for keyboard users
  setTimeout(() => document.getElementById('modal-cancel-btn').focus(), 80);
}

/** Hide the delete confirmation modal */
function closeModal() {
  document.getElementById('delete-modal').classList.remove('active');
  deleteTarget = null;
}

// Close on overlay backdrop click
document.getElementById('delete-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('delete-modal').classList.contains('active')) {
    closeModal();
  }
});

/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */

/** SVG icons for each toast type */
const TOAST_ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

/**
 * Show a stacked toast notification.
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} title     - Bold notification title
 * @param {string} message   - Notification body text
 * @param {number} duration  - Auto-dismiss after N milliseconds (default 3500)
 */
function showToast(type, title, message, duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-msg">${escapeHTML(message)}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss notification" title="Dismiss">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="toast-progress"></div>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);

  const timer = setTimeout(() => removeToast(toast), duration);
  toast._timer = timer;
}

/**
 * Animate and remove a toast element.
 * @param {HTMLElement} toast
 */
function removeToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* =========================================================
   DARK MODE
========================================================= */

/**
 * Toggle between light and dark themes.
 * Stores preference in LocalStorage.
 */
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next   = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(LS_THEME, next);
  showToast(
    'info',
    next === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode',
    `Theme switched to ${next} mode.`,
    2200
  );
}

/**
 * Apply the stored (or OS-preferred) theme before first paint.
 */
function applyStoredTheme() {
  const stored = localStorage.getItem(LS_THEME);
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme  = stored || prefer;
  document.documentElement.setAttribute('data-theme', theme);
}

/* =========================================================
   CSV EXPORT
========================================================= */

/**
 * Export all student records to a CSV file and trigger download.
 */
function exportCSV() {
  if (!students.length) {
    showToast('warning', 'Nothing to Export', 'Add some student records first.');
    return;
  }

  const headers = ['Student ID', 'Full Name', 'Email', 'Course', 'Semester', 'Phone', 'Date Added'];
  const rows    = students.map(s => [
    csvEscape(s.id),
    csvEscape(s.name),
    csvEscape(s.email),
    csvEscape(s.course),
    s.semester,
    csvEscape(s.phone),
    csvEscape(s.createdAt),
  ]);

  const csvContent = [
    headers.map(csvEscape).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `students_export_${formatDateForFile(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('success', 'Export Complete', `${students.length} record(s) exported successfully.`);
}

/* =========================================================
   CSV IMPORT
========================================================= */

/**
 * Import student records from a CSV file selected by the user.
 * Validates each row and skips duplicates.
 * @param {Event} event - File input change event
 */
function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.csv')) {
    showToast('error', 'Invalid File', 'Please select a valid .csv file.');
    event.target.value = '';
    return;
  }

  const reader   = new FileReader();
  reader.onload  = function (e) {
    const text    = e.target.result;
    const lines   = text.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) {
      showToast('error', 'Invalid CSV', 'CSV must have a header row and at least one data row.');
      event.target.value = '';
      return;
    }

    // Parse headers (normalised: lowercase, no spaces)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '').replace(/['"]/g, ''));
    const idIdx   = headers.indexOf('studentid');
    const nmIdx   = headers.indexOf('fullname');
    const emIdx   = headers.indexOf('email');
    const coIdx   = headers.indexOf('course');
    const smIdx   = headers.indexOf('semester');
    const phIdx   = headers.indexOf('phone');
    const dtIdx   = headers.indexOf('dateadded');

    if ([idIdx, nmIdx, emIdx, coIdx, smIdx, phIdx].some(i => i === -1)) {
      showToast('error', 'Invalid CSV Format',
        'Required columns missing. Use the exported CSV as a template.');
      event.target.value = '';
      return;
    }

    let added   = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols  = parseCSVLine(lines[i]);
      const id    = (cols[idIdx]  || '').trim();
      const name  = (cols[nmIdx]  || '').trim();
      const email = (cols[emIdx]  || '').trim();
      const course= (cols[coIdx]  || '').trim();
      const sem   = Number((cols[smIdx] || '').trim());
      const phone = (cols[phIdx]  || '').trim();
      const date  = dtIdx !== -1
        ? ((cols[dtIdx] || '').trim() || new Date().toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0];

      // Skip invalid rows
      if (!id || !name || !email || !course || isNaN(sem) || sem < 1 || sem > 8 || !/^\d{10}$/.test(phone)) {
        skipped++;
        continue;
      }
      // Skip duplicate IDs
      if (students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
        skipped++;
        continue;
      }
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        skipped++;
        continue;
      }

      students.push({ id, name, email: email.toLowerCase(), course, semester: sem, phone, createdAt: date });
      added++;
    }

    saveStudents();
    renderStudents();
    updateDashboard();
    event.target.value = ''; // Reset the file input for re-use

    if (added > 0)    showToast('success', 'Import Successful', `${added} record(s) imported successfully.`);
    if (skipped > 0)  showToast('warning', 'Some Rows Skipped', `${skipped} row(s) skipped (invalid data or duplicate ID).`);
    if (added === 0 && skipped === 0) showToast('info', 'Nothing Imported', 'No valid records found in the file.');
  };

  reader.onerror = () => {
    showToast('error', 'File Error', 'Failed to read the file. Please try again.');
    event.target.value = '';
  };

  reader.readAsText(file, 'UTF-8');
}

/* =========================================================
   UTILITY HELPERS
========================================================= */

/**
 * Escape special HTML characters to prevent XSS injection.
 * @param {string|number} str - Input value
 * @returns {string} HTML-safe string
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wrap a CSV field in double quotes if it contains commas, quotes, or newlines.
 * @param {string|number} val
 * @returns {string} CSV-safe field
 */
function csvEscape(val) {
  const s = String(val === null || val === undefined ? '' : val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Robust CSV line parser that correctly handles quoted fields containing commas.
 * @param {string} line - Raw CSV line
 * @returns {string[]} Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

/**
 * Format a YYYY-MM-DD date string into a human-readable display date.
 * Uses en-IN locale (e.g. "01 Jun 2026").
 * @param {string} dateStr - ISO date string YYYY-MM-DD
 * @returns {string} Formatted date string
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format a Date object as YYYYMMDD for use in file names.
 * @param {Date} date
 * @returns {string} e.g. "20260601"
 */
function formatDateForFile(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Auto-generate the next available Student ID (e.g. "STU006").
 * Looks at trailing digits in existing IDs and picks max + 1.
 * @returns {string} New unique Student ID
 */
function generateStudentID() {
  const nums = students
    .map(s => { const m = s.id.match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `STU${String(next).padStart(3, '0')}`;
}

/**
 * Display today's date in the header.
 */
function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

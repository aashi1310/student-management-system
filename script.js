/**
 * =========================================================
 * Student Management System — script.js
 * Author: Senior Frontend Developer
 * Description: Full CRUD with LocalStorage, Search, Sort,
 *   Filter, Dark Mode, CSV Export/Import, Toasts, Validation
 * =========================================================
 */

/* ─── LOCAL STORAGE KEYS ─── */
const LS_STUDENTS = 'students';
const LS_THEME    = 'theme';

/* ─── STATE ─── */
let students      = [];          // master array
let filteredList  = [];          // displayed array
let editingId     = null;        // id of student being edited
let deleteTarget  = null;        // id pending deletion
let sortField     = null;        // current sort field
let sortDir       = 'asc';       // 'asc' | 'desc'
let searchQuery   = '';
let filterSem     = 'all';

/* ─── SAMPLE DATA ─── */
const SAMPLE_STUDENTS = [
  { id:'STU001', name:'Aashika Jain',    email:'aashika@gmail.com',   course:'B.Tech CSE',        semester:5, phone:'9876543210', createdAt:'2026-01-15' },
  { id:'STU002', name:'Rohan Sharma',    email:'rohan.s@gmail.com',   course:'BCA',               semester:3, phone:'9988776655', createdAt:'2026-02-20' },
  { id:'STU003', name:'Priya Mehta',     email:'priya.m@yahoo.com',   course:'B.Sc IT',           semester:6, phone:'8765432109', createdAt:'2026-03-05' },
  { id:'STU004', name:'Arjun Patel',     email:'arjun.p@outlook.com', course:'B.Tech ECE',        semester:2, phone:'7654321098', createdAt:'2026-04-10' },
  { id:'STU005', name:'Kavya Reddy',     email:'kavya.r@gmail.com',   course:'MBA',               semester:1, phone:'9123456780', createdAt:'2026-05-22' },
];

/* =========================================================
   INITIALISE
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  setCurrentDate();
  loadStudents();
  renderStudents();
  updateDashboard();
  document.getElementById('student-form').addEventListener('submit', handleFormSubmit);
});

/* =========================================================
   LOCAL STORAGE
========================================================= */

/** Load students from LocalStorage; seed sample data if empty */
function loadStudents() {
  const raw = localStorage.getItem(LS_STUDENTS);
  if (raw) {
    try { students = JSON.parse(raw); }
    catch { students = []; }
  }
  if (!students.length) {
    students = SAMPLE_STUDENTS.map(s => ({ ...s }));
    saveStudents();
  }
}

/** Persist students array to LocalStorage */
function saveStudents() {
  localStorage.setItem(LS_STUDENTS, JSON.stringify(students));
}

/* =========================================================
   RENDER
========================================================= */

/** Build and inject table rows from filteredList */
function renderStudents() {
  buildFilteredList();
  const tbody       = document.getElementById('students-tbody');
  const emptyState  = document.getElementById('empty-state');
  const table       = document.getElementById('students-table');
  const recordCount = document.getElementById('record-count');

  tbody.innerHTML = '';

  if (!filteredList.length) {
    table.style.display    = 'none';
    emptyState.hidden      = false;
    recordCount.textContent = '';
    return;
  }

  table.style.display    = '';
  emptyState.hidden      = true;
  recordCount.textContent = `${filteredList.length} record${filteredList.length !== 1 ? 's' : ''}`;

  filteredList.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.className = 'table-row-enter';
    tr.style.animationDelay = `${i * 30}ms`;
    tr.dataset.id = s.id;
    tr.innerHTML = `
      <td><span class="student-id-badge">${escapeHTML(s.id)}</span></td>
      <td>${escapeHTML(s.name)}</td>
      <td>${escapeHTML(s.email)}</td>
      <td>${escapeHTML(s.course)}</td>
      <td><span class="semester-badge">${escapeHTML(String(s.semester))}</span></td>
      <td>${escapeHTML(s.phone)}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td class="td-actions">
        <button class="btn btn-edit" onclick="editStudent('${escapeHTML(s.id)}')" title="Edit student" aria-label="Edit ${escapeHTML(s.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn btn-delete" onclick="deleteStudent('${escapeHTML(s.id)}')" title="Delete student" aria-label="Delete ${escapeHTML(s.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          Delete
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* =========================================================
   FILTER / SEARCH / SORT — build filteredList
========================================================= */

/** Combine search + semester filter + sort into filteredList */
function buildFilteredList() {
  const q = searchQuery.toLowerCase().trim();

  filteredList = students.filter(s => {
    // Semester filter
    if (filterSem !== 'all' && String(s.semester) !== filterSem) return false;
    // Search filter
    if (q) {
      return (
        s.id.toLowerCase().includes(q)     ||
        s.name.toLowerCase().includes(q)   ||
        s.email.toLowerCase().includes(q)  ||
        s.course.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }
    return true;
  });

  // Apply sort
  if (sortField) {
    filteredList.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'semester') { av = Number(av); bv = Number(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }
}

/** Called by search input */
function searchStudents() {
  searchQuery = document.getElementById('search-input').value;
  renderStudents();
}

/** Called by semester filter dropdown */
function filterStudents() {
  filterSem = document.getElementById('semester-filter').value;
  renderStudents();
}

/** Toggle sort by field; cycle asc/desc */
function sortStudents(field) {
  // Map field shorthand → student object key
  const fieldMap = { name: 'name', semester: 'semester', id: 'id' };
  const key = fieldMap[field];

  if (sortField === key) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = key;
    sortDir   = 'asc';
  }

  // Update button states and indicators
  ['name', 'semester', 'id'].forEach(f => {
    const btn  = document.getElementById(`sort-${f}`);
    const icon = document.getElementById(`sort-${f}-icon`);
    btn.classList.remove('active');
    if (icon) icon.textContent = '↕';
  });

  const activeBtn  = document.getElementById(`sort-${field}`);
  const activeIcon = document.getElementById(`sort-${field}-icon`);
  if (activeBtn)  activeBtn.classList.add('active');
  if (activeIcon) activeIcon.textContent = sortDir === 'asc' ? '↑' : '↓';

  renderStudents();
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

/** Recalculate and display all stat cards */
function updateDashboard() {
  document.getElementById('total-students').textContent = students.length;

  const courses = new Set(students.map(s => s.course.trim().toLowerCase()));
  document.getElementById('total-courses').textContent = courses.size;

  const maxSem = students.length
    ? Math.max(...students.map(s => Number(s.semester)))
    : 0;
  document.getElementById('highest-semester').textContent = maxSem || '—';

  if (students.length) {
    const latest = students.reduce((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? a : b
    );
    document.getElementById('latest-student').textContent = latest.name;
  } else {
    document.getElementById('latest-student').textContent = '—';
  }
}

/* =========================================================
   FORM — ADD / EDIT
========================================================= */

/** Main submit handler (delegates to add or update) */
function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  if (editingId) {
    updateStudent();
  } else {
    addStudent();
  }
}

/** Collect form values into a student object */
function collectFormData() {
  return {
    id:        document.getElementById('student-id').value.trim(),
    name:      document.getElementById('student-name').value.trim(),
    email:     document.getElementById('student-email').value.trim(),
    course:    document.getElementById('student-course').value.trim(),
    semester:  Number(document.getElementById('student-semester').value),
    phone:     document.getElementById('student-phone').value.trim(),
    createdAt: formatDate(new Date().toISOString().split('T')[0], 'store'),
  };
}

/** Add a new student record */
function addStudent() {
  const student = collectFormData();
  student.createdAt = new Date().toISOString().split('T')[0];
  students.push(student);
  saveStudents();
  renderStudents();
  updateDashboard();
  resetForm();
  showToast('success', 'Student Added', `${student.name} has been registered successfully.`);
}

/** Save edits to existing student */
function updateStudent() {
  const form    = collectFormData();
  const idx     = students.findIndex(s => s.id === editingId);
  if (idx === -1) { showToast('error', 'Error', 'Student not found.'); return; }

  // Preserve original createdAt and id
  const original = students[idx];
  students[idx] = { ...original, ...form, id: original.id, createdAt: original.createdAt };
  saveStudents();
  renderStudents();
  updateDashboard();
  resetForm();
  showToast('success', 'Student Updated', `${form.name}'s record has been updated.`);
}

/** Populate form with student data for editing */
function editStudent(id) {
  const s = students.find(s => s.id === id);
  if (!s) return;

  editingId = id;

  document.getElementById('student-id').value       = s.id;
  document.getElementById('student-id').disabled    = true;
  document.getElementById('student-name').value     = s.name;
  document.getElementById('student-email').value    = s.email;
  document.getElementById('student-course').value   = s.course;
  document.getElementById('student-semester').value = String(s.semester);
  document.getElementById('student-phone').value    = s.phone;

  document.getElementById('form-title').textContent    = 'Edit Student Record';
  document.getElementById('form-subtitle').textContent = 'Update student details below';
  document.getElementById('submit-btn-text').textContent = 'Update Student';
  document.getElementById('submit-btn').style.background =
    'linear-gradient(135deg, #f59e0b, #d97706)';
  document.getElementById('submit-btn').style.boxShadow = '0 4px 14px rgba(245,158,11,.35)';

  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('student-name').focus();
}

/** Initiate delete — show confirmation modal */
function deleteStudent(id) {
  const s = students.find(s => s.id === id);
  if (!s) return;
  deleteTarget = id;
  document.getElementById('modal-message').textContent =
    `You are about to permanently delete the record for "${s.name}" (${s.id}). This action cannot be undone.`;
  showModal();
}

/** Confirmed delete */
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
  showToast('success', 'Deleted', `${name}'s record has been removed.`);
}

/* =========================================================
   FORM VALIDATION
========================================================= */

const VALIDATORS = {
  'student-id': {
    validate(v) {
      if (!v) return 'Student ID is required.';
      if (v.length < 3) return 'Minimum 3 characters.';
      if (v.length > 15) return 'Maximum 15 characters.';
      if (!/^[a-zA-Z0-9]+$/.test(v)) return 'Only letters and numbers allowed.';
      if (!editingId && students.some(s => s.id.toLowerCase() === v.toLowerCase()))
        return 'Student ID already exists.';
      return '';
    }
  },
  'student-name': {
    validate(v) {
      if (!v) return 'Full Name is required.';
      if (v.length < 3) return 'Minimum 3 characters.';
      if (v.length > 50) return 'Maximum 50 characters.';
      if (/\d/.test(v)) return 'Numbers are not allowed in name.';
      return '';
    }
  },
  'student-email': {
    validate(v) {
      if (!v) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
      return '';
    }
  },
  'student-course': {
    validate(v) {
      if (!v) return 'Course is required.';
      if (v.length < 2) return 'Minimum 2 characters.';
      return '';
    }
  },
  'student-semester': {
    validate(v) {
      if (!v) return 'Please select a semester.';
      const n = Number(v);
      if (n < 1 || n > 8) return 'Semester must be 1–8.';
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

/** Validate all fields; return true if form is valid */
function validateForm() {
  let valid = true;
  Object.entries(VALIDATORS).forEach(([id, vtor]) => {
    const input = document.getElementById(id);
    const err   = document.getElementById(`${id}-error`);
    if (!input || !err) return;

    // Skip ID validation when editing (field is disabled)
    if (id === 'student-id' && editingId) { clearFieldError(id); return; }

    const msg = vtor.validate(input.value.trim());
    if (msg) {
      showFieldError(id, msg);
      valid = false;
    } else {
      clearFieldError(id);
    }
  });
  return valid;
}

function showFieldError(id, msg) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}-error`);
  if (input) input.classList.add('is-error');
  if (err)   err.textContent = msg;
}

function clearFieldError(id) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}-error`);
  if (input) input.classList.remove('is-error');
  if (err)   err.textContent = '';
}

/** Attach real-time validation on blur */
document.addEventListener('DOMContentLoaded', () => {
  Object.keys(VALIDATORS).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => {
      if (id === 'student-id' && editingId) return;
      const msg = VALIDATORS[id].validate(input.value.trim());
      msg ? showFieldError(id, msg) : clearFieldError(id);
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) clearFieldError(id);
    });
  });
});

/* =========================================================
   RESET FORM
========================================================= */

/** Reset form to "Add" mode */
function resetForm() {
  editingId = null;
  document.getElementById('student-form').reset();
  document.getElementById('student-id').disabled = false;

  document.getElementById('form-title').textContent    = 'Add New Student';
  document.getElementById('form-subtitle').textContent = 'Fill in the details to register a student';
  document.getElementById('submit-btn-text').textContent = 'Add Student';
  document.getElementById('submit-btn').style.background = '';
  document.getElementById('submit-btn').style.boxShadow  = '';

  // Clear all error states
  Object.keys(VALIDATORS).forEach(id => clearFieldError(id));
}

/* =========================================================
   MODAL
========================================================= */

function showModal() {
  document.getElementById('delete-modal').classList.add('active');
  document.getElementById('modal-cancel-btn').focus();
}

function closeModal() {
  document.getElementById('delete-modal').classList.remove('active');
  deleteTarget = null;
}

// Close modal on overlay click
document.getElementById('delete-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Keyboard: Escape closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('delete-modal').classList.contains('active')) closeModal();
  }
});

/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */

const TOAST_ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

/**
 * Show a toast notification
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} title
 * @param {string} message
 * @param {number} duration  ms (default 3500)
 */
function showToast(type, title, message, duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-msg">${escapeHTML(message)}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss notification">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="toast-progress"></div>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  const timer = setTimeout(() => removeToast(toast), duration);
  toast.dataset.timer = timer;
}

function removeToast(toast) {
  clearTimeout(Number(toast.dataset.timer));
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* =========================================================
   DARK MODE
========================================================= */

/** Toggle between light and dark themes */
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next   = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(LS_THEME, next);
  showToast('info', `${next === 'dark' ? '🌙 Dark' : '☀️ Light'} Mode`, `Theme switched to ${next} mode.`, 2000);
}

/** Load stored theme on page load */
function applyStoredTheme() {
  const stored = localStorage.getItem(LS_THEME);
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme  = stored || prefer;
  document.documentElement.setAttribute('data-theme', theme);
}

/* =========================================================
   CSV EXPORT
========================================================= */

/** Export all student records as a CSV file */
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

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const a    = document.createElement('a');
  a.href     = url;
  a.download = `students_${formatDateForFile(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('success', 'Export Complete', `${students.length} record(s) exported to CSV.`);
}

/* =========================================================
   CSV IMPORT
========================================================= */

/** Import student records from a CSV file */
function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text  = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) {
      showToast('error', 'Invalid CSV', 'CSV must have a header row and at least one data row.');
      event.target.value = '';
      return;
    }

    // Expect header: Student ID,Full Name,Email,Course,Semester,Phone,Date Added
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s/g,''));
    const idIdx   = headers.indexOf('studentid');
    const nmIdx   = headers.indexOf('fullname');
    const emIdx   = headers.indexOf('email');
    const coIdx   = headers.indexOf('course');
    const smIdx   = headers.indexOf('semester');
    const phIdx   = headers.indexOf('phone');
    const dtIdx   = headers.indexOf('dateadded');

    if ([idIdx, nmIdx, emIdx, coIdx, smIdx, phIdx].some(i => i === -1)) {
      showToast('error', 'Invalid CSV Format', 'Required columns not found. Please use the exported CSV format.');
      event.target.value = '';
      return;
    }

    let added = 0, skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const id   = (cols[idIdx] || '').trim();
      const name = (cols[nmIdx] || '').trim();
      const email= (cols[emIdx] || '').trim();
      const course=(cols[coIdx] || '').trim();
      const sem  = Number((cols[smIdx] || '').trim());
      const phone= (cols[phIdx] || '').trim();
      const date = dtIdx !== -1 ? (cols[dtIdx] || '').trim() : new Date().toISOString().split('T')[0];

      // Basic validation
      if (!id || !name || !email || !course || isNaN(sem) || sem < 1 || sem > 8 || !phone) {
        skipped++;
        continue;
      }
      if (students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
        skipped++;
        continue;
      }

      students.push({ id, name, email, course, semester: sem, phone, createdAt: date });
      added++;
    }

    saveStudents();
    renderStudents();
    updateDashboard();
    event.target.value = '';

    if (added > 0)  showToast('success', 'Import Complete', `${added} record(s) imported.`);
    if (skipped > 0) showToast('warning', 'Some Skipped', `${skipped} row(s) skipped (invalid data or duplicate ID).`);
    if (added === 0 && skipped === 0) showToast('info', 'Nothing Imported', 'No valid records found in the file.');
  };

  reader.readAsText(file);
}

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

/** Escape HTML entities to prevent XSS */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wrap a CSV field in quotes if it contains commas/quotes/newlines */
function csvEscape(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Naive CSV line parser that handles quoted fields */
function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
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
 * Format a date string for display
 * @param {string} dateStr  YYYY-MM-DD
 * @param {'display'|'store'} mode
 */
function formatDate(dateStr, mode = 'display') {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date)) return dateStr;
  if (mode === 'store') return date.toISOString().split('T')[0];
  return date.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

/** Format a Date object as YYYYMMDD for filename */
function formatDateForFile(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/** Generate a unique Student ID based on existing records */
function generateStudentID() {
  const nums = students
    .map(s => {
      const match = s.id.match(/(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `STU${String(next).padStart(3, '0')}`;
}

/** Display today's date in the header */
function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

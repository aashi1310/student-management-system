/**
 * =========================================================
 * Student Management System — script.js
 * Author  : Senior Frontend Developer
 * Version : 3.0.0
 * Date    : 2026-06-11
 * Description:
 *   Full CRUD with Backend API, real-time Search,
 *   Sort, Filter, Dark Mode, CSV Export/Import,
 *   Custom Toasts, Form Validation, Dashboard Stats,
 *   Pagination, and Skeletons.
 * =========================================================
 */

'use strict';

/* ─── LOCAL STORAGE KEYS ─── */
const LS_THEME    = 'theme';

/* ─── APPLICATION STATE ─── */
let students     = [];     // Current page data
let editingId    = null;   // Student ID currently being edited (null = add mode)
let deleteTarget = null;   // Student ID pending deletion confirmation
let sortField    = 'createdAt';
let sortDir      = 'desc'; // 'asc' | 'desc'
let searchQuery  = '';     // Current search string
let filterSem    = 'all';
let filterBranch = 'all';
let filterPlacement = 'all';
let currentPage  = 1;
let totalPages   = 1;
let isFetching   = false;

/* =========================================================
   INITIALISE — run after DOM is ready
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();         // Must be first to prevent flash
  setCurrentDate();
  fetchStudents();
  updateDashboard();

  // Attach form submit handler
  document.getElementById('student-form').addEventListener('submit', handleFormSubmit);

  // Attach real-time field validation
  attachFieldValidators();
});

/* =========================================================
   API COMMUNICATION
========================================================= */

async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(endpoint, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
}

async function fetchStudents() {
  if (isFetching) return;
  isFetching = true;
  showSkeletonLoader();

  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10,
      q: searchQuery,
      branch: filterBranch,
      semester: filterSem,
      placementStatus: filterPlacement,
      sortField: sortField,
      sortDir: sortDir
    });

    const res = await apiRequest(`/api/students?${params.toString()}`);
    students = res.data;
    currentPage = res.currentPage;
    totalPages = res.totalPages;
    
    renderStudents();
    updatePaginationControls();
  } catch (err) {
    showToast('error', 'Fetch Error', err.message);
  } finally {
    isFetching = false;
  }
}

async function fetchDashboardStats() {
  try {
    const res = await apiRequest('/api/students/stats');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    return null;
  }
}

/* =========================================================
   RENDER
========================================================= */

function showSkeletonLoader() {
  const tbody = document.getElementById('students-tbody');
  const table = document.getElementById('students-table');
  const emptyState = document.getElementById('empty-state');
  
  table.style.display = '';
  emptyState.hidden = true;
  tbody.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="skeleton skeleton-text" style="width: 20px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 70px"></div></td>
      <td><div class="skeleton skeleton-avatar"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 120px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 150px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 90px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 40px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 70px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 80px"></div></td>
      <td><div class="skeleton skeleton-text" style="width: 120px"></div></td>
    `;
    tbody.appendChild(tr);
  }
}

function renderStudents() {
  const tbody       = document.getElementById('students-tbody');
  const emptyState  = document.getElementById('empty-state');
  const table       = document.getElementById('students-table');
  const recordCount = document.getElementById('record-count');

  tbody.innerHTML = '';

  if (!students.length) {
    table.style.display     = 'none';
    emptyState.hidden       = false;
    recordCount.textContent = '';
    return;
  }

  table.style.display     = '';
  emptyState.hidden       = true;

  // Build each table row
  students.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.className          = 'table-row-enter';
    tr.style.animationDelay = `${i * 28}ms`;
    tr.dataset.id         = s._id;

    const rowNum = (currentPage - 1) * 10 + i + 1;
    const initial = s.name ? s.name.charAt(0).toUpperCase() : '?';
    const avatarHtml = s.photoUrl 
      ? `<img src="${escapeHTML(s.photoUrl)}" class="avatar" alt="${escapeHTML(s.name)}" onerror="this.outerHTML='<div class=\\'avatar\\'>${initial}</div>'" />`
      : `<div class="avatar">${initial}</div>`;
      
    const placementBadge = s.placementStatus === 'Eligible' 
      ? `<span class="badge-eligible">Eligible</span>`
      : `<span class="badge-not-eligible">Not Eligible</span>`;

    tr.innerHTML = `
      <td class="td-num">${rowNum}</td>
      <td><span class="student-id-badge">${escapeHTML(s.studentId)}</span></td>
      <td class="avatar-cell">${avatarHtml}</td>
      <td><a href="/profile.html?id=${escapeHTML(s._id)}" style="text-decoration:none; color:inherit;"><strong>${escapeHTML(s.name)}</strong></a></td>
      <td class="td-email">${escapeHTML(s.email)}</td>
      <td>${escapeHTML(s.course)}</td>
      <td><span class="semester-badge" title="Semester ${escapeHTML(String(s.semester))}">${escapeHTML(String(s.semester))}</span></td>
      <td>${placementBadge}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td class="td-actions">
        <button class="btn btn-edit"
          onclick="editStudent('${escapeHTML(s._id)}')"
          title="Edit ${escapeHTML(s.name)}"
          aria-label="Edit ${escapeHTML(s.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn btn-delete"
          onclick="deleteStudent('${escapeHTML(s._id)}')"
          title="Delete ${escapeHTML(s.name)}"
          aria-label="Delete ${escapeHTML(s.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          Delete
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function updatePaginationControls() {
  const paginationControls = document.getElementById('pagination-controls');
  if (totalPages > 1) {
    paginationControls.hidden = false;
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('page-prev').disabled = currentPage === 1;
    document.getElementById('page-next').disabled = currentPage === totalPages;
  } else {
    paginationControls.hidden = true;
  }
}

function changePage(delta) {
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    fetchStudents();
  }
}

/* =========================================================
   FILTER + SEARCH + SORT
========================================================= */

function searchStudents() {
  searchQuery = document.getElementById('search-input').value;
  currentPage = 1;
  fetchStudents();
}

function filterStudents() {
  filterBranch = document.getElementById('branch-filter').value;
  filterSem = document.getElementById('semester-filter').value;
  filterPlacement = document.getElementById('placement-filter').value;
  currentPage = 1;
  fetchStudents();
}

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

  currentPage = 1;
  fetchStudents();
}

/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

async function updateDashboard() {
  const stats = await fetchDashboardStats();
  if (!stats) return;

  document.getElementById('total-students').textContent = stats.totalStudents;
  document.getElementById('total-courses').textContent = stats.totalCourses || '—';
  
  // Placement Eligibility
  document.getElementById('placement-eligible').textContent = stats.placementEligible || '0';
  document.getElementById('students-backlogs').textContent = stats.studentsWithBacklogs || '0';
  document.getElementById('average-cgpa').textContent = stats.avgCgpa || '0.0';
}

/* =========================================================
   CRUD — ADD / UPDATE
========================================================= */

function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;
  editingId ? updateStudentRecord() : addStudent();
}

function collectFormData() {
  return {
    studentId: document.getElementById('student-id').value.trim(),
    name:      document.getElementById('student-name').value.trim(),
    email:     document.getElementById('student-email').value.trim().toLowerCase(),
    course:    document.getElementById('student-course').value.trim(),
    semester:  Number(document.getElementById('student-semester').value),
    phone:     document.getElementById('student-phone').value.trim(),
    cgpa:      Number(document.getElementById('student-cgpa').value) || 0,
    activeBacklogs: Number(document.getElementById('student-backlogs').value) || 0,
    skills:    document.getElementById('student-skills').value.split(',').map(s => s.trim()).filter(s => s),
    photoUrl:  document.getElementById('student-photo').value.trim(),
  };
}

async function addStudent() {
  const studentData = collectFormData();
  try {
    const res = await apiRequest('/api/students', 'POST', studentData);
    showToast('success', 'Student Added', `${res.data.name} has been registered successfully.`);
    resetForm();
    currentPage = 1;
    fetchStudents();
    updateDashboard();
  } catch (err) {
    showToast('error', 'Creation Failed', err.message);
  }
}

async function updateStudentRecord() {
  const formData = collectFormData();
  try {
    const res = await apiRequest(`/api/students/${editingId}`, 'PUT', formData);
    showToast('success', 'Record Updated', `${res.data.name}'s record has been updated.`);
    resetForm();
    fetchStudents();
    updateDashboard();
  } catch (err) {
    showToast('error', 'Update Failed', err.message);
  }
}

function editStudent(id) {
  const s = students.find(s => s._id === id);
  if (!s) return;

  editingId = id;

  // Fill form fields
  document.getElementById('student-id').value       = s.studentId;
  document.getElementById('student-id').disabled    = true;
  document.getElementById('student-name').value     = s.name;
  document.getElementById('student-email').value    = s.email;
  document.getElementById('student-course').value   = s.course;
  document.getElementById('student-semester').value = String(s.semester);
  document.getElementById('student-phone').value    = s.phone;
  document.getElementById('student-cgpa').value     = s.cgpa;
  document.getElementById('student-backlogs').value = s.activeBacklogs;
  document.getElementById('student-skills').value   = s.skills ? s.skills.join(', ') : '';
  document.getElementById('student-photo').value    = s.photoUrl || '';

  // Update form UI to "edit" mode
  document.getElementById('form-title').textContent      = 'Edit Student Record';
  document.getElementById('form-subtitle').textContent   = `Updating record for ${s.name}`;
  document.getElementById('submit-btn-text').textContent = 'Update Student';
  document.getElementById('edit-badge').hidden           = false;

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.classList.add('update-mode');

  document.getElementById('form-section').classList.add('editing-mode');
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => document.getElementById('student-name').focus(), 400);

  showToast('info', 'Edit Mode', `Editing record for ${s.name}. Update the fields and click "Update Student".`, 3000);
}

/* =========================================================
   CRUD — DELETE
========================================================= */

function deleteStudent(id) {
  const s = students.find(s => s._id === id);
  if (!s) return;
  deleteTarget = id;
  document.getElementById('modal-message').textContent =
    `You are about to permanently delete the record for "${s.name}" (${s.studentId}). This action cannot be undone.`;
  showModal();
}

async function confirmDelete() {
  if (!deleteTarget) return;
  try {
    const res = await apiRequest(`/api/students/${deleteTarget}`, 'DELETE');
    showToast('success', 'Record Deleted', res.message);
    deleteTarget = null;
    closeModal();
    fetchStudents();
    updateDashboard();
  } catch (err) {
    showToast('error', 'Delete Failed', err.message);
    closeModal();
  }
}

/* =========================================================
   FORM VALIDATION
========================================================= */

const VALIDATORS = {
  'student-id': {
    validate(v) {
      if (!v)          return 'Student ID is required.';
      if (v.length < 3) return 'Minimum 3 characters required.';
      if (v.length > 15) return 'Maximum 15 characters allowed.';
      if (!/^[a-zA-Z0-9]+$/.test(v)) return 'Only letters and numbers are allowed.';
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
  },
  'student-cgpa': {
    validate(v) {
      if (v === '') return 'CGPA is required.';
      const n = Number(v);
      if (n < 0 || n > 10) return 'CGPA must be between 0 and 10.';
      return '';
    }
  },
  'student-backlogs': {
    validate(v) {
      if (v === '') return 'Active backlogs is required.';
      const n = Number(v);
      if (n < 0 || !Number.isInteger(n)) return 'Must be a valid integer.';
      return '';
    }
  }
};

function validateForm() {
  let valid = true;
  Object.entries(VALIDATORS).forEach(([id, validator]) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (id === 'student-id' && editingId) { clearFieldError(id); return; }
    const msg = validator.validate(input.value.trim());
    if (msg) { showFieldError(id, msg); valid = false; }
    else       { clearFieldError(id); }
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

function attachFieldValidators() {
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
}

/* =========================================================
   RESET FORM
========================================================= */

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

  Object.keys(VALIDATORS).forEach(id => clearFieldError(id));
}

/* =========================================================
   MODAL
========================================================= */

function showModal() {
  document.getElementById('delete-modal').classList.add('active');
  setTimeout(() => document.getElementById('modal-cancel-btn').focus(), 80);
}

function closeModal() {
  document.getElementById('delete-modal').classList.remove('active');
  deleteTarget = null;
}

document.getElementById('delete-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('delete-modal').classList.contains('active')) {
    closeModal();
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

window.showToast = function showToast(type, title, message, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
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

function removeToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* =========================================================
   DARK MODE
========================================================= */

window.toggleDarkMode = function toggleDarkMode() {
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

function applyStoredTheme() {
  const stored = localStorage.getItem(LS_THEME);
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme  = stored || prefer;
  document.documentElement.setAttribute('data-theme', theme);
}

/* =========================================================
   UTILITIES
========================================================= */

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

/* =========================================================
   CSV EXPORT / IMPORT
========================================================= */

async function exportCSV() {
  try {
    showToast('info', 'Exporting', 'Fetching all records for export...');
    const res = await apiRequest('/api/students?limit=10000');
    const allStudents = res.data;
    
    if (!allStudents.length) {
      showToast('warning', 'Nothing to Export', 'Add some student records first.');
      return;
    }

    const headers = ['Student ID', 'Full Name', 'Email', 'Course', 'Semester', 'Phone', 'CGPA', 'Active Backlogs', 'Skills', 'Placement Status', 'Date Added'];
    const rows    = allStudents.map(s => [
      csvEscape(s.studentId),
      csvEscape(s.name),
      csvEscape(s.email),
      csvEscape(s.course),
      s.semester,
      csvEscape(s.phone),
      s.cgpa,
      s.activeBacklogs,
      csvEscape(s.skills ? s.skills.join('; ') : ''),
      csvEscape(s.placementStatus),
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
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', 'Export Complete', `${allStudents.length} record(s) exported successfully.`);
  } catch(err) {
    showToast('error', 'Export Failed', err.message);
  }
}

function csvEscape(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

window.exportCSV = exportCSV;

/* Empty csv import for now, not implementing full backend bulk import logic */
window.importCSV = function importCSV(event) {
  showToast('info', 'Feature Unavailable', 'CSV import is currently disabled in API mode.');
  event.target.value = '';
}

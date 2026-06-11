document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    document.getElementById('profile-container').innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--clr-danger);">No student ID provided in URL</div>';
    return;
  }

  try {
    const response = await fetch(`/api/students/${studentId}`);
    const res = await response.json();
    if (res.success) {
      renderProfile(res.data);
    } else {
      document.getElementById('profile-container').innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--clr-danger);">${escapeHTML(res.message)}</div>`;
    }
  } catch (err) {
    document.getElementById('profile-container').innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--clr-danger);">${escapeHTML(err.message)}</div>`;
  }
});

function renderProfile(student) {
  const container = document.getElementById('profile-container');
  
  const initial = student.name ? student.name.charAt(0).toUpperCase() : '?';
  const avatarHtml = student.photoUrl 
    ? `<img src="${escapeHTML(student.photoUrl)}" class="avatar avatar-lg" alt="${escapeHTML(student.name)}" onerror="this.outerHTML='<div class=\\'avatar avatar-lg\\'>${initial}</div>'" />`
    : `<div class="avatar avatar-lg">${initial}</div>`;
    
  const placementBadge = student.placementStatus === 'Eligible' 
    ? `<span class="badge-eligible">Eligible for Placement</span>`
    : `<span class="badge-not-eligible">Not Eligible for Placement</span>`;

  const skillsHtml = student.skills && student.skills.length > 0
    ? student.skills.map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`).join('')
    : '<span style="color: var(--clr-text-muted); font-size: 0.85rem;">No skills listed</span>';

  container.innerHTML = `
    <div class="profile-header">
      ${avatarHtml}
      <h2 class="profile-name">${escapeHTML(student.name)}</h2>
      <div class="profile-id">${escapeHTML(student.studentId)}</div>
      <div style="margin-bottom: 1.5rem;">${placementBadge}</div>
    </div>
    
    <div style="border-top: 1px solid var(--clr-border); margin: 1.5rem 0;"></div>
    
    <div class="profile-grid">
      <div>
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--clr-text-primary);">Academic Information</h3>
        <div class="info-group">
          <div class="info-label">Course</div>
          <div class="info-value">${escapeHTML(student.course)}</div>
        </div>
        <div class="info-group">
          <div class="info-label">Semester</div>
          <div class="info-value">${escapeHTML(String(student.semester))}</div>
        </div>
        <div class="info-group">
          <div class="info-label">CGPA</div>
          <div class="info-value">${student.cgpa.toFixed(2)}</div>
        </div>
        <div class="info-group">
          <div class="info-label">Active Backlogs</div>
          <div class="info-value">${student.activeBacklogs}</div>
        </div>
      </div>
      
      <div>
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--clr-text-primary);">Contact Information</h3>
        <div class="info-group">
          <div class="info-label">Email</div>
          <div class="info-value"><a href="mailto:${escapeHTML(student.email)}" style="color: var(--clr-primary); text-decoration: none;">${escapeHTML(student.email)}</a></div>
        </div>
        <div class="info-group">
          <div class="info-label">Phone</div>
          <div class="info-value">${escapeHTML(student.phone)}</div>
        </div>
        <div class="info-group">
          <div class="info-label">Registered Date</div>
          <div class="info-value">${formatDate(student.createdAt)}</div>
        </div>
        
        <h3 style="font-size: 1.1rem; margin: 1.5rem 0 1rem; color: var(--clr-text-primary);">Skills & Expertise</h3>
        <div class="skills-list">
          ${skillsHtml}
        </div>
      </div>
    </div>
  `;
}

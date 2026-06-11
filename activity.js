document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/logs');
    const res = await response.json();
    if (res.success) {
      renderLogs(res.data);
    } else {
      showToast('error', 'Error', 'Failed to load activity logs');
    }
  } catch (err) {
    showToast('error', 'Error', err.message);
  }
});

function renderLogs(logs) {
  const timeline = document.getElementById('activity-timeline');
  timeline.innerHTML = '';
  
  if (!logs.length) {
    timeline.innerHTML = '<li style="color: var(--clr-text-secondary);">No activity logs found.</li>';
    return;
  }

  logs.forEach(log => {
    const li = document.createElement('li');
    li.className = 'timeline-item';
    
    const date = new Date(log.timestamp);
    const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    li.innerHTML = `
      <div class="timeline-icon"></div>
      <div class="timeline-content">
        <div class="timeline-time">${timeString}</div>
        <div style="font-weight: 600; color: var(--clr-text-primary); margin-bottom: 0.25rem;">${escapeHTML(log.action)}</div>
        <div style="font-size: 0.85rem; color: var(--clr-text-secondary);">
          Student: <strong>${escapeHTML(log.studentName)}</strong> (${escapeHTML(log.studentId)})
        </div>
      </div>
    `;
    timeline.appendChild(li);
  });
}

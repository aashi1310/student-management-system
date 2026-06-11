document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/analytics');
    const res = await response.json();
    if (res.success) {
      renderCharts(res.data);
    } else {
      showToast('error', 'Error', 'Failed to load analytics data');
    }
  } catch (err) {
    showToast('error', 'Error', err.message);
  }
});

function renderCharts(data) {
  // 1. Branch Distribution Chart (Pie)
  const ctxBranch = document.getElementById('branchDistributionChart').getContext('2d');
  new Chart(ctxBranch, {
    type: 'pie',
    data: {
      labels: data.branchDistribution.map(d => d._id || 'Unknown'),
      datasets: [{
        data: data.branchDistribution.map(d => d.count),
        backgroundColor: [
          '#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });

  // 2. Average CGPA by Branch (Bar)
  const ctxCgpa = document.getElementById('avgCgpaChart').getContext('2d');
  new Chart(ctxCgpa, {
    type: 'bar',
    data: {
      labels: data.averageCgpaByBranch.map(d => d._id || 'Unknown'),
      datasets: [{
        label: 'Average CGPA',
        data: data.averageCgpaByBranch.map(d => d.avgCgpa),
        backgroundColor: '#4f46e5',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 10 }
      }
    }
  });

  // 3. Placement Eligibility by Branch (Stacked Bar)
  const placementBranches = Object.keys(data.placementEligibilityByBranch);
  const eligibleData = placementBranches.map(b => data.placementEligibilityByBranch[b]['Eligible'] || 0);
  const notEligibleData = placementBranches.map(b => data.placementEligibilityByBranch[b]['Not Eligible'] || 0);

  const ctxPlacement = document.getElementById('placementEligibilityChart').getContext('2d');
  new Chart(ctxPlacement, {
    type: 'bar',
    data: {
      labels: placementBranches,
      datasets: [
        {
          label: 'Eligible',
          data: eligibleData,
          backgroundColor: '#10b981',
          borderRadius: 4
        },
        {
          label: 'Not Eligible',
          data: notEligibleData,
          backgroundColor: '#ef4444',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

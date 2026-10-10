/* ==========================================================================
   Main Application State & Controller Script (FDMS)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Global Mock Data State
  window.FDMSState = {
    currentUser: {
      name: 'kaushik ',
      email: 'kaushikkillamsetty@fdms.cyber',
      role: 'Lead Security Analyst',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    creators: [
      { id: 'CR-101', name: 'Aria Sterling', platform: 'Instagram', category: 'Fashion & Style', followers: '1.4M', engagement: '1.8%', status: 'High Risk' },
      { id: 'CR-102', name: 'NovaTech Reviews', platform: 'YouTube', category: 'Technology', followers: '850K', engagement: '8.4%', status: 'Safe' },
      { id: 'CR-103', name: 'CyberGamer_00', platform: 'Twitch', category: 'Gaming', followers: '420K', engagement: '4.2%', status: 'Moderate Risk' },
      { id: 'CR-104', name: 'Elena FitLife', platform: 'TikTok', category: 'Fitness', followers: '2.1M', engagement: '1.1%', status: 'High Risk' },
      { id: 'CR-105', name: 'Marcus Vlogs', platform: 'YouTube', category: 'Travel', followers: '620K', engagement: '6.9%', status: 'Safe' }
    ],
    videos: [
      { id: 'VID-901', title: 'SECRET AI HACKS 2026 🔥', platform: 'YouTube', views: '1,420,000', likes: '142,000', comments: '12,400', date: '2026-07-28' },
      { id: 'VID-902', title: 'Summer Fashion Try-On Haul', platform: 'Instagram', views: '890,000', likes: '12,000', comments: '450', date: '2026-07-25' },
      { id: 'VID-903', title: '10 Min Ab Workout Challenge', platform: 'TikTok', views: '2,400,000', likes: '84,000', comments: '1,200', date: '2026-07-20' },
      { id: 'VID-904', title: 'Unboxing Quantum Phone 15', platform: 'YouTube', views: '510,000', likes: '48,000', comments: '3,800', date: '2026-07-15' }
    ],
    reports: [
      { id: 'REP-8801', creator: 'Aria Sterling', reason: 'Abnormal follower spike + 82% bot likes', score: 88.5, date: '2026-07-30' },
      { id: 'REP-8802', creator: 'Elena FitLife', reason: 'Comment farm syndication detected', score: 79.2, date: '2026-07-29' },
      { id: 'REP-8803', creator: 'CyberGamer_00', reason: 'Suspicious twitch viewbotting clusters', score: 54.0, date: '2026-07-24' }
    ],
    notifications: [
      { id: 1, title: 'High Risk Creator Flagged', desc: 'Aria Sterling reached an 88.5% anomaly score', time: '10 mins ago', unread: true },
      { id: 2, title: 'Bot Farm Cluster Discovered', desc: '14,000 automated Instagram profiles identified', time: '1 hour ago', unread: true },
      { id: 3, title: 'Weekly Report Ready', desc: 'Executive threat summary for July 2026 compiled', time: '5 hours ago', unread: false }
    ]
  };

  // --- SPA Navigation & Routing System ---
  function navigateTo(viewId) {
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
      window.scrollTo(0, 0);
    }

    // Update sidebar navigation link states
    const navLinks = document.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    document.querySelector('.sidebar')?.classList.remove('mobile-open');

    // Trigger chart initializations upon tab switch
    if (viewId === 'view-dashboard') {
      setTimeout(() => window.FDMSCharts.initDashboardCharts(), 100);
    } else if (viewId === 'view-analytics') {
      setTimeout(() => window.FDMSCharts.initAnalyticsCharts(), 100);
    } else if (viewId === 'view-database') {
      setTimeout(() => window.FDMSDatabase.renderTableSchemas('db-schema-container'), 100);
    } else if (viewId === 'view-detection') {
      setTimeout(() => {
        const initial = window.FDMSDetection.analyzeHandle('@aria_sterling', 'Instagram');
        window.FDMSDetection.renderAnalysisResults(initial);
      }, 100);
    }
  }

  // Bind Navigation Clicks
  document.querySelectorAll('[data-view]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = trigger.getAttribute('data-view');
      if (viewId) navigateTo(viewId);
    });
  });

  // Mobile Nav Toggle
  document.querySelector('.mobile-nav-toggle')?.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.toggle('mobile-open');
  });

  // --- Profile Dropdown Toggle ---
  const profileTrigger = document.getElementById('profile-dropdown-trigger');
  const profileMenu = document.getElementById('profile-dropdown-menu');

  if (profileTrigger && profileMenu) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      profileMenu.classList.remove('show');
    });
  }

  // --- Notification Drawer Toggle ---
  const notifBtn = document.getElementById('topbar-notif-btn');
  const notifDrawer = document.getElementById('notification-drawer');
  const closeNotifBtn = document.getElementById('close-notif-drawer');

  if (notifBtn && notifDrawer) {
    notifBtn.addEventListener('click', () => notifDrawer.classList.toggle('open'));
    closeNotifBtn?.addEventListener('click', () => notifDrawer.classList.remove('open'));
  }

  // --- Light & Dark Theme Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      showToast(isLight ? 'Switched to Light Cyber Theme' : 'Switched to Obsidian Dark Theme');
    });
  }

  // --- Toast Notification System ---
  function showToast(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    const icon = type === 'danger' ? 'fa-exclamation-triangle text-danger' : 'fa-info-circle text-neon';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
  window.showToast = showToast;

  // --- Render Tables & Dynamic Views ---
  function renderCreatorTable() {
    const tbody = document.getElementById('creator-table-body');
    if (!tbody) return;

    tbody.innerHTML = window.FDMSState.creators.map(c => `
      <tr>
        <td><code>${c.id}</code></td>
        <td>
          <div class="user-cell">
            <div class="user-avatar" style="background:var(--grad-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">
              ${c.name.charAt(0)}
            </div>
            <strong>${c.name}</strong>
          </div>
        </td>
        <td><i class="fab fa-${c.platform.toLowerCase()} text-neon"></i> ${c.platform}</td>
        <td>${c.category}</td>
        <td>${c.followers}</td>
        <td><strong class="text-neon">${c.engagement}</strong></td>
        <td><span class="badge ${c.status === 'Safe' ? 'badge-safe' : (c.status === 'Moderate Risk' ? 'badge-moderate' : 'badge-danger')}">${c.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="showToast('Editing ${c.name}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteCreator('${c.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  window.deleteCreator = function(id) {
    window.FDMSState.creators = window.FDMSState.creators.filter(c => c.id !== id);
    renderCreatorTable();
    showToast(`Creator ${id} deleted`, 'danger');
  };

  function renderVideoGrid() {
    const grid = document.getElementById('video-cards-grid');
    if (!grid) return;

    grid.innerHTML = window.FDMSState.videos.map(v => `
      <div class="glass-card" style="padding:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <span class="badge badge-neon"><i class="fab fa-${v.platform.toLowerCase()}"></i> ${v.platform}</span>
          <small class="text-dim">${v.date}</small>
        </div>
        <h4 style="margin-bottom:1rem;font-size:1.1rem;">${v.title}</h4>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;text-align:center;background:rgba(0,0,0,0.2);padding:0.75rem;border-radius:8px;margin-bottom:1rem;">
          <div><small class="text-muted">Views</small><div><strong>${v.views}</strong></div></div>
          <div><small class="text-muted">Likes</small><div><strong class="text-neon">${v.likes}</strong></div></div>
          <div><small class="text-muted">Comments</small><div><strong>${v.comments}</strong></div></div>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-sm btn-outline-neon" style="flex:1;" onclick="showToast('Analyzing video ${v.id}')"><i class="fas fa-microchip"></i> Analyze</button>
          <button class="btn btn-sm btn-danger" onclick="showToast('Video ${v.id} deleted', 'danger')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  function renderReportsTable() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    tbody.innerHTML = window.FDMSState.reports.map(r => `
      <tr>
        <td><code>${r.id}</code></td>
        <td><strong>${r.creator}</strong></td>
        <td class="text-muted">${r.reason}</td>
        <td><strong class="text-danger">${r.score}%</strong></td>
        <td>${r.date}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="downloadPDFReport('${r.id}')"><i class="fas fa-file-pdf"></i> Export PDF</button>
        </td>
      </tr>
    `).join('');
  }

  window.downloadPDFReport = function(reportId) {
    showToast(`Exporting Official Audit PDF Report: ${reportId}...`);
    setTimeout(() => {
      showToast(`Report ${reportId} exported successfully!`, 'info');
    }, 1200);
  };

  // Run initial renders
  renderCreatorTable();
  renderVideoGrid();
  renderReportsTable();

  // Search Filter Handler
  document.getElementById('global-search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length > 1) {
      showToast(`Filtering metrics for "${query}"`);
    }
  });

  // Detection Run Button Handler
  document.getElementById('run-detection-btn')?.addEventListener('click', () => {
    const handleInput = document.getElementById('detection-handle-input')?.value || '@aria_sterling';
    const platformSelect = document.getElementById('detection-platform-select')?.value || 'Instagram';
    
    showToast(`Running AI engagement scan for ${handleInput}...`);

    setTimeout(() => {
      const results = window.FDMSDetection.analyzeHandle(handleInput, platformSelect);
      window.FDMSDetection.renderAnalysisResults(results);
      showToast(`Scan complete for ${handleInput}! Risk: ${results.statusLabel}`);
    }, 800);
  });

  // Default initial view: Landing Page
  navigateTo('view-landing');
});

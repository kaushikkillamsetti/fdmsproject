/* ==========================================================================
   Fake Detection Engine Module Logic
   ========================================================================== */
window.FDMSDetection = {
  analyzeHandle: function(handle, platform) {
    if (!handle) handle = '@cyber_influencer_x';
    
    // Simulate algorithmic calculation based on string hash + random variance
    let hash = 0;
    for (let i = 0; i < handle.length; i++) hash = handle.charCodeAt(i) + ((hash << 5) - hash);
    const positiveHash = Math.abs(hash);

    const suspiciousScore = Math.min(98, Math.max(12, (positiveHash % 85) + 10));
    const confidenceScore = Math.min(99, Math.max(88, 90 + (positiveHash % 10)));
    
    const followersBase = (positiveHash % 500) * 1000 + 45000;
    const fakeFollowerPct = (suspiciousScore * 0.75).toFixed(1);
    const fakeFollowersCount = Math.round(followersBase * (fakeFollowerPct / 100));

    const fakeLikesCount = Math.round(fakeFollowersCount * 0.42);
    const fakeCommentsCount = Math.round(fakeLikesCount * 0.18);

    let statusLabel = 'Safe';
    let badgeClass = 'badge-safe';
    if (suspiciousScore > 40 && suspiciousScore <= 70) {
      statusLabel = 'Moderate Risk';
      badgeClass = 'badge-moderate';
    } else if (suspiciousScore > 70) {
      statusLabel = 'High Risk';
      badgeClass = 'badge-danger';
    }

    return {
      handle,
      platform,
      suspiciousScore,
      confidenceScore,
      followersBase,
      fakeFollowersCount,
      fakeLikesCount,
      fakeCommentsCount,
      statusLabel,
      badgeClass
    };
  },

  renderAnalysisResults: function(results) {
    // Update Score Circle & Value
    const scoreVal = document.getElementById('det-score-val');
    const scoreCircle = document.getElementById('det-score-circle');
    const statusBadge = document.getElementById('det-status-badge');

    if (scoreVal) scoreVal.textContent = `${results.suspiciousScore}%`;
    if (statusBadge) {
      statusBadge.textContent = results.statusLabel;
      statusBadge.className = `badge ${results.badgeClass}`;
    }

    if (scoreCircle) {
      // Stroke dashoffset: 400 is 0%, 0 is 100%
      const offset = 400 - (400 * (results.suspiciousScore / 100));
      scoreCircle.style.strokeDashoffset = offset;
    }

    // Update Counts
    const elLikes = document.getElementById('det-fake-likes');
    const elFollowers = document.getElementById('det-fake-followers');
    const elComments = document.getElementById('det-fake-comments');
    const elConfidence = document.getElementById('det-ai-confidence');

    if (elLikes) elLikes.textContent = results.fakeLikesCount.toLocaleString();
    if (elFollowers) elFollowers.textContent = results.fakeFollowersCount.toLocaleString();
    if (elComments) elComments.textContent = results.fakeCommentsCount.toLocaleString();
    if (elConfidence) elConfidence.textContent = `${results.confidenceScore}%`;

    // Render Heatmap
    this.renderHeatmap();
  },

  renderHeatmap: function() {
    const container = document.getElementById('det-heatmap-container');
    if (!container) return;

    container.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    days.forEach(day => {
      for (let h = 0; h < 24; h += 4) {
        const cell = document.createElement('div');
        const lvl = Math.floor(Math.random() * 5);
        cell.className = `heatmap-cell heat-lvl-${lvl}`;
        cell.title = `${day} ${h}:00 - Risk Level ${lvl}`;
        cell.textContent = `${h}h`;
        container.appendChild(cell);
      }
    });
  }
};

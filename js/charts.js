/* ==========================================================================
   Chart.js Initialization & Visualizations
   ========================================================================== */
window.FDMSCharts = {
  instances: {},

  initDashboardCharts: function() {
    this.initMonthlyStatsChart();
    this.initPlatformDistributionChart();
    this.initDetectionBreakdownChart();
  },

  initMonthlyStatsChart: function() {
    const ctx = document.getElementById('chart-monthly-stats')?.getContext('2d');
    if (!ctx) return;

    if (this.instances.monthlyStats) this.instances.monthlyStats.destroy();

    const gradCyan = ctx.createLinearGradient(0, 0, 0, 300);
    gradCyan.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    gradCyan.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    const gradPurple = ctx.createLinearGradient(0, 0, 0, 300);
    gradPurple.addColorStop(0, 'rgba(157, 78, 221, 0.4)');
    gradPurple.addColorStop(1, 'rgba(157, 78, 221, 0.0)');

    this.instances.monthlyStats = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Fake Accounts Detected',
            data: [320, 450, 580, 510, 720, 890, 1050, 1240],
            borderColor: '#00f0ff',
            backgroundColor: gradCyan,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#00f0ff',
            pointRadius: 4
          },
          {
            label: 'Reports Generated',
            data: [180, 230, 340, 420, 480, 610, 780, 930],
            borderColor: '#9d4edd',
            backgroundColor: gradPurple,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#9d4edd',
            pointRadius: 4
          }
        ]
      },
      options: this.getCommonOptions('Monthly Detection & Incident Trends')
    });
  },

  initPlatformDistributionChart: function() {
    const ctx = document.getElementById('chart-platform-dist')?.getContext('2d');
    if (!ctx) return;

    if (this.instances.platformDist) this.instances.platformDist.destroy();

    this.instances.platformDist = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Instagram', 'TikTok', 'YouTube', 'Twitter/X'],
        datasets: [{
          data: [42, 28, 18, 12],
          backgroundColor: ['#e1306c', '#00f2fe', '#ff0000', '#1da1f2'],
          borderColor: 'rgba(13, 15, 37, 0.8)',
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', padding: 20, font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        cutout: '70%'
      }
    });
  },

  initDetectionBreakdownChart: function() {
    const ctx = document.getElementById('chart-detection-bar')?.getContext('2d');
    if (!ctx) return;

    if (this.instances.detectionBar) this.instances.detectionBar.destroy();

    this.instances.detectionBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Fake Likes', 'Bot Followers', 'Spam Comments', 'Syndicate Views'],
        datasets: [{
          label: 'Flagged Instances',
          data: [14200, 28500, 9400, 18600],
          backgroundColor: [
            'rgba(0, 240, 255, 0.7)',
            'rgba(157, 78, 221, 0.7)',
            'rgba(255, 0, 127, 0.7)',
            'rgba(0, 255, 157, 0.7)'
          ],
          borderColor: ['#00f0ff', '#9d4edd', '#ff007f', '#00ff9d'],
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: this.getCommonOptions('Engagement Anomaly Types')
    });
  },

  initAnalyticsCharts: function() {
    this.initAreaEngagementChart();
    this.initRiskCategoryChart();
  },

  initAreaEngagementChart: function() {
    const ctx = document.getElementById('chart-analytics-area')?.getContext('2d');
    if (!ctx) return;

    if (this.instances.analyticsArea) this.instances.analyticsArea.destroy();

    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(255, 0, 127, 0.4)');
    grad.addColorStop(1, 'rgba(255, 0, 127, 0.0)');

    this.instances.analyticsArea = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
        datasets: [{
          label: 'Average Suspicious Activity Score (%)',
          data: [24, 38, 32, 55, 48, 62, 79, 85],
          borderColor: '#ff007f',
          backgroundColor: grad,
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: this.getCommonOptions('Weekly High-Risk Anomaly Surge')
    });
  },

  initRiskCategoryChart: function() {
    const ctx = document.getElementById('chart-analytics-pie')?.getContext('2d');
    if (!ctx) return;

    if (this.instances.analyticsPie) this.instances.analyticsPie.destroy();

    this.instances.analyticsPie = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Safe (0-30%)', 'Moderate Risk (31-70%)', 'High Risk (71-100%)'],
        datasets: [{
          data: [65, 23, 12],
          backgroundColor: ['#00ff9d', '#ffb703', '#ff2a6d'],
          borderColor: 'rgba(13, 15, 37, 0.8)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8' } }
        }
      }
    });
  },

  getCommonOptions: function(titleText) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } } },
        title: { display: false, text: titleText, color: '#f0f4fd' }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b' }
        }
      }
    };
  },

  // Spike Monthly Chart during Live Bot Attack Simulation
  spikeMonthlyChart: function(burstCount = 25000) {
    if (!this.instances.monthlyStats) return;
    const chart = this.instances.monthlyStats;
    // Current month is Aug (last data point index 7)
    chart.data.datasets[0].data[7] = 1240 + Math.round(burstCount / 10);
    chart.data.datasets[1].data[7] = 930 + Math.round(burstCount / 25);
    chart.update();
  },

  resetMonthlyChart: function() {
    if (!this.instances.monthlyStats) return;
    const chart = this.instances.monthlyStats;
    chart.data.datasets[0].data[7] = 1240;
    chart.data.datasets[1].data[7] = 930;
    chart.update();
  },

  // Side-by-Side Creator Comparison Radar Chart
  initCreatorComparisonChart: function(creatorA, creatorB) {
    const ctx = document.getElementById('chart-creator-comparison')?.getContext('2d');
    if (!ctx) return;

    if (this.instances.comparisonRadar) this.instances.comparisonRadar.destroy();

    // Compute realistic forensic vector ratings (0-100 higher is better / safer)
    const riskA = parseFloat(creatorA?.risk_score) || 50;
    const riskB = parseFloat(creatorB?.risk_score) || 50;

    const dataA = [
      Math.max(10, Math.round(100 - riskA * 0.95)),  // Audience Legitimacy
      Math.max(12, Math.round(100 - riskA * 0.88)),  // Engagement Naturalness
      Math.max(15, Math.round(100 - riskA * 1.05)),  // Comment Quality
      Math.max(20, Math.round(100 - riskA * 0.75)),  // Velocity Consistency
      Math.max(10, Math.round(100 - riskA * 0.92))   // Platform Compliance
    ];

    const dataB = [
      Math.max(10, Math.round(100 - riskB * 0.95)),
      Math.max(12, Math.round(100 - riskB * 0.88)),
      Math.max(15, Math.round(100 - riskB * 1.05)),
      Math.max(20, Math.round(100 - riskB * 0.75)),
      Math.max(10, Math.round(100 - riskB * 0.92))
    ];

    this.instances.comparisonRadar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Audience Legitimacy',
          'Engagement Naturalness',
          'Comment Quality',
          'Velocity Consistency',
          'Platform Compliance'
        ],
        datasets: [
          {
            label: creatorA?.name || 'Creator A',
            data: dataA,
            borderColor: '#ff007f',
            backgroundColor: 'rgba(255, 0, 127, 0.25)',
            borderWidth: 2,
            pointBackgroundColor: '#ff007f',
            pointRadius: 4
          },
          {
            label: creatorB?.name || 'Creator B',
            data: dataB,
            borderColor: '#00f0ff',
            backgroundColor: 'rgba(0, 240, 255, 0.25)',
            borderWidth: 2,
            pointBackgroundColor: '#00f0ff',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: { color: '#94a3b8', font: { size: 11 } },
            ticks: { display: false, min: 0, max: 100 }
          }
        }
      }
    });
  }
};


/**
 * AirSight — Production-Grade Coupled Time-Series Forecasting Chart Component
 * Smart India Hackathon 2026 | Problem ID: SIH26082 | Team TechNova
 * 
 * Features:
 * - AQI / PM2.5 / PM10 metric switching
 * - 24H / 48H / 72H forecast horizon filtering
 * - Location-aware data synchronization across all Delhi-NCR stations
 * - Shaded 95% Bayesian Confidence Intervals (envelope between Upper and Lower CI)
 * - Clear observed historical vs predicted future separation with landmark at NOW
 * - Synchronized forecast maximum, minimum, and current metric badges
 * - Coupled meteorological surface wind overlay & atmospheric context tooltips
 */

class AirSightForecastChart {
  static instances = [];
  static _controlsBound = false;

  static setAllStations(stationId) {
    AirSightForecastChart.instances.forEach(inst => inst.setStation(stationId));
  }

  static setAllMetrics(metric) {
    AirSightForecastChart.instances.forEach(inst => inst.setMetric(metric));
  }

  static setAllHorizons(hours) {
    AirSightForecastChart.instances.forEach(inst => inst.setHorizon(hours));
  }

  static toggleAllWeather(show) {
    AirSightForecastChart.instances.forEach(inst => inst.toggleWeather(show));
  }

  static bindGlobalControls() {
    if (AirSightForecastChart._controlsBound) return;
    AirSightForecastChart._controlsBound = true;

    // Metric Switch Buttons (AQI, PM2.5, PM10)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".chart-metric-btn");
      if (btn && btn.dataset.metric) {
        AirSightForecastChart.setAllMetrics(btn.dataset.metric);
      }
    });

    // Horizon Switch Buttons (24h, 48h, 72h)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".chart-horizon-btn");
      if (btn && btn.dataset.horizon) {
        AirSightForecastChart.setAllHorizons(btn.dataset.horizon);
      }
    });

    // Weather Overlay Checkboxes
    document.addEventListener("change", (e) => {
      if (e.target && e.target.classList.contains("chart-weather-toggle")) {
        AirSightForecastChart.toggleAllWeather(e.target.checked);
      }
    });
  }

  constructor(canvasId = "dashboard-forecast-canvas") {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.chart = null;

    // Active state
    this.activeStationId = "delhi-central";
    this.activeMetric = "aqi"; // 'aqi', 'pm25', 'pm10'
    this.activeHorizon = 72;   // 24, 48, 72
    this.showWeatherOverlay = true;

    AirSightForecastChart.instances.push(this);
    AirSightForecastChart.bindGlobalControls();

    // Initialize with safety checks
    this.init();
  }

  init() {
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
    }
    if (!this.canvas) {
      console.warn(`AirSightForecastChart: Canvas #${this.canvasId} not found in DOM yet.`);
      return;
    }

    if (typeof Chart === "undefined") {
      console.warn("AirSightForecastChart: Chart.js not yet loaded. Retrying in 200ms...");
      setTimeout(() => this.init(), 200);
      return;
    }

    this.renderChart();
  }

  getSeriesData() {
    if (typeof getStationForecastData === "function") {
      return getStationForecastData(this.activeStationId, this.activeMetric, this.activeHorizon);
    }
    return null;
  }

  renderChart() {
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
    }
    if (!this.canvas || typeof Chart === "undefined") return;

    const data = this.getSeriesData();
    if (!data) {
      console.warn("AirSightForecastChart: Data not available yet.");
      return;
    }

    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    // Destroy existing instance properly to prevent canvas ghosting
    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (err) {
        console.warn("Chart destroy warning:", err);
      }
      this.chart = null;
    }

    // Dynamic Area Gradient for Historical Observed Telemetry
    const height = this.canvas.clientHeight || 380;
    const observedGrad = ctx.createLinearGradient(0, 0, 0, height);
    observedGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
    observedGrad.addColorStop(1, "rgba(56, 189, 248, 0.02)");

    const metricUnit = data.unit;

    // Datasets configuration with 95% Confidence Band & Weather overlay
    const datasets = [
      {
        label: `Past 24h Observed (${metricUnit})`,
        data: data.observed,
        borderColor: "#38bdf8",
        backgroundColor: observedGrad,
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointRadius: (context) => (context.dataIndex === 6 ? 7 : 4),
        pointHoverRadius: 8,
        pointBackgroundColor: (context) => (context.dataIndex === 6 ? "#ffffff" : "#38bdf8"),
        pointBorderColor: "#0284c7",
        pointBorderWidth: 2,
        order: 2
      },
      {
        label: `AI Coupled Forecast (${metricUnit})`,
        data: data.predicted,
        borderColor: "#f43f5e",
        backgroundColor: "transparent",
        borderWidth: 3,
        borderDash: [6, 4],
        fill: false,
        tension: 0.38,
        pointRadius: (context) => (context.dataIndex === 6 ? 0 : 4),
        pointHoverRadius: 8,
        pointBackgroundColor: "#f43f5e",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        order: 3
      },
      {
        label: "95% Confidence Upper Bound",
        data: data.upperCI,
        borderColor: "rgba(244, 63, 94, 0.45)",
        borderWidth: 1.5,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false,
        tension: 0.38,
        order: 4
      },
      {
        label: "95% Bayesian Confidence Band",
        data: data.lowerCI,
        borderColor: "rgba(244, 63, 94, 0.45)",
        borderWidth: 1.5,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: "-1", // Shaded band between Upper CI (dataset index 2) and Lower CI (dataset index 3)
        backgroundColor: "rgba(244, 63, 94, 0.20)",
        tension: 0.38,
        order: 5
      },
      {
        label: "Surface Wind Speed (m/s)",
        data: data.windSpeed,
        borderColor: "#10b981",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [2, 2],
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: "yWeather",
        hidden: !this.showWeatherOverlay,
        tension: 0.4,
        order: 1
      }
    ];

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.timestamps,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false // UI uses custom informative legend chips
          },
          tooltip: {
            backgroundColor: "rgba(6, 11, 20, 0.96)",
            titleColor: "#38bdf8",
            bodyColor: "#f1f5f9",
            borderColor: "rgba(56, 189, 248, 0.4)",
            borderWidth: 1,
            padding: 14,
            cornerRadius: 10,
            titleFont: { family: "'JetBrains Mono', monospace", size: 12, weight: "bold" },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const tag = idx === 6 ? "NOW (Forecast Origin)" : idx < 6 ? "Past Observed Telemetry" : "Coupled AI Forecast";
                return `${data.displayTimes[idx]} [${data.timestamps[idx]}] • ${tag}`;
              },
              label: (item) => {
                const val = item.raw;
                if (val === null || typeof val === "undefined") return null;
                if (item.datasetIndex === 0) return `  Observed: ${val} ${metricUnit}`;
                if (item.datasetIndex === 1) return `  AI Forecast: ${val} ${metricUnit}`;
                if (item.datasetIndex === 2) return `  Upper 95% CI: ${val} ${metricUnit}`;
                if (item.datasetIndex === 3) return `  Lower 95% CI: ${val} ${metricUnit}`;
                if (item.datasetIndex === 4) return `  Wind Velocity: ${val} m/s`;
                return `${item.dataset.label}: ${val}`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                return [
                  `--------------------------------`,
                  `Atmospheric Boundary Layer: ${data.mixingHeight[idx]}m`,
                  `Ambient Temperature: ${data.temperature[idx]}°C`,
                  `Coupled Wind Velocity: ${data.windSpeed[idx]} m/s`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: (ctx) => (ctx.index === 6 ? "rgba(56, 189, 248, 0.6)" : "rgba(255, 255, 255, 0.05)"),
              lineWidth: (ctx) => (ctx.index === 6 ? 2 : 1)
            },
            ticks: {
              color: (val, index) => (index === 6 ? "#38bdf8" : "#94a3b8"),
              font: {
                family: "'JetBrains Mono', monospace",
                size: 11,
                weight: (val, idx) => (idx === 6 ? "bold" : "normal")
              }
            }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.06)" },
            ticks: {
              color: "#94a3b8",
              font: { family: "'JetBrains Mono', monospace", size: 11 }
            },
            title: {
              display: true,
              text: `${data.metricLabel} (${metricUnit})`,
              color: "#cbd5e1",
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "bold" }
            }
          },
          yWeather: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: "#10b981",
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            },
            title: {
              display: true,
              text: "Wind Speed (m/s)",
              color: "#10b981",
              font: { family: "'JetBrains Mono', monospace", size: 11 }
            },
            min: 0,
            max: 12
          }
        }
      }
    });

    this.updateSummaryBadges(data);
  }

  updateSummaryBadges(data) {
    if (!data) data = this.getSeriesData();
    if (!data) return;

    // Update Current, Forecast Max, Forecast Min, Forecast Avg
    document.querySelectorAll(".chart-current-val, #chart-current-val").forEach(el => {
      el.textContent = `${data.currentVal} ${data.unit}`;
    });
    document.querySelectorAll(".chart-forecast-max, #chart-forecast-max").forEach(el => {
      el.textContent = `${data.forecastMax} ${data.unit}`;
    });
    document.querySelectorAll(".chart-forecast-min, #chart-forecast-min").forEach(el => {
      el.textContent = `${data.forecastMin} ${data.unit}`;
    });
    document.querySelectorAll(".chart-forecast-avg, #chart-forecast-avg").forEach(el => {
      el.textContent = `${data.forecastAvg} ${data.unit}`;
    });
    document.querySelectorAll(".chart-active-station-title, #chart-active-station-title").forEach(el => {
      el.textContent = data.stationName;
    });
    document.querySelectorAll(".chart-active-horizon-label, #chart-active-horizon-label").forEach(el => {
      el.textContent = `+${data.horizonHours}h Window`;
    });
    document.querySelectorAll(".chart-metric-unit-text").forEach(el => {
      el.textContent = data.unit;
    });

    // Update Risk Level Chip
    let riskLabel = "Moderate Risk";
    let riskClass = "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";

    const compVal = this.activeMetric === "aqi"
      ? data.forecastMax
      : this.activeMetric === "pm25"
      ? (data.forecastMax * 2)
      : (data.forecastMax * 1.1);

    if (compVal >= 400) {
      riskLabel = "Severe Hazard";
      riskClass = "text-purple-400 border-purple-500/40 bg-purple-500/10";
    } else if (compVal >= 300) {
      riskLabel = "Very Poor Spike";
      riskClass = "text-rose-400 border-rose-500/40 bg-rose-500/10";
    } else if (compVal >= 200) {
      riskLabel = "Poor Warning";
      riskClass = "text-orange-400 border-orange-500/40 bg-orange-500/10";
    } else {
      riskLabel = "Moderate";
      riskClass = "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    }

    document.querySelectorAll(".chart-forecast-risk, #chart-forecast-risk").forEach(riskChipEl => {
      riskChipEl.textContent = riskLabel;
      riskChipEl.className = `chart-forecast-risk px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${riskClass}`;
    });
  }

  setStation(stationId) {
    if (!stationId) return;
    this.activeStationId = stationId;
    this.renderChart();
  }

  setMetric(metric) {
    if (!["aqi", "pm25", "pm10"].includes(metric)) return;
    this.activeMetric = metric;

    // Update Metric Toggle Buttons styling across all panels
    document.querySelectorAll(".chart-metric-btn").forEach(btn => {
      if (btn.dataset.metric === metric) {
        btn.classList.add("active-tab", "text-white");
        btn.classList.remove("text-slate-400");
      } else {
        btn.classList.remove("active-tab", "text-white");
        btn.classList.add("text-slate-400");
      }
    });

    this.renderChart();
  }

  setHorizon(hours) {
    const h = parseInt(hours, 10);
    if (![24, 48, 72].includes(h)) return;
    this.activeHorizon = h;

    // Update Horizon Toggle Buttons styling across all panels
    document.querySelectorAll(".chart-horizon-btn").forEach(btn => {
      if (parseInt(btn.dataset.horizon, 10) === h) {
        btn.classList.add("active-tab", "text-cyan-300");
        btn.classList.remove("text-slate-300");
      } else {
        btn.classList.remove("active-tab", "text-cyan-300");
        btn.classList.add("text-slate-300");
      }
    });

    this.renderChart();
  }

  toggleWeather(show) {
    this.showWeatherOverlay = typeof show === "boolean" ? show : !this.showWeatherOverlay;
    
    // Sync all toggle checkboxes
    document.querySelectorAll(".chart-weather-toggle").forEach(toggle => {
      toggle.checked = this.showWeatherOverlay;
    });

    if (this.chart) {
      const weatherDataset = this.chart.data.datasets.find(d => d.yAxisID === "yWeather");
      if (weatherDataset) {
        weatherDataset.hidden = !this.showWeatherOverlay;
        this.chart.update();
      }
    }
  }

  destroy() {
    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (e) {
        // ignore
      }
      this.chart = null;
    }
    const idx = AirSightForecastChart.instances.indexOf(this);
    if (idx !== -1) {
      AirSightForecastChart.instances.splice(idx, 1);
    }
  }
}

// Global hook to ensure single instance
window.AirSightForecastChart = AirSightForecastChart;

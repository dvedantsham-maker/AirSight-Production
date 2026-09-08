/**
 * AirSight — High-Fidelity Coupled Time-Series Forecasting Chart (Chart.js)
 * Displays: Observed AQI/PM2.5 vs AI Coupled Forecast (72h Horizon) with Confidence Intervals & Weather Overlays
 */

class AirSightForecastChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.chart = null;
    this.activeMetric = 'aqi'; // 'aqi' or 'pm25'
    this.showWeatherOverlay = true;
    
    this.initChart();
    this.bindControls();
  }
  
  initChart() {
    const ctx = this.canvas.getContext('2d');
    const data = TIME_SERIES_FORECAST_DATA;
    
    // Create Gradients
    const observedGrad = ctx.createLinearGradient(0, 0, 0, 350);
    observedGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    observedGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    
    const predictedGrad = ctx.createLinearGradient(0, 0, 0, 350);
    predictedGrad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
    predictedGrad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    
    const isAQI = this.activeMetric === 'aqi';
    const observedValues = isAQI ? data.observedAQI : data.observedPM25;
    const predictedValues = isAQI ? data.predictedAQI : data.predictedPM25;
    const upperCI = isAQI ? data.predictedAQI_Upper : data.predictedAQI_Upper.map(v => v ? Math.round(v * 0.65) : null);
    const lowerCI = isAQI ? data.predictedAQI_Lower : data.predictedAQI_Lower.map(v => v ? Math.round(v * 0.65) : null);
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.timestamps,
        datasets: [
          {
            label: isAQI ? 'Observed Past AQI' : 'Observed Past PM2.5 (µg/m³)',
            data: observedValues,
            borderColor: '#38bdf8',
            backgroundColor: observedGrad,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: (ctx) => (ctx.dataIndex === 6 ? 6 : 4),
            pointBackgroundColor: (ctx) => (ctx.dataIndex === 6 ? '#ffffff' : '#38bdf8'),
            pointBorderColor: '#0ea5e9',
            pointBorderWidth: 2,
            order: 2
          },
          {
            label: isAQI ? 'AI Coupled Forecast (72h)' : 'AI Forecast PM2.5 (72h)',
            data: predictedValues,
            borderColor: '#f43f5e',
            backgroundColor: predictedGrad,
            borderWidth: 3,
            borderDash: [5, 4],
            fill: true,
            tension: 0.38,
            pointRadius: 4,
            pointBackgroundColor: '#f43f5e',
            order: 3
          },
          {
            label: 'Forecast 95% Confidence Band (Upper)',
            data: upperCI,
            borderColor: 'rgba(244, 63, 94, 0.25)',
            borderWidth: 1,
            pointRadius: 0,
            fill: '+1',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            tension: 0.38,
            order: 4
          },
          {
            label: 'Forecast 95% Confidence Band (Lower)',
            data: lowerCI,
            borderColor: 'rgba(244, 63, 94, 0.25)',
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            tension: 0.38,
            order: 5
          },
          {
            label: 'Surface Wind Speed (m/s)',
            data: data.windSpeed,
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [2, 2],
            pointRadius: 0,
            yAxisID: 'yWeather',
            hidden: !this.showWeatherOverlay,
            tension: 0.4,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#cbd5e1',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(13, 22, 41, 0.95)',
            titleColor: '#38bdf8',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: "'JetBrains Mono', monospace", size: 12 },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            callbacks: {
              title: function(items) {
                const idx = items[0].dataIndex;
                return `${data.displayTimes[idx]} [${data.timestamps[idx]}]`;
              },
              afterBody: function(items) {
                const idx = items[0].dataIndex;
                return [
                  `Wind Speed: ${data.windSpeed[idx]} m/s`,
                  `Mixing Height: ${data.mixingHeight[idx]}m`,
                  `Temperature: ${data.temperature[idx]}°C`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: (val, index) => (index === 6 ? '#38bdf8' : '#94a3b8'),
              font: { family: "'JetBrains Mono', monospace", size: 11, weight: (val, idx) => (idx === 6 ? 'bold' : 'normal') }
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { family: "'JetBrains Mono', monospace", size: 11 }
            },
            title: {
              display: true,
              text: isAQI ? 'Air Quality Index (AQI)' : 'PM2.5 Concentration (µg/m³)',
              color: '#cbd5e1',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          yWeather: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#10b981',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            },
            title: {
              display: true,
              text: 'Wind Speed (m/s)',
              color: '#10b981',
              font: { size: 11 }
            },
            min: 0,
            max: 12
          }
        }
      }
    });
  }
  
  switchMetric(metric) {
    this.activeMetric = metric;
    if (this.chart) {
      this.chart.destroy();
      this.initChart();
    }
  }
  
  toggleWeather() {
    this.showWeatherOverlay = !this.showWeatherOverlay;
    if (this.chart) {
      const weatherDataset = this.chart.data.datasets.find(d => d.yAxisID === 'yWeather');
      if (weatherDataset) {
        weatherDataset.hidden = !this.showWeatherOverlay;
        this.chart.update();
      }
    }
  }
  
  bindControls() {
    const aqiBtn = document.getElementById("chart-btn-aqi");
    const pmBtn = document.getElementById("chart-btn-pm25");
    const weatherToggle = document.getElementById("chart-toggle-weather");
    
    if (aqiBtn && pmBtn) {
      aqiBtn.addEventListener("click", () => {
        this.switchMetric('aqi');
        aqiBtn.classList.add("active-tab");
        pmBtn.classList.remove("active-tab");
      });
      pmBtn.addEventListener("click", () => {
        this.switchMetric('pm25');
        pmBtn.classList.add("active-tab");
        aqiBtn.classList.remove("active-tab");
      });
    }
    
    if (weatherToggle) {
      weatherToggle.addEventListener("change", (e) => {
        this.showWeatherOverlay = e.target.checked;
        if (this.chart) {
          const weatherDataset = this.chart.data.datasets.find(d => d.yAxisID === 'yWeather');
          if (weatherDataset) {
            weatherDataset.hidden = !this.showWeatherOverlay;
            this.chart.update();
          }
        }
      });
    }
  }
}

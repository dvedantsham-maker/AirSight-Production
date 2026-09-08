/**
 * AirSight — Interactive Atmospheric Wind Flow & Dispersion Simulator (HTML5 Canvas)
 * Demonstrates: Pollution Source → Weather Conditions → Atmospheric Movement → Pollution Concentration
 */

class AtmosphericWindSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.maxParticles = 240;
    this.animId = null;
    
    // Atmospheric Presets
    this.presets = {
      inversion: {
        name: "Nocturnal Thermal Inversion",
        windSpeed: 1.2,
        direction: 310, // NW
        mixingHeightRatio: 0.28, // Low boundary layer (~280m)
        dispersionRate: 0.15,
        emissionRate: 3,
        statusText: "Severe Trap: Calm winds (<1.5 m/s) and shallow boundary layer trap particulate matter at breathing level.",
        aqiCategory: "Severe (AQI 425)",
        aqiColor: "#9333ea"
      },
      moderate: {
        name: "Afternoon Solar Convection",
        windSpeed: 3.8,
        direction: 290, // WNW
        mixingHeightRatio: 0.65, // Moderate boundary layer (~650m)
        dispersionRate: 0.5,
        emissionRate: 2,
        statusText: "Moderate Dispersion: Solar radiation expands mixing layer; moderate breeze facilitates horizontal ventilation.",
        aqiCategory: "Poor (AQI 260)",
        aqiColor: "#f97316"
      },
      clean: {
        name: "Western Disturbance Ventilation",
        windSpeed: 8.2,
        direction: 270, // W
        mixingHeightRatio: 0.92, // High boundary layer (~1200m)
        dispersionRate: 1.0,
        emissionRate: 1,
        statusText: "High Ventilation: Strong turbulent winds sweep pollutants away; aerosol concentrations remain diluted.",
        aqiCategory: "Moderate / Satisfactory (AQI 85)",
        aqiColor: "#10b981"
      }
    };
    
    this.currentPresetKey = 'inversion';
    this.currentPreset = this.presets[this.currentPresetKey];
    
    this.initCanvas();
    this.bindEvents();
    this.start();
  }
  
  initCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = Math.min(380, Math.max(260, rect.width * 0.45));
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
    
    this.particles = [];
    for (let i = 0; i < 80; i++) {
      this.spawnParticle(true);
    }
  }
  
  spawnParticle(randomX = false) {
    const groundY = this.height - 35;
    const mixingCeiling = this.height * (1 - this.currentPreset.mixingHeightRatio);
    
    const x = randomX ? Math.random() * this.width : Math.random() * (this.width * 0.25);
    const y = groundY - Math.random() * (groundY - mixingCeiling);
    
    // Color depends on preset and height
    let color = this.currentPreset.aqiColor;
    
    this.particles.push({
      x: x,
      y: y,
      vx: this.currentPreset.windSpeed * (0.8 + Math.random() * 0.4),
      vy: (Math.random() - 0.52) * (1.2 * this.currentPreset.dispersionRate),
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.7 + 0.3,
      life: Math.random() * 200 + 100,
      color: color
    });
  }
  
  setPreset(key) {
    if (!this.presets[key]) return;
    this.currentPresetKey = key;
    this.currentPreset = this.presets[key];
    
    // Update UI elements
    const statusEl = document.getElementById("wind-sim-status");
    const aqiEl = document.getElementById("wind-sim-aqi");
    const speedEl = document.getElementById("wind-sim-speed");
    const heightEl = document.getElementById("wind-sim-height");
    
    if (statusEl) statusEl.textContent = this.currentPreset.statusText;
    if (aqiEl) {
      aqiEl.textContent = this.currentPreset.aqiCategory;
      aqiEl.style.color = this.currentPreset.aqiColor;
    }
    if (speedEl) speedEl.textContent = `${this.currentPreset.windSpeed} m/s`;
    if (heightEl) heightEl.textContent = `${Math.round(this.currentPreset.mixingHeightRatio * 1000)}m`;
    
    // Update active button state
    document.querySelectorAll(".wind-preset-btn").forEach(btn => {
      if (btn.dataset.preset === key) {
        btn.classList.add("active-tab");
      } else {
        btn.classList.remove("active-tab");
      }
    });
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.initCanvas());
    
    document.querySelectorAll(".wind-preset-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = e.currentTarget.dataset.preset;
        this.setPreset(key);
      });
    });
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const groundY = this.height - 35;
    const mixingCeiling = this.height * (1 - this.currentPreset.mixingHeightRatio);
    
    // 1. Draw Inversion Layer Ceiling
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.setLineDash([6, 6]);
    this.ctx.moveTo(0, mixingCeiling);
    this.ctx.lineTo(this.width, mixingCeiling);
    this.ctx.strokeStyle = this.currentPresetKey === 'inversion' ? '#f43f5e' : '#06b6d4';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Ceiling label
    this.ctx.fillStyle = this.currentPresetKey === 'inversion' ? '#fda4af' : '#67e8f9';
    this.ctx.font = "11px 'JetBrains Mono', monospace";
    this.ctx.fillText(
      `▲ INVERSION LID / MIXING HEIGHT: ${Math.round(this.currentPreset.mixingHeightRatio * 1000)}m`,
      12,
      mixingCeiling - 8
    );
    this.ctx.restore();
    
    // 2. Draw ground boundary & urban skyline silhouette
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    this.ctx.fillRect(0, groundY, this.width, 35);
    
    this.ctx.fillStyle = "#334155";
    this.ctx.fillRect(0, groundY - 1, this.width, 2);
    
    // Draw simple stylized city buildings on ground
    const buildingWidth = 32;
    const numBuildings = Math.floor(this.width / buildingWidth);
    this.ctx.fillStyle = "rgba(30, 41, 59, 0.6)";
    for (let i = 0; i < numBuildings; i++) {
      const bHeight = ((i * 37) % 24) + 10;
      this.ctx.fillRect(i * buildingWidth + 4, groundY - bHeight, buildingWidth - 8, bHeight);
    }
    
    // Ground label
    this.ctx.fillStyle = "#94a3b8";
    this.ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    this.ctx.fillText("Delhi-NCR Urban Surface (Vehicles + Industry + Stubble Plumes)", 12, this.height - 12);
    
    // 3. Spawn and update particles
    if (this.particles.length < this.maxParticles) {
      for (let i = 0; i < this.currentPreset.emissionRate; i++) {
        this.spawnParticle(false);
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      // Inversion ceiling bounce or escape
      if (p.y <= mixingCeiling) {
        if (this.currentPresetKey === 'inversion') {
          p.vy = Math.abs(p.vy) * 0.9; // trapped below ceiling!
          p.y = mixingCeiling + 2;
        } else {
          // Can escape above ceiling if well ventilated
          p.vy *= 0.7;
        }
      }
      
      // Ground bounce
      if (p.y >= groundY - 4) {
        p.vy = -Math.abs(p.vy);
        p.y = groundY - 5;
      }
      
      // Remove off-screen or dead
      if (p.x > this.width + 10 || p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }
    
    // 4. Draw Atmospheric Airflow Vector Arrows
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    this.ctx.lineWidth = 1.5;
    const arrowSpacing = 90;
    const arrowCount = Math.floor(this.width / arrowSpacing);
    for (let i = 1; i < arrowCount; i++) {
      const ax = i * arrowSpacing;
      const ay = mixingCeiling + (groundY - mixingCeiling) * 0.5;
      const arrowLength = 25 * (this.currentPreset.windSpeed / 4);
      
      this.ctx.beginPath();
      this.ctx.moveTo(ax, ay);
      this.ctx.lineTo(ax + arrowLength, ay);
      this.ctx.lineTo(ax + arrowLength - 6, ay - 4);
      this.ctx.moveTo(ax + arrowLength, ay);
      this.ctx.lineTo(ax + arrowLength - 6, ay + 4);
      this.ctx.stroke();
    }
    this.ctx.restore();
    
    this.animId = requestAnimationFrame(() => this.render());
  }
  
  start() {
    if (!this.animId) {
      this.render();
    }
  }
  
  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

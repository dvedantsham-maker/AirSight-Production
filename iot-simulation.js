/**
 * AirSight — Interactive Animated IoT Sensor Station & Telemetry Pipeline
 * Requirement 11:
 * PM, Temp, Humidity, Pressure, Wind, Rain Sensors -> ESP32 -> Internet -> Cloud -> AI/ML -> Dashboard
 * Animated data packets moving between components with real-time telemetry counters.
 */

class IoTSimulationPipeline {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.packets = [];
    this.animId = null;
    this.packetCounter = 18420;
    
    this.initNodes();
    this.bindEvents();
    this.start();
  }
  
  initNodes() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = Math.min(320, Math.max(220, rect.width * 0.35));
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
    
    // Define Stage Nodes across width
    const pad = 40;
    const usableW = this.width - pad * 2;
    const yMid = this.height / 2;
    
    this.nodes = [
      { id: "sensors", label: "IoT Sensors (6-in-1)", sub: "PMS/BME/Wind/Rain", x: pad + usableW * 0.05, y: yMid, color: "#10b981", icon: "◉" },
      { id: "esp32", label: "ESP32 Controller", sub: "Edge ADC & UART", x: pad + usableW * 0.28, y: yMid, color: "#06b6d4", icon: "⬡" },
      { id: "network", label: "MQTT / 4G-WiFi", sub: "TLS Encrypted Transport", x: pad + usableW * 0.50, y: yMid, color: "#38bdf8", icon: "📶" },
      { id: "cloud", label: "Cloud Ingestion", sub: "TimescaleDB & Kafka", x: pad + usableW * 0.72, y: yMid, color: "#818cf8", icon: "☁" },
      { id: "ai", label: "AI/ML Forecasting", sub: "Spatial Transformer", x: pad + usableW * 0.88, y: yMid, color: "#f43f5e", icon: "⚡" },
      { id: "dash", label: "AirSight Dashboard", sub: "Early Warnings", x: pad + usableW * 0.98, y: yMid, color: "#a855f7", icon: "📊" }
    ];
  }
  
  spawnPacket() {
    this.packets.push({
      fromNodeIndex: 0,
      progress: 0,
      speed: 0.012 + Math.random() * 0.006,
      size: 3.5,
      color: "#38bdf8"
    });
    this.packetCounter++;
    const counterEl = document.getElementById("iot-packet-counter");
    if (counterEl) counterEl.textContent = this.packetCounter.toLocaleString();
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.initNodes();
    });
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 1. Draw Connecting Bus Lines
    this.ctx.save();
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const n1 = this.nodes[i];
      const n2 = this.nodes[i + 1];
      
      this.ctx.beginPath();
      this.ctx.moveTo(n1.x, n1.y);
      this.ctx.lineTo(n2.x, n2.y);
      this.ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Flow arrows
      const midX = (n1.x + n2.x) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(midX - 4, n1.y - 4);
      this.ctx.lineTo(midX + 4, n1.y);
      this.ctx.lineTo(midX - 4, n1.y + 4);
      this.ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
    this.ctx.restore();
    
    // 2. Spawn and Update Moving Data Packets
    if (Math.random() < 0.08 && this.packets.length < 18) {
      this.spawnPacket();
    }
    
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += p.speed;
      
      if (p.progress >= 1) {
        p.fromNodeIndex++;
        p.progress = 0;
        
        if (p.fromNodeIndex >= this.nodes.length - 1) {
          this.packets.splice(i, 1);
          continue;
        }
      }
      
      const n1 = this.nodes[p.fromNodeIndex];
      const n2 = this.nodes[p.fromNodeIndex + 1];
      const curX = n1.x + (n2.x - n1.x) * p.progress;
      const curY = n1.y + (n2.y - n1.y) * p.progress;
      
      // Draw glowing data packet
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = "#38bdf8";
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = "#38bdf8";
      this.ctx.fill();
      this.ctx.restore();
    }
    
    // 3. Draw Nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      
      // Outer glow circle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(13, 22, 41, 0.9)";
      this.ctx.strokeStyle = n.color;
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = n.color;
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
      
      // Icon inside node
      this.ctx.save();
      this.ctx.fillStyle = "#f8fafc";
      this.ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(n.icon, n.x, n.y);
      this.ctx.restore();
      
      // Node Text (alternating top / bottom to prevent overlap)
      this.ctx.save();
      this.ctx.textAlign = "center";
      const isTop = i % 2 === 0;
      const textY = isTop ? n.y - 36 : n.y + 40;
      
      this.ctx.fillStyle = "#f1f5f9";
      this.ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
      this.ctx.fillText(n.label, n.x, textY);
      
      this.ctx.fillStyle = "#94a3b8";
      this.ctx.font = "9px 'JetBrains Mono', monospace";
      this.ctx.fillText(n.sub, n.x, textY + (isTop ? -14 : 14));
      this.ctx.restore();
    }
    
    this.animId = requestAnimationFrame(() => this.render());
  }
  
  start() {
    if (!this.animId) this.render();
  }
  
  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

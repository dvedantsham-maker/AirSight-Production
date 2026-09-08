# AirSight — AI-Powered Air Pollution & Weather Coupled Forecasting System
### Smart India Hackathon 2026 | Problem Statement: SIH26082 | Theme: Clean & Green Technology | Team: TechNova

---

## Production Deployment Guide

AirSight is a zero-dependency, high-performance static web platform. It requires no build tools (`npm`, `yarn`, `pip`, etc.) and can be deployed directly to any modern web hosting service.

### Deployment Options

#### 1. GitHub Pages
1. Push the contents of this folder to a GitHub repository.
2. Go to **Settings** → **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. The website will be live at `https://<username>.github.io/<repo-name>/`.

#### 2. Netlify / Vercel
1. Drag and drop this folder directly into the [Netlify Drop](https://app.netlify.com/drop) or [Vercel Dashboard](https://vercel.com).
2. Leave build command and output directory empty.
3. Deploy instantly with global CDN acceleration and HTTPS.

#### 3. Apache / Nginx / Traditional Web Server
Copy all files to your web server's document root (e.g., `/var/www/html/` or `htdocs/`):
```nginx
server {
    listen 80;
    server_name airsight.example.com;
    root /var/www/airsight;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 4. Local Evaluation (Offline / Standalone)
Simply double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Brave, Safari), or run:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

---

## Directory Structure
```
├── index.html                 # Master single-page application
├── README.md                  # Deployment documentation
├── serve.ps1                  # Optional local static web server script
├── css/
│   └── styles.css             # Glassmorphism & environmental-tech theme
└── js/
    ├── app.js                 # Application coordinator & event bindings
    ├── data/
    │   ├── delhi-ncr-data.js  # Delhi-NCR CAAQMS stations telemetry
    │   ├── forecast-data.js   # 72-hour coupled time series with 95% CI
    │   └── sensors-data.js    # IoT hardware specs & pollutant standards
    └── components/
        ├── wind-canvas.js     # Atmospheric wind flow & inversion simulator
        ├── iot-simulation.js  # Edge sensor-to-cloud telemetry bus
        ├── forecast-chart.js  # Dual-axis Chart.js predictive curves
        ├── map-heatmap.js     # Leaflet.js interactive dark GIS map
        └── alert-system.js    # GRAP-IV early warning incident simulator
```

---

## Data Honesty & Compliance Notice
All predictive analytics and sensor metrics are representative prototype simulations demonstrating atmospheric-weather coupling for Delhi-NCR. Real-world deployment connects to live CPCB CAAQMS and IMD Doppler radar APIs.

/**
 * AirSight — Interactive Delhi-NCR Pollution Heatmap & Monitoring Network (Leaflet.js)
 * Requirement 19 & 20: Interactive map with stylized dark theme, AQI indicators, station drilldowns.
 */

class DelhiNCRMapHeatmap {
  constructor(mapContainerId) {
    this.container = document.getElementById(mapContainerId);
    if (!this.container) return;
    
    this.map = null;
    this.markers = [];
    this.circles = [];
    this.selectedStation = DELHI_NCR_STATIONS[0]; // default Central Delhi
    
    this.initMap();
    this.renderStations();
  }
  
  initMap() {
    // Centered around Delhi-NCR
    this.map = L.map(this.container.id, {
      center: [28.58, 77.20],
      zoom: 11,
      minZoom: 9,
      maxZoom: 15,
      zoomControl: true,
      scrollWheelZoom: false
    });
    
    // Premium dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
  }
  
  renderStations() {
    DELHI_NCR_STATIONS.forEach((station) => {
      // 1. Add Heat Aura Circle
      const heatRadius = station.aqi > 400 ? 5500 : station.aqi > 300 ? 4200 : 3200;
      const circle = L.circle([station.lat, station.lng], {
        color: station.statusColor,
        fillColor: station.statusColor,
        fillOpacity: 0.22,
        radius: heatRadius,
        weight: 1.5,
        dashArray: '3, 6'
      }).addTo(this.map);
      this.circles.push(circle);
      
      // 2. Custom Station HTML Pin
      const customIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div class="relative group">
            <div style="background-color: ${station.statusColor}; color: #ffffff;" 
                 class="station-pin w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs shadow-lg border-2 border-white/40">
              ${station.aqi}
            </div>
            ${station.aqi >= 400 ? `<div class="absolute -inset-1.5 rounded-full border-2 border-purple-500 animate-ping opacity-75"></div>` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      // 3. Leaflet Marker with Popup
      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(this.map);
      
      const popupContent = `
        <div class="p-2 min-w-[240px]">
          <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <h4 class="font-bold text-sm text-sky-400">${station.name}</h4>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style="background-color: ${station.statusColor}22; color: ${station.statusColor};">
              ${station.category}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs mb-2">
            <div><span class="text-slate-400">AQI:</span> <strong class="text-white font-mono">${station.aqi}</strong></div>
            <div><span class="text-slate-400">PM2.5:</span> <strong class="text-white font-mono">${station.pm25} µg/m³</strong></div>
            <div><span class="text-slate-400">PM10:</span> <strong class="text-white font-mono">${station.pm10} µg/m³</strong></div>
            <div><span class="text-slate-400">Wind:</span> <strong class="text-white font-mono">${station.windSpeed} m/s ${station.windDir.split(' ')[0]}</strong></div>
            <div><span class="text-slate-400">Temp:</span> <strong class="text-white font-mono">${station.temp}°C</strong></div>
            <div><span class="text-slate-400">Humidity:</span> <strong class="text-white font-mono">${station.humidity}%</strong></div>
          </div>
          <div class="bg-slate-900/80 p-2 rounded text-[11px] border border-white/5 mb-2">
            <div class="text-sky-300 font-semibold mb-0.5">24h–72h Forecast Outlook:</div>
            <div class="flex justify-between text-slate-300 font-mono">
              <span>+24h: <b class="text-amber-400">${station.forecast24}</b></span>
              <span>+48h: <b class="text-rose-400">${station.forecast48}</b></span>
              <span>+72h: <b class="text-orange-400">${station.forecast72}</b></span>
            </div>
          </div>
          <button onclick="window.selectStationFromMap('${station.id}')" 
                  class="w-full py-1.5 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1">
            <span>Select as Active Forecast Location</span> &rarr;
          </button>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.on('click', () => {
        this.selectStation(station);
      });
      
      this.markers.push(marker);
    });
  }
  
  selectStation(station) {
    this.selectedStation = station;
    // Dispatch custom event to sync with location selector
    const evt = new CustomEvent('airsight:stationSelected', { detail: station });
    window.dispatchEvent(evt);
  }
  
  panToStation(stationId) {
    const st = DELHI_NCR_STATIONS.find(s => s.id === stationId);
    if (st && this.map) {
      this.map.flyTo([st.lat, st.lng], 13, { duration: 1.2 });
      this.selectStation(st);
    }
  }
}

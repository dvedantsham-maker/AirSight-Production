/**
 * AirSight — Main Application Controller (Presentation-Polished)
 * Smart India Hackathon 2026 | Problem ID: SIH26082 | Team TechNova
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Initialize Components
  let windSim = null;
  let iotSim = null;
  let forecastChart = null;
  let delhiMap = null;
  let alertSys = null;

  try {
    windSim = new AtmosphericWindSimulator('wind-flow-canvas');
  } catch (e) {
    console.warn("Wind canvas init:", e);
  }

  try {
    iotSim = new IoTSimulationPipeline('iot-pipeline-canvas');
  } catch (e) {
    console.warn("IoT canvas init:", e);
  }

  let dashboardForecastChart = null;
  let studioForecastChart = null;

  try {
    if (document.getElementById('dashboard-forecast-canvas')) {
      dashboardForecastChart = new AirSightForecastChart('dashboard-forecast-canvas');
    }
  } catch (e) {
    console.warn("Dashboard forecast chart init:", e);
  }

  try {
    if (document.getElementById('forecast-chart-canvas')) {
      studioForecastChart = new AirSightForecastChart('forecast-chart-canvas');
    }
  } catch (e) {
    console.warn("Studio forecast chart init:", e);
  }

  try {
    delhiMap = new DelhiNCRMapHeatmap('delhi-map-container');
  } catch (e) {
    console.warn("Map init:", e);
  }

  try {
    alertSys = new AirSightAlertSystem();
  } catch (e) {
    console.warn("Alert system init:", e);
  }

  // Toast Notification System
  const toastEl = document.getElementById("station-toast");
  const toastText = document.getElementById("station-toast-text");
  let toastTimer = null;

  function showStationToast(station) {
    if (!toastEl || !toastText) return;
    toastText.innerHTML = `Active Station: <strong class="text-cyan-300">${station.name}</strong> • Simulated AQI: <strong class="text-white">${station.aqi}</strong> (${station.category})`;
    toastEl.classList.remove("toast-hidden");
    toastEl.classList.add("toast-visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("toast-visible");
      toastEl.classList.add("toast-hidden");
    }, 4500);
  }

  // 2. Global Station Selector & Dashboard Synchronization
  let currentStation = DELHI_NCR_STATIONS[0]; // Central Delhi default

  function updateDashboardStation(station, triggerToast = true) {
    currentStation = station;

    // Update Dropdown/Selector if present
    const selector = document.getElementById("location-selector");
    if (selector && selector.value !== station.id) {
      selector.value = station.id;
    }

    // Highlight Map Quick Station Buttons
    document.querySelectorAll(".map-station-quick-btn").forEach(btn => {
      if (btn.dataset.stationId === station.id) {
        btn.classList.add("active-tab");
      } else {
        btn.classList.remove("active-tab");
      }
    });

    // Update Dashboard Metrics
    const aqiNum = document.getElementById("dash-aqi-value");
    const aqiCat = document.getElementById("dash-aqi-category");
    const aqiBadge = document.getElementById("dash-aqi-badge");
    const pm25Val = document.getElementById("dash-pm25-val");
    const pm10Val = document.getElementById("dash-pm10-val");
    const no2Val = document.getElementById("dash-no2-val");
    const so2Val = document.getElementById("dash-so2-val");
    const coVal = document.getElementById("dash-co-val");
    const o3Val = document.getElementById("dash-o3-val");

    // Progress Bars
    const pm25Bar = document.getElementById("dash-pm25-bar");
    const pm10Bar = document.getElementById("dash-pm10-bar");

    const tempVal = document.getElementById("dash-temp-val");
    const humVal = document.getElementById("dash-hum-val");
    const windVal = document.getElementById("dash-wind-val");
    const mixVal = document.getElementById("dash-mix-val");

    const fc24 = document.getElementById("dash-fc-24");
    const fc48 = document.getElementById("dash-fc-48");
    const fc72 = document.getElementById("dash-fc-72");
    const riskLevel = document.getElementById("dash-risk-level");
    const locationName = document.getElementById("dash-active-location-name");
    const locationSource = document.getElementById("dash-active-source");

    if (aqiNum) aqiNum.textContent = station.aqi;
    if (aqiCat) {
      aqiCat.textContent = `${station.category} Category`;
      aqiCat.style.color = station.statusColor;
    }
    if (aqiBadge) {
      aqiBadge.textContent = `${station.category} (AQI ${station.aqi})`;
      aqiBadge.style.backgroundColor = `${station.statusColor}22`;
      aqiBadge.style.borderColor = station.statusColor;
      aqiBadge.style.color = station.statusColor;
    }

    if (pm25Val) pm25Val.textContent = `${station.pm25} µg/m³`;
    if (pm10Val) pm10Val.textContent = `${station.pm10} µg/m³`;
    if (no2Val) no2Val.textContent = `${station.no2} µg/m³`;
    if (so2Val) so2Val.textContent = `${station.so2} µg/m³`;
    if (coVal) coVal.textContent = `${station.co} mg/m³`;
    if (o3Val) o3Val.textContent = `${station.o3} µg/m³`;

    // Calculate percentage against CPCB limit (60 for PM2.5, 100 for PM10)
    if (pm25Bar) {
      const pct = Math.min(100, Math.round((station.pm25 / 250) * 100));
      pm25Bar.style.width = `${pct}%`;
    }
    if (pm10Bar) {
      const pct = Math.min(100, Math.round((station.pm10 / 400) * 100));
      pm10Bar.style.width = `${pct}%`;
    }

    if (tempVal) tempVal.textContent = `${station.temp}°C`;
    if (humVal) humVal.textContent = `${station.humidity}%`;
    if (windVal) windVal.textContent = `${station.windSpeed} m/s ${station.windDir.split(' ')[0]}`;
    if (mixVal) mixVal.textContent = `${station.mixingHeight}m`;

    if (fc24) fc24.textContent = station.forecast24;
    if (fc48) fc48.textContent = station.forecast48;
    if (fc72) fc72.textContent = station.forecast72;
    if (riskLevel) riskLevel.textContent = station.riskLevel;
    if (locationName) locationName.textContent = station.name;
    if (locationSource) locationSource.textContent = station.dominantSource;

    // Synchronize all active forecast charts with location-specific data
    if (typeof AirSightForecastChart !== "undefined" && AirSightForecastChart.setAllStations) {
      AirSightForecastChart.setAllStations(station.id);
    }

    // Pulse animation on dashboard update
    const card = document.getElementById("main-dashboard-card");
    if (card) {
      card.classList.add("ring-2", "ring-cyan-400");
      setTimeout(() => card.classList.remove("ring-2", "ring-cyan-400"), 600);
    }

    if (triggerToast) {
      showStationToast(station);
    }
  }

  // Expose global callback for map popups
  window.selectStationFromMap = function(stationId) {
    const station = DELHI_NCR_STATIONS.find(s => s.id === stationId);
    if (station) {
      updateDashboardStation(station, true);
      // Smooth scroll to dashboard
      const dashEl = document.getElementById("dashboard");
      if (dashEl) {
        dashEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Listen for custom map events
  window.addEventListener('airsight:stationSelected', (e) => {
    updateDashboardStation(e.detail, true);
  });

  // Setup Location Selector dropdown
  const locSelect = document.getElementById("location-selector");
  if (locSelect) {
    DELHI_NCR_STATIONS.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st.id;
      opt.textContent = `${st.name} [Simulated AQI ${st.aqi}]`;
      locSelect.appendChild(opt);
    });

    locSelect.addEventListener("change", (e) => {
      const station = DELHI_NCR_STATIONS.find(s => s.id === e.target.value);
      if (station) {
        updateDashboardStation(station, true);
        if (delhiMap) {
          delhiMap.panToStation(station.id);
        }
      }
    });
  }

  // Quick Map Station Buttons
  document.querySelectorAll(".map-station-quick-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const sId = e.currentTarget.dataset.stationId;
      const station = DELHI_NCR_STATIONS.find(s => s.id === sId);
      if (station) {
        updateDashboardStation(station, true);
        if (delhiMap) {
          delhiMap.panToStation(station.id);
        }
      }
    });
  });

  // 3. Forecast Horizon Tabs (+6h, +12h, +24h, +48h, +72h)
  const horizonBtns = document.querySelectorAll(".horizon-tab-btn");
  horizonBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const h = e.currentTarget.dataset.horizon;
      horizonBtns.forEach(b => b.classList.remove("active-tab"));
      e.currentTarget.classList.add("active-tab");

      const slice = FORECAST_SLICES.find(s => s.horizon === h);
      if (slice) {
        const hAqi = document.getElementById("slice-aqi");
        const hCat = document.getElementById("slice-category");
        const hPm25 = document.getElementById("slice-pm25");
        const hPm10 = document.getElementById("slice-pm10");
        const hWind = document.getElementById("slice-wind");
        const hTemp = document.getElementById("slice-temp");
        const hInversion = document.getElementById("slice-inversion");
        const hAdvisory = document.getElementById("slice-advisory");
        const hTime = document.getElementById("slice-time");

        if (hAqi) {
          hAqi.textContent = slice.aqi;
          hAqi.style.color = slice.color;
        }
        if (hCat) {
          hCat.textContent = slice.category;
          hCat.style.color = slice.color;
        }
        if (hPm25) hPm25.textContent = slice.pm25;
        if (hPm10) hPm10.textContent = slice.pm10;
        if (hWind) hWind.textContent = slice.wind;
        if (hTemp) hTemp.textContent = slice.temp;
        if (hInversion) hInversion.textContent = slice.inversionRisk;
        if (hAdvisory) hAdvisory.textContent = slice.advisory;
        if (hTime) hTime.textContent = `${slice.timeLabel} (${slice.horizon})`;
      }
    });
  });

  // 4. Mobile Menu Drawer
  const menuToggle = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-menu-drawer");
  const closeMenuBtn = document.getElementById("mobile-menu-close");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener("click", () => {
      mobileDrawer.classList.toggle("hidden");
    });
    if (closeMenuBtn) {
      closeMenuBtn.addEventListener("click", () => {
        mobileDrawer.classList.add("hidden");
      });
    }
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileDrawer.classList.add("hidden");
      });
    });
  }

  // 5. Solution Pipeline Expandable Details
  const pipelineCards = document.querySelectorAll(".solution-stage-card");
  pipelineCards.forEach(card => {
    card.addEventListener("click", () => {
      const details = card.querySelector(".stage-details");
      if (details) {
        details.classList.toggle("hidden");
      }
    });
  });

  // 6. Scroll Spy for Navigation Active State
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 130;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("text-cyan-400", "font-bold");
            link.classList.remove("text-slate-300");
          } else {
            link.classList.remove("text-cyan-400", "font-bold");
            link.classList.add("text-slate-300");
          }
        });
      }
    });
  });

  // Initial sync without toast
  updateDashboardStation(currentStation, false);
});

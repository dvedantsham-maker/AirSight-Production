/**
 * AirSight — Early Warning System & Real-Time Incident Simulator
 * Requirement 21: Dedicated alert section with Forecast -> Risk -> Alert -> Notification pipeline.
 */

class AirSightAlertSystem {
  constructor() {
    this.currentAlert = {
      level: "SEVERE WARNING (GRAP-IV)",
      headline: "Critical Atmospheric Inversion & Transboundary Plume Anticipated (Next 24h)",
      details: "Coupled forecasting models indicate persistent calm winds (<1.4 m/s) and boundary layer contraction to 290m over Anand Vihar, Ghaziabad and Noida corridors. AQI expected to exceed 420.",
      issuedAt: "Today 12:00 IST",
      validUntil: "Tomorrow 18:00 IST",
      impactZones: ["East Delhi", "Ghaziabad", "Noida", "Central Delhi"],
      recommendedActions: [
        "Enforce strict moratorium on construction and demolition activities.",
        "Deploy mechanical road sweepers and high-pressure water mist cannons along arterial corridors.",
        "Advise schools to suspend morning outdoor assemblies and athletic activities.",
        "Citizens with chronic respiratory/cardiac ailments should restrict outdoor exertion and keep HEPA purifiers operational."
      ]
    };
    
    this.scenarios = {
      stubble: {
        title: "Transboundary Stubble Smoke Episode",
        level: "EMERGENCY ALERT (GRAP-IV)",
        badgeColor: "bg-purple-600",
        borderColor: "border-purple-500",
        headline: "Massive Agricultural Biomass Smoke Inflow via NW Corridor (Next 24–48h)",
        details: "VIIRS satellite fire counts show intense burning across NW states. Sustained 315° north-westerly wind vector coupled with evening cooling will transport heavy smoke plume into Delhi-NCR basin.",
        impactZones: ["North Delhi", "West Delhi", "Central Delhi", "Ghaziabad"],
        forecastAQI: 460,
        actions: [
          "Mandate work-from-home advisory for 50% private and public sector employees.",
          "Restrict entry of non-essential diesel heavy commercial vehicles into NCT Delhi.",
          "Activate multi-department smog-tower arrays and targeted water-cannon deployments."
        ]
      },
      inversion: {
        title: "Nocturnal Shallow Inversion",
        level: "HIGH POLLUTION WARNING",
        badgeColor: "bg-rose-600",
        borderColor: "border-rose-500",
        headline: "Severe Nocturnal Thermal Inversion Layer Trapping Surface Emissions",
        details: "Radiation cooling will form a rigid inversion ceiling at 260m after 22:00 IST. Surface winds decelerating to 0.8 m/s. Local vehicular and domestic emissions will accumulate rapidly.",
        impactZones: ["Anand Vihar", "Punjabi Bagh", "Mandir Marg", "Sector 62 Noida"],
        forecastAQI: 395,
        actions: [
          "Divert inter-state diesel logistics traffic away from internal Delhi ring roads.",
          "Targeted night patrols to penalize unauthorized biomass and waste burning.",
          "Issue automated SMS advisory to vulnerable cardiac and asthma cohorts."
        ]
      },
      washout: {
        title: "Western Disturbance Rain Washout Event",
        level: "CLEARANCE ADVISORY",
        badgeColor: "bg-emerald-600",
        borderColor: "border-emerald-500",
        headline: "Western Disturbance Inflow with Wet Aerosol Scavenging (Rain Washout)",
        details: "IMD Doppler radar confirms rain front arriving with 15–25mm precipitation and 18 km/h gusty easterly winds. Aerosol washout will clear particulate loading by 70% within 12 hours.",
        impactZones: ["All Delhi-NCR Regions"],
        forecastAQI: 85,
        actions: [
          "De-escalate GRAP emergency restrictions to Stage I baseline.",
          "Monitor storm-water drainage at monitoring stations to safeguard ground sensor electronics.",
          "Acknowledge improved ventilation period for safe outdoor activities."
        ]
      }
    };
    
    this.bindEvents();
    this.updateAlertUI();
  }
  
  updateAlertUI() {
    const bannerEl = document.getElementById("alert-banner-headline");
    const detailsEl = document.getElementById("alert-banner-details");
    const levelEl = document.getElementById("alert-banner-level");
    const actionsEl = document.getElementById("alert-banner-actions");
    const zonesEl = document.getElementById("alert-banner-zones");
    
    if (bannerEl) bannerEl.textContent = this.currentAlert.headline;
    if (detailsEl) detailsEl.textContent = this.currentAlert.details;
    if (levelEl) levelEl.textContent = this.currentAlert.level;
    
    if (zonesEl) {
      zonesEl.innerHTML = this.currentAlert.impactZones
        .map(z => `<span class="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-xs border border-white/10 font-mono">${z}</span>`)
        .join('');
    }
    
    if (actionsEl) {
      actionsEl.innerHTML = this.currentAlert.recommendedActions
        .map(a => `<li class="flex items-start gap-2"><span class="text-cyan-400 mt-0.5">▸</span> <span>${a}</span></li>`)
        .join('');
    }
  }
  
  triggerScenario(key) {
    const s = this.scenarios[key];
    if (!s) return;
    
    this.currentAlert = {
      level: s.level,
      headline: s.headline,
      details: s.details,
      issuedAt: "Simulated Real-time Trigger",
      validUntil: "Next 24h Window",
      impactZones: s.impactZones,
      recommendedActions: s.actions
    };
    
    this.updateAlertUI();
    
    // Highlight scenario button
    document.querySelectorAll(".scenario-btn").forEach(b => {
      if (b.dataset.scenario === key) {
        b.classList.add("active-tab");
      } else {
        b.classList.remove("active-tab");
      }
    });
    
    // Flash banner effect
    const banner = document.getElementById("main-alert-card");
    if (banner) {
      banner.classList.add("ring-2", "ring-cyan-400");
      setTimeout(() => banner.classList.remove("ring-2", "ring-cyan-400"), 1200);
    }
  }
  
  bindEvents() {
    document.querySelectorAll(".scenario-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = e.currentTarget.dataset.scenario;
        this.triggerScenario(key);
      });
    });
  }
}

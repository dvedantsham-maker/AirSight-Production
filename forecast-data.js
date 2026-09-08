/**
 * AirSight — 72-Hour Coupled Time-Series Forecasting Dataset (Delhi-NCR Aggregate)
 * Smart India Hackathon 2026 | Problem ID: SIH26082 | Team TechNova
 * 
 * NOTE: Demo data structured to represent real atmospheric coupling:
 * - Night-time radiation cooling drops mixing height (<350m) and slows winds (<1.8 m/s), trapping PM2.5.
 * - Midday solar heating expands boundary layer (>900m) and accelerates wind (>4.5 m/s), diluting pollutants.
 */

const TIME_SERIES_FORECAST_DATA = {
  // 24 Hours Observed (T-24h to T0) + 72 Hours Forecast (T+1h to T+72h)
  timestamps: [
    "-24h", "-20h", "-16h", "-12h", "-8h", "-4h", "NOW",
    "+6h", "+12h", "+18h", "+24h", "+30h", "+36h", "+42h", "+48h", "+54h", "+60h", "+66h", "+72h"
  ],
  displayTimes: [
    "Yesterday 14:00", "Yesterday 18:00", "Yesterday 22:00", "Today 02:00", "Today 06:00", "Today 10:00", "Now 14:00",
    "Today 20:00 (+6h)", "Tonight 02:00 (+12h)", "Tomorrow 08:00 (+18h)", "Tomorrow 14:00 (+24h)",
    "Tomorrow 20:00 (+30h)", "Day 2 02:00 (+36h)", "Day 2 08:00 (+42h)", "Day 2 14:00 (+48h)",
    "Day 2 20:00 (+54h)", "Day 3 02:00 (+60h)", "Day 3 08:00 (+66h)", "Day 3 14:00 (+72h)"
  ],
  // Observed PM2.5 (null after index 6)
  observedPM25: [
    118, 155, 210, 248, 280, 195, 162,
    null, null, null, null, null, null, null, null, null, null, null, null
  ],
  // Observed AQI (null after index 6)
  observedAQI: [
    240, 295, 345, 385, 410, 325, 292,
    null, null, null, null, null, null, null, null, null, null, null, null
  ],
  // AI Predicted PM2.5 (starts at index 6 for continuous visual line)
  predictedPM25: [
    null, null, null, null, null, null, 162,
    228, 295, 260, 185, 245, 310, 275, 198, 230, 280, 240, 170
  ],
  // AI Predicted AQI
  predictedAQI: [
    null, null, null, null, null, null, 292,
    345, 418, 385, 315, 365, 432, 400, 330, 350, 405, 370, 305
  ],
  // Confidence Interval Bounds (95% CI)
  predictedAQI_Upper: [
    null, null, null, null, null, null, 292,
    365, 442, 410, 340, 395, 465, 435, 365, 390, 448, 415, 350
  ],
  predictedAQI_Lower: [
    null, null, null, null, null, null, 292,
    325, 394, 360, 290, 335, 399, 365, 295, 310, 362, 325, 260
  ],
  // Coupled Weather Indicators
  windSpeed: [
    3.8, 2.4, 1.6, 1.2, 1.4, 2.8, 3.2,
    1.9, 1.1, 1.5, 3.4, 1.8, 0.9, 1.3, 3.1, 2.0, 1.2, 1.6, 3.5
  ],
  mixingHeight: [
    850, 620, 380, 290, 320, 580, 780,
    490, 260, 310, 720, 440, 240, 290, 690, 480, 280, 330, 750
  ],
  temperature: [
    24, 21, 18, 15, 14, 18, 23,
    19, 14, 15, 22, 18, 13, 14, 21, 18, 14, 15, 22
  ]
};

const FORECAST_SLICES = [
  {
    horizon: "+6h",
    timeLabel: "Today 20:00",
    aqi: 345,
    category: "Very Poor",
    color: "#ef4444",
    pm25: "228 µg/m³",
    pm10: "360 µg/m³",
    wind: "1.9 m/s (NW)",
    temp: "19°C",
    inversionRisk: "Moderate Inversion",
    advisory: "Evening peak traffic coupled with boundary layer contraction. Limit outdoor exercise."
  },
  {
    horizon: "+12h",
    timeLabel: "Tonight 02:00",
    aqi: 418,
    category: "Severe",
    color: "#9333ea",
    pm25: "295 µg/m³",
    pm10: "450 µg/m³",
    wind: "1.1 m/s (Calm)",
    temp: "14°C",
    inversionRisk: "Critical Shallow Layer (<260m)",
    advisory: "Thermal inversion peak. High particulate concentration trapped at surface. Close windows."
  },
  {
    horizon: "+24h",
    timeLabel: "Tomorrow 14:00",
    aqi: 315,
    category: "Very Poor",
    color: "#ef4444",
    pm25: "185 µg/m³",
    pm10: "290 µg/m³",
    wind: "3.4 m/s (WNW)",
    temp: "22°C",
    inversionRisk: "Partial Solar Dispersion",
    advisory: "Diurnal heating expands mixing layer. Partial relief, but levels remain hazardous."
  },
  {
    horizon: "+48h",
    timeLabel: "Day 2 14:00",
    aqi: 330,
    category: "Very Poor",
    color: "#ef4444",
    pm25: "198 µg/m³",
    pm10: "310 µg/m³",
    wind: "3.1 m/s (NW)",
    temp: "21°C",
    inversionRisk: "Moderate Trapping",
    advisory: "Secondary peak expected due to transboundary biomass plume transport from NW."
  },
  {
    horizon: "+72h",
    timeLabel: "Day 3 14:00",
    aqi: 305,
    category: "Very Poor",
    color: "#ef4444",
    pm25: "170 µg/m³",
    pm10: "275 µg/m³",
    wind: "3.5 m/s (W)",
    temp: "22°C",
    inversionRisk: "Improved Ventilation",
    advisory: "Western disturbance winds forecast to induce dispersion. Gradual recovery towards Poor category."
  }
];

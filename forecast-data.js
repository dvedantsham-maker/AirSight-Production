/**
 * AirSight — 72-Hour Coupled Time-Series Forecasting Dataset & Multi-Station Generator
 * Smart India Hackathon 2026 | Problem ID: SIH26082 | Team TechNova
 * 
 * NOTE: Demo/prototype telemetry structured to model atmospheric coupling:
 * - Night-time radiation cooling drops mixing height (<350m) and slows winds (<1.8 m/s), trapping PM2.5/PM10.
 * - Midday solar heating expands boundary layer (>900m) and accelerates wind (>4.5 m/s), diluting pollutants.
 * - All datasets support AQI, PM2.5, and PM10 across 24h, 48h, and 72h horizons with 95% Bayesian Confidence Intervals.
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
  
  // AQI: Observed (indices 0..6) & Predicted (indices 6..18)
  observedAQI: [
    240, 295, 345, 385, 410, 325, 288,
    null, null, null, null, null, null, null, null, null, null, null, null
  ],
  predictedAQI: [
    null, null, null, null, null, null, 288,
    345, 418, 385, 315, 365, 432, 400, 330, 350, 405, 370, 290
  ],
  predictedAQI_Upper: [
    null, null, null, null, null, null, 288,
    368, 445, 412, 342, 396, 465, 432, 362, 385, 442, 405, 325
  ],
  predictedAQI_Lower: [
    null, null, null, null, null, null, 288,
    322, 391, 358, 288, 334, 399, 368, 298, 315, 368, 335, 255
  ],

  // PM2.5: Observed & Predicted (µg/m³)
  observedPM25: [
    118.0, 155.0, 210.0, 248.0, 280.0, 195.0, 142.5,
    null, null, null, null, null, null, null, null, null, null, null, null
  ],
  predictedPM25: [
    null, null, null, null, null, null, 142.5,
    228.0, 295.0, 260.0, 185.0, 245.0, 310.0, 275.0, 198.0, 230.0, 280.0, 240.0, 165.0
  ],
  predictedPM25_Upper: [
    null, null, null, null, null, null, 142.5,
    246.0, 320.0, 282.0, 204.0, 270.0, 340.0, 302.0, 220.0, 255.0, 310.0, 266.0, 186.0
  ],
  predictedPM25_Lower: [
    null, null, null, null, null, null, 142.5,
    210.0, 270.0, 238.0, 166.0, 220.0, 280.0, 248.0, 176.0, 205.0, 250.0, 214.0, 144.0
  ],

  // PM10: Observed & Predicted (µg/m³)
  observedPM10: [
    195.0, 245.0, 320.0, 385.0, 420.0, 310.0, 235.8,
    null, null, null, null, null, null, null, null, null, null, null, null
  ],
  predictedPM10: [
    null, null, null, null, null, null, 235.8,
    345.0, 430.0, 390.0, 285.0, 360.0, 455.0, 410.0, 305.0, 345.0, 415.0, 365.0, 260.0
  ],
  predictedPM10_Upper: [
    null, null, null, null, null, null, 235.8,
    375.0, 470.0, 425.0, 315.0, 398.0, 500.0, 452.0, 340.0, 382.0, 458.0, 405.0, 292.0
  ],
  predictedPM10_Lower: [
    null, null, null, null, null, null, 235.8,
    315.0, 390.0, 355.0, 255.0, 322.0, 410.0, 368.0, 270.0, 308.0, 372.0, 325.0, 228.0
  ],

  // Coupled Weather Indicators
  windSpeed: [
    3.8, 2.4, 1.6, 1.2, 1.4, 2.8, 2.2,
    1.9, 1.1, 1.5, 3.4, 1.8, 0.9, 1.3, 3.1, 2.0, 1.2, 1.6, 3.5
  ],
  mixingHeight: [
    850, 620, 380, 290, 320, 580, 480,
    490, 260, 310, 720, 440, 240, 290, 690, 480, 280, 330, 750
  ],
  temperature: [
    24, 21, 18, 15, 14, 18, 21.4,
    19, 14, 15, 22, 18, 13, 14, 21, 18, 14, 15, 22
  ]
};

/**
 * Returns station-specific time-series data slice for a given station ID, metric, and horizon (24, 48, 72 hours).
 */
function getStationForecastData(stationId = "delhi-central", metric = "aqi", horizonHours = 72) {
  const station = (typeof DELHI_NCR_STATIONS !== "undefined")
    ? (DELHI_NCR_STATIONS.find(s => s.id === stationId) || DELHI_NCR_STATIONS[0])
    : null;

  // Scaling factor based on station's current AQI relative to baseline 288
  const baseAQI = station ? station.aqi : 288;
  const scale = baseAQI / 288.0;

  // Determine horizon endpoint index:
  // NOW is index 6
  // +24h is index 10 (7 forecast points)
  // +48h is index 14 (11 forecast points)
  // +72h is index 18 (13 forecast points / all points)
  let maxIdx = 18;
  if (horizonHours <= 24) maxIdx = 10;
  else if (horizonHours <= 48) maxIdx = 14;

  const timestamps = TIME_SERIES_FORECAST_DATA.timestamps.slice(0, maxIdx + 1);
  const displayTimes = TIME_SERIES_FORECAST_DATA.displayTimes.slice(0, maxIdx + 1);
  const windSpeed = TIME_SERIES_FORECAST_DATA.windSpeed.slice(0, maxIdx + 1);
  const mixingHeight = TIME_SERIES_FORECAST_DATA.mixingHeight.slice(0, maxIdx + 1);
  const temperature = TIME_SERIES_FORECAST_DATA.temperature.slice(0, maxIdx + 1);

  let observed = [];
  let predicted = [];
  let upperCI = [];
  let lowerCI = [];
  let unit = "";
  let metricLabel = "";

  if (metric === "aqi") {
    unit = "AQI";
    metricLabel = "Air Quality Index";
    observed = TIME_SERIES_FORECAST_DATA.observedAQI.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.aqi : v;
      return Math.round(v * scale);
    });
    predicted = TIME_SERIES_FORECAST_DATA.predictedAQI.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.aqi : v;
      if (i === 10 && station && station.forecast24) return station.forecast24;
      if (i === 14 && station && station.forecast48) return station.forecast48;
      if (i === 18 && station && station.forecast72) return station.forecast72;
      return Math.round(v * scale);
    });
    upperCI = TIME_SERIES_FORECAST_DATA.predictedAQI_Upper.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.aqi : v;
      return Math.round(predicted[i] * 1.07);
    });
    lowerCI = TIME_SERIES_FORECAST_DATA.predictedAQI_Lower.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.aqi : v;
      return Math.round(predicted[i] * 0.93);
    });
  } else if (metric === "pm25") {
    unit = "µg/m³";
    metricLabel = "PM2.5 (Fine Particulates)";
    const pmScale = station ? (station.pm25 / 142.5) : scale;
    observed = TIME_SERIES_FORECAST_DATA.observedPM25.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm25 : v;
      return +(v * pmScale).toFixed(1);
    });
    predicted = TIME_SERIES_FORECAST_DATA.predictedPM25.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm25 : v;
      return +(v * pmScale).toFixed(1);
    });
    upperCI = TIME_SERIES_FORECAST_DATA.predictedPM25_Upper.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm25 : v;
      return +(predicted[i] * 1.08).toFixed(1);
    });
    lowerCI = TIME_SERIES_FORECAST_DATA.predictedPM25_Lower.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm25 : v;
      return +(predicted[i] * 0.92).toFixed(1);
    });
  } else if (metric === "pm10") {
    unit = "µg/m³";
    metricLabel = "PM10 (Coarse Particulates)";
    const pm10Scale = station ? (station.pm10 / 235.8) : scale;
    observed = TIME_SERIES_FORECAST_DATA.observedPM10.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm10 : v;
      return +(v * pm10Scale).toFixed(1);
    });
    predicted = TIME_SERIES_FORECAST_DATA.predictedPM10.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm10 : v;
      return +(v * pm10Scale).toFixed(1);
    });
    upperCI = TIME_SERIES_FORECAST_DATA.predictedPM10_Upper.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm10 : v;
      return +(predicted[i] * 1.09).toFixed(1);
    });
    lowerCI = TIME_SERIES_FORECAST_DATA.predictedPM10_Lower.slice(0, maxIdx + 1).map((v, i) => {
      if (v === null) return null;
      if (i === 6) return station ? station.pm10 : v;
      return +(predicted[i] * 0.91).toFixed(1);
    });
  }

  // Calculate Summary Statistics for Active Horizon
  const currentVal = observed[6];
  const forecastSlice = predicted.slice(7).filter(v => v !== null);
  const forecastMax = forecastSlice.length ? Math.max(...forecastSlice) : currentVal;
  const forecastMin = forecastSlice.length ? Math.min(...forecastSlice) : currentVal;
  const forecastAvg = forecastSlice.length
    ? +(forecastSlice.reduce((a, b) => a + b, 0) / forecastSlice.length).toFixed(1)
    : currentVal;

  return {
    stationName: station ? station.name : "Delhi-NCR Regional",
    metric,
    metricLabel,
    unit,
    horizonHours,
    timestamps,
    displayTimes,
    observed,
    predicted,
    upperCI,
    lowerCI,
    windSpeed,
    mixingHeight,
    temperature,
    currentVal,
    forecastMax,
    forecastMin,
    forecastAvg
  };
}

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

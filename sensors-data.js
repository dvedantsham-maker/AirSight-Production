/**
 * AirSight — Sensors, Hardware Specs, Pollutants & Architecture Metadata
 * Smart India Hackathon 2026 | Problem ID: SIH26082 | Team TechNova
 */

const SENSOR_CATALOG = [
  {
    id: "pm",
    name: "Particulate Matter (PM2.5 / PM10)",
    measures: "Suspended atmospheric fine & coarse aerosols (0.3 µm to 10 µm diameter)",
    whyMatters: "Directly determines National AQI rating; penetrates deep into lung alveoli and bloodstream.",
    hardwareExamples: "Plantower PMS5003 / PMS7003 (Laser scattering), Sensirion SPS30 (Optical aerosol spec)",
    operatingPrinciple: "Laser particle counter based on Mie scattering; counts individual particle pulses per volume.",
    accuracy: "±10% @ 100~500 µg/m³",
    icon: "activity"
  },
  {
    id: "temp",
    name: "Ambient Temperature",
    measures: "Dry-bulb ambient air temperature (°C)",
    whyMatters: "Ground temperature triggers nocturnal thermal inversion layers, capping vertical pollutant dispersal.",
    hardwareExamples: "Sensirion SHT31, Bosch BME280, DHT22 (Prototype)",
    operatingPrinciple: "Band-gap silicon semiconductor temperature sensor with factory calibrated digital I2C bus.",
    accuracy: "±0.2°C",
    icon: "thermometer"
  },
  {
    id: "humidity",
    name: "Relative Humidity (RH)",
    measures: "Atmospheric moisture saturation ratio (0–100% RH)",
    whyMatters: "High moisture catalyzes secondary aerosol formation (sulfate/nitrate particles) and induces dense winter smog/fog.",
    hardwareExamples: "Sensirion SHT31, Bosch BME280",
    operatingPrinciple: "Capacitive polymer sensing element responding to dielectric permittivity shifts.",
    accuracy: "±2% RH",
    icon: "droplets"
  },
  {
    id: "pressure",
    name: "Barometric Pressure",
    measures: "Atmospheric surface pressure (hPa / mbar)",
    whyMatters: "High-pressure anticyclonic systems create stagnant air domes over Delhi-NCR with zero vertical ventilation.",
    hardwareExamples: "Bosch BME280, BMP280, DPS310",
    operatingPrinciple: "Piezo-resistive pressure sensor with integrated low-noise 24-bit ADC.",
    accuracy: "±1 hPa (absolute)",
    icon: "gauge"
  },
  {
    id: "wind_speed",
    name: "Wind Speed",
    measures: "Horizontal boundary layer airflow velocity (m/s, km/h)",
    whyMatters: "Speeds under 2.0 m/s cause pollutant accumulation; speeds >5.0 m/s drive horizontal plume dispersion.",
    hardwareExamples: "AeroVane 3-Cup Anemometer, Solid-State Ultrasonic Anemometer",
    operatingPrinciple: "Ultrasonic acoustic transit time difference or calibrated Hall-effect magnetic reed switch counter.",
    accuracy: "±0.3 m/s",
    icon: "wind"
  },
  {
    id: "wind_dir",
    name: "Wind Direction",
    measures: "Azimuthal wind compass bearing (0°–360°)",
    whyMatters: "North-westerly winds transport agricultural stubble smoke from Punjab/Haryana into Delhi-NCR basin.",
    hardwareExamples: "Precision Potentiometric Wind Vane, 2D Ultrasonic Vector Transducer",
    operatingPrinciple: "Contactless optical gray-code encoder or low-friction precision continuous potentiometer.",
    accuracy: "±3°",
    icon: "compass"
  },
  {
    id: "rainfall",
    name: "Precipitation / Rainfall",
    measures: "Surface rainfall intensity & cumulative volume (mm/h)",
    whyMatters: "Rain causes atmospheric wet deposition / aerosol scavenging ('rain washout'), rapidly dropping PM concentrations.",
    hardwareExamples: "Tipping Bucket Rain Gauge (0.2mm per tip), Optical Infrared Rain Sensor",
    operatingPrinciple: "Calibrated dual-compartment tipping bucket triggering magnetic dry-reed closure pulses.",
    accuracy: "±1% up to 50 mm/h",
    icon: "cloud-rain"
  },
  {
    id: "gases",
    name: "Toxic Gaseous Precursors",
    measures: "NO2, SO2, CO, Ground-level Ozone (O3)",
    whyMatters: "Primary combustion gases undergo photochemical reactions under sunlight to form toxic secondary smog.",
    hardwareExamples: "Alphasense 4-Electrode Electrochemical (B4 series), Winsen MQ-131 (O3), MiCS-6814",
    operatingPrinciple: "Amperometric electrochemical reaction generating micro-current proportional to gas partial pressure.",
    accuracy: "Parts-per-billion (ppb) resolution",
    icon: "flame"
  }
];

const POLLUTANTS_INFO = [
  {
    code: "PM2.5",
    name: "Fine Particulate Matter",
    size: "≤ 2.5 micrometers (30x thinner than human hair)",
    cpcbStandard: "60 µg/m³ (24-hr avg)",
    whoStandard: "15 µg/m³ (24-hr avg)",
    sources: "Vehicular exhaust, biomass burning, coal thermal plants, secondary aerosol synthesis.",
    danger: "Penetrates into lung alveoli and enters blood circulation; primary driver of Delhi-NCR winter smog emergencies."
  },
  {
    code: "PM10",
    name: "Coarse Particulate Matter",
    size: "≤ 10 micrometers",
    cpcbStandard: "100 µg/m³ (24-hr avg)",
    whoStandard: "45 µg/m³ (24-hr avg)",
    sources: "Construction demolition dust, unpaved road resuspension, mechanical abrasion, desert dust storms.",
    danger: "Irritates upper respiratory tract, eyes, and mucous membranes; triggers severe asthma exacerbations."
  },
  {
    code: "NO2",
    name: "Nitrogen Dioxide",
    size: "Gaseous molecule",
    cpcbStandard: "80 µg/m³ (24-hr avg)",
    whoStandard: "25 µg/m³ (24-hr avg)",
    sources: "High-temperature internal combustion in diesel vehicles, thermal power plants, industrial furnaces.",
    danger: "Corrosive gas triggering airway inflammation; key precursor to ground-level ozone and nitrate aerosols."
  },
  {
    code: "SO2",
    name: "Sulfur Dioxide",
    size: "Gaseous molecule",
    cpcbStandard: "80 µg/m³ (24-hr avg)",
    whoStandard: "40 µg/m³ (24-hr avg)",
    sources: "Industrial boiler fuel burning, brick kilns, thermal power generation, heavy diesel fuel oils.",
    danger: "Causes bronchial constriction and forms microscopic sulfate aerosols upon contact with humidity."
  },
  {
    code: "CO",
    name: "Carbon Monoxide",
    size: "Colorless, odorless gas",
    cpcbStandard: "4 mg/m³ (1-hr avg)",
    whoStandard: "4 mg/m³ (24-hr avg)",
    sources: "Incomplete combustion in idling vehicular traffic, waste burning, domestic chulha stoves.",
    danger: "Binds with hemoglobin to form carboxyhemoglobin, inhibiting vital oxygen delivery to tissues."
  },
  {
    code: "O3",
    name: "Ground-Level Ozone",
    size: "Secondary photochemical pollutant",
    cpcbStandard: "100 µg/m³ (8-hr avg)",
    whoStandard: "100 µg/m³ (8-hr avg)",
    sources: "Formed in sunlight via photochemical reactions between NOx and Volatile Organic Compounds (VOCs).",
    danger: "Potent oxidizing agent that inflames airways and damages respiratory cell membranes; peaks in hot afternoons."
  },
  {
    code: "VOCs",
    name: "Volatile Organic Compounds",
    size: "Diverse organic vapors (Benzene, Toluene, Xylene)",
    cpcbStandard: "5 µg/m³ (Benzene annual avg)",
    whoStandard: "No safe threshold",
    sources: "Evaporative emissions from petrol pumps, chemical solvents, paints, industrial degreasers.",
    danger: "Carcinogenic properties; acts as the primary chemical trigger for secondary photochemical smog formation."
  }
];

const CANDIDATE_MODELS = [
  {
    category: "Traditional Time-Series",
    models: [
      { name: "ARIMA (AutoRegressive Integrated Moving Average)", strength: "Excellent linear baseline; transparent mathematical interpretability.", limitation: "Cannot handle non-linear atmospheric interactions or exogenous weather features." },
      { name: "SARIMAX (Seasonal ARIMA with eXogenous Regressors)", strength: "Incorporates diurnal seasonality and external weather covariates (wind/temp).", limitation: "Struggles with high-dimensional spatial correlations across adjacent city zones." }
    ]
  },
  {
    category: "Machine Learning (Ensemble Trees)",
    models: [
      { name: "XGBoost (Extreme Gradient Boosting)", strength: "Superior handling of non-linear tabular features, lagged weather metrics, and rapid training speed.", limitation: "Lacks internal temporal state memory; requires extensive manual lag feature engineering." },
      { name: "LightGBM & Random Forest", strength: "Leaf-wise tree growth enables fast inference on high-frequency IoT streaming telemetry.", limitation: "Cannot natively capture long-range continuous continuous temporal sequences." }
    ]
  },
  {
    category: "Deep Learning (Temporal & Spatial)",
    models: [
      { name: "Bi-Directional LSTM with Temporal Attention", strength: "Captures both historical trajectory and forward seasonal patterns; attention highlights critical weather anomalies.", limitation: "Higher computational cost for multi-step 72-hour recursive forecasting." },
      { name: "Spatio-Temporal Graph Neural Network (ST-GNN) / Informer", strength: "Couples spatial road/wind graphs with multi-head self-attention for state-of-the-art 72-hour horizon forecasting across all Delhi-NCR nodes.", limitation: "Requires GPU compute cluster for training across hundreds of distributed nodes." }
    ]
  }
];

const CHALLENGES_STRATEGIES = [
  {
    id: 1,
    challenge: "Missing or Sensor Drift Telemetry",
    issue: "Low-cost IoT sensors suffer from drift, dust occlusion, and intermittent cellular dropouts.",
    strategy: "Iterative KNN Imputation & Dynamic Drift Auto-Calibration against reference CPCB CAAQMS gold stations."
  },
  {
    id: 2,
    challenge: "Sudden Micro-Meteorological Shifts",
    issue: "Rapid shifts in wind velocity or unexpected evening thermal inversions cause sharp non-linear AQI surges.",
    strategy: "Real-time IMD High-Resolution Rapid Refresh (HRRR) numerical weather integration with physics-guided loss functions."
  },
  {
    id: 3,
    challenge: "Episodic Biomass & Stubble Fires",
    issue: "Agricultural residue burning in Punjab/Haryana introduces sudden massive transboundary smoke pulses.",
    strategy: "Daily satellite fire radiative power (FRP) feeds from VIIRS/MODIS ingested as dynamic upwind boundary conditions."
  },
  {
    id: 4,
    challenge: "High-Dimensional Spatial Heterogeneity",
    issue: "AQI at Anand Vihar (420) can drastically differ from Central Delhi (280) due to localized micro-climate.",
    strategy: "Spatial Graph Convolutional layers representing Delhi-NCR arterial road topologies and elevation contours."
  },
  {
    id: 5,
    challenge: "False Alarm Fatigue in Early Warnings",
    issue: "Over-predicting severe alerts leads citizens and municipal authorities to ignore emergency advisories.",
    strategy: "Ensemble Bayesian confidence thresholding with multi-model consensus before triggering public GRAP-IV advisories."
  }
];

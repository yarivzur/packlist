export type WeatherBucket = "cold" | "mild" | "hot";

export interface WeatherData {
  bucket: WeatherBucket;
  rainProbability: number; // 0-1
  avgTempC: number;
  fetchedAt: string; // ISO timestamp
  countryCode?: string; // ISO 3166-1 alpha-2, e.g. "ES"
  cityName?: string;    // resolved city name from geocoding
  isHistorical?: boolean; // true when based on prior-year climate data (trip > 16 days out)
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  country_code?: string;
  admin1?: string; // state / region, e.g. "California"
}

interface OpenMeteoForecast {
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[]; // archive API uses this instead of probability
  };
}

const FORECAST_WINDOW_DAYS = 16;

function shiftDateByYears(dateStr: string, years: number): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export async function geocodeDestination(
  destination: string
): Promise<GeocodingResult | null> {
  // Split "City, State/Country" into parts for smarter matching
  const parts = destination.split(",").map((p) => p.trim());
  const cityQuery = parts[0];
  const regionHint = parts.slice(1).join(" ").toLowerCase(); // e.g. "california" or "france"

  // Try with more results so we can pick the best match when there's a region hint
  const count = regionHint ? 5 : 1;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: GeocodingResult[] };
  if (!data.results?.length) return null;

  if (!regionHint) return data.results[0];

  // Try to find a result whose admin1 (state/region) or country matches the hint
  const match = data.results.find(
    (r) =>
      r.admin1?.toLowerCase().includes(regionHint) ||
      r.country?.toLowerCase().includes(regionHint) ||
      r.country_code?.toLowerCase() === regionHint
  );
  return match ?? data.results[0];
}

export async function fetchWeatherForTrip(
  destination: string,
  startDate: string, // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
): Promise<WeatherData | null> {
  try {
    const geo = await geocodeDestination(destination);
    if (!geo) return null;

    const today = new Date();
    const tripStart = new Date(startDate);
    const daysUntilTrip = Math.floor(
      (tripStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isHistorical = daysUntilTrip > FORECAST_WINDOW_DAYS;

    let url: string;
    let fetchStart = startDate;
    let fetchEnd = endDate;

    if (isHistorical) {
      // Shift to same period last year for climate trend data
      fetchStart = shiftDateByYears(startDate, -1);
      fetchEnd = shiftDateByYears(endDate, -1);
      url =
        `https://archive-api.open-meteo.com/v1/archive` +
        `?latitude=${geo.latitude}&longitude=${geo.longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&start_date=${fetchStart}&end_date=${fetchEnd}` +
        `&timezone=auto`;
    } else {
      url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${geo.latitude}&longitude=${geo.longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&start_date=${fetchStart}&end_date=${fetchEnd}` +
        `&timezone=auto`;
    }

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as OpenMeteoForecast;
    const { temperature_2m_max, temperature_2m_min } = data.daily;

    if (!temperature_2m_max?.length) return null;

    const avgMax =
      temperature_2m_max.reduce((a, b) => a + b, 0) / temperature_2m_max.length;
    const avgMin =
      temperature_2m_min.reduce((a, b) => a + b, 0) / temperature_2m_min.length;
    const avgTempC = (avgMax + avgMin) / 2;

    let rainProbability: number;
    if (isHistorical) {
      // Archive API gives precipitation_sum (mm/day); treat avg > 2mm/day as rainy
      const precip = data.daily.precipitation_sum ?? [];
      const avgPrecip = precip.length
        ? precip.reduce((a, b) => a + (b ?? 0), 0) / precip.length
        : 0;
      rainProbability = avgPrecip > 2 ? 0.6 : avgPrecip > 0.5 ? 0.2 : 0.05;
    } else {
      const probs = data.daily.precipitation_probability_max ?? [];
      const maxRain = Math.max(...probs.map((v) => v ?? 0));
      rainProbability = maxRain / 100;
    }

    let bucket: WeatherBucket;
    if (avgTempC < 10) bucket = "cold";
    else if (avgTempC < 20) bucket = "mild";
    else bucket = "hot";

    return {
      bucket,
      rainProbability,
      avgTempC: Math.round(avgTempC * 10) / 10,
      fetchedAt: new Date().toISOString(),
      countryCode: geo.country_code,
      cityName: geo.name,
      isHistorical,
    };
  } catch {
    return null;
  }
}

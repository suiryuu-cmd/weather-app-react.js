export type Place = {
  name: string
  detail: string
  latitude: number
  longitude: number
}

type Kind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

export type Current = {
  temperature: number
  feelsLike: number
  humidity: number
  wind: number
  label: string
  kind: Kind
  isDay: boolean
  time: string
}

// WMO weather interpretation codes, https://open-meteo.com/en/docs
const WMO: Record<number, [string, Kind]> = {
  0: ['Clear sky', 'clear'],
  1: ['Mainly clear', 'clear'],
  2: ['Partly cloudy', 'cloudy'],
  3: ['Overcast', 'cloudy'],
  45: ['Fog', 'fog'],
  48: ['Rime fog', 'fog'],
  51: ['Light drizzle', 'rain'],
  53: ['Drizzle', 'rain'],
  55: ['Heavy drizzle', 'rain'],
  56: ['Freezing drizzle', 'rain'],
  57: ['Freezing drizzle', 'rain'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Light showers', 'rain'],
  81: ['Showers', 'rain'],
  82: ['Violent showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm with hail', 'storm'],
  99: ['Thunderstorm with hail', 'storm'],
}

async function getJson(url: string) {
  const res = await fetch(url).catch(() => {
    throw new Error("Couldn't reach the weather service. Check your connection and try again.")
  })
  if (!res.ok) throw new Error(`Weather service returned ${res.status}. Try again in a moment.`)
  return res.json()
}

export async function searchCities(name: string): Promise<Place[]> {
  const params = new URLSearchParams({ name, count: '5', language: 'en', format: 'json' })
  const data = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
  return (data.results ?? []).map(
    (r: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({
      name: r.name,
      detail: [r.admin1, r.country].filter(Boolean).join(', '),
      latitude: r.latitude,
      longitude: r.longitude,
    }),
  )
}

export async function getCurrent({ latitude, longitude }: Place): Promise<Current> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    timezone: 'auto',
  })
  const { current: c } = await getJson(`https://api.open-meteo.com/v1/forecast?${params}`)
  const [label, kind] = WMO[c.weather_code] ?? ['Unknown', 'cloudy']
  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    label,
    kind,
    isDay: c.is_day === 1,
    time: c.time,
  }
}

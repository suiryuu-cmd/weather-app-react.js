export type Place = {
  name: string
  detail: string
  latitude: number
  longitude: number
}

export type Kind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

type Current = {
  temperature: number
  feelsLike: number
  humidity: number
  wind: number
  label: string
  kind: Kind
  isDay: boolean
  // Within 40 minutes of today's sunrise or sunset.
  twilight: 'dawn' | 'dusk' | null
  time: string
}

export type Hour = { time: string; temperature: number; label: string; kind: Kind; isDay: boolean }

export type Day = { date: string; min: number; max: number; label: string; kind: Kind }

export type Weather = { current: Current; hours: Hour[]; days: Day[] }

export type Unit = 'C' | 'F'

export const temperature = (celsius: number, unit: Unit) => Math.round(unit === 'F' ? (celsius * 9) / 5 + 32 : celsius)

export const windSpeed = (kmh: number, unit: Unit) => Math.round(unit === 'F' ? kmh * 0.621371 : kmh)

// Open-Meteo times are the place's own wall clock without an offset ("2026-09-26T21:15").
// Reading them as UTC and formatting them in UTC shows that clock exactly, untouched by
// the viewer's own timezone or daylight-saving changes.
export const wallClock = (time: string) => new Date(`${time.length === 10 ? `${time}T12:00` : time}Z`)
export const clockFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' })

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

const describe = (code: number) => WMO[code] ?? ['Unknown', 'cloudy']

// Cached weather comes back from localStorage, which anyone can edit, and older app
// versions may have stored a different shape. Check every field the UI reads.
const KINDS = new Set<unknown>(Object.values(WMO).map(([, kind]) => kind))
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const isTime = (v: unknown) => typeof v === 'string' && !Number.isNaN(wallClock(v).getTime())
const isText = (v: unknown) => typeof v === 'string'

export function isWeather(value: unknown): value is Weather {
  const w = value as Weather | null
  const c = w?.current
  return (
    !!c &&
    isTime(c.time) &&
    [c.temperature, c.feelsLike, c.humidity, c.wind].every(isNum) &&
    isText(c.label) &&
    KINDS.has(c.kind) &&
    typeof c.isDay === 'boolean' &&
    [null, 'dawn', 'dusk'].includes(c.twilight) &&
    Array.isArray(w.hours) &&
    w.hours.every((h) => isTime(h?.time) && isNum(h.temperature) && isText(h.label) && KINDS.has(h.kind) && typeof h.isDay === 'boolean') &&
    Array.isArray(w.days) &&
    w.days.every((d) => isTime(d?.date) && isNum(d.min) && isNum(d.max) && isText(d.label) && KINDS.has(d.kind))
  )
}

async function getJson(url: string) {
  // Without a timeout a stalled connection would leave the app loading forever.
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) }).catch(() => {
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

const minutesBetween = (a: string, b: string) => Math.abs(wallClock(a).getTime() - wallClock(b).getTime()) / 60000

export async function getWeather({ latitude, longitude }: Place): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    hourly: 'temperature_2m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    forecast_days: '7',
    timezone: 'auto',
  })
  const { current: c, hourly: h, daily: d } = await getJson(`https://api.open-meteo.com/v1/forecast?${params}`)

  const [label, kind] = describe(c.weather_code)
  // Near the poles the sun may not rise or set: Open-Meteo then returns midnight
  // placeholders (equal times in polar night, sunset on the next day in polar day).
  const sunrise: string | undefined = d.sunrise?.[0]
  const sunset: string | undefined = d.sunset?.[0]
  let twilight: Current['twilight'] = null
  if (sunrise && sunset && sunrise < sunset && sunrise.slice(0, 10) === sunset.slice(0, 10)) {
    if (minutesBetween(c.time, sunrise) <= 40) twilight = 'dawn'
    else if (minutesBetween(c.time, sunset) <= 40) twilight = 'dusk'
  }

  // Next 24 hours, starting with the current hour.
  const first = Math.max(0, (h.time as string[]).findIndex((t) => t >= c.time.slice(0, 13)))
  const hours = (h.time as string[]).slice(first, first + 24).map((time, i) => {
    const [hourLabel, hourKind] = describe(h.weather_code[first + i])
    return { time, temperature: h.temperature_2m[first + i], label: hourLabel, kind: hourKind, isDay: h.is_day[first + i] === 1 }
  })
  // The first tile reads "Now", so it shows the same reading as the big number above it.
  if (hours[0]) Object.assign(hours[0], { temperature: c.temperature_2m, label, kind, isDay: c.is_day === 1 })

  const days = (d.time as string[]).map((date, i) => {
    const [dayLabel, dayKind] = describe(d.weather_code[i])
    return { date, min: d.temperature_2m_min[i], max: d.temperature_2m_max[i], label: dayLabel, kind: dayKind }
  })

  return {
    current: {
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      label,
      kind,
      isDay: c.is_day === 1,
      twilight,
      time: c.time,
    },
    hours,
    days,
  }
}
